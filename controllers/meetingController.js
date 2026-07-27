const db = require('../db');
const userService = require('../services/userService');
const notificationService = require('../services/notificationService');
const gamificationService = require('../services/gamificationService');
const emailService = require('../services/emailService');

async function getMeetings(req, res, next) {
    try {
        const userId = req.user.id;
        const sql = `
            SELECT m.*,
                   su.name AS senderName, su.studied AS senderStudy, su.photo AS senderPhoto, su.email AS senderEmail,
                   ru.name AS receiverName, ru.studied AS receiverStudy, ru.photo AS receiverPhoto, ru.email AS receiverEmail
            FROM meetings m
            JOIN users su ON m.senderId = su.id
            JOIN users ru ON m.receiverId = ru.id
            WHERE m.senderId = ? OR m.receiverId = ?
            ORDER BY m.createdAt DESC
        `;

        const rows = await db.query(sql, [userId, userId]);
        const meetings = rows.map(row => {
            const isSender = row.senderId === userId;
            return {
                id: row.id,
                peerId: isSender ? row.receiverId : row.senderId,
                peerName: isSender ? row.receiverName : row.senderName,
                peerStudy: isSender ? row.receiverStudy : row.senderStudy,
                peerPhoto: isSender ? row.receiverPhoto : row.senderPhoto,
                peerEmail: isSender ? row.receiverEmail : row.senderEmail,
                skill: row.skill,
                date: row.date,
                time: row.time,
                meetLink: row.meetLink,
                status: row.status,
                ratingSubmitted: !!row.ratingSubmitted,
                starRating: row.starRating,
                feedbackComment: row.feedbackComment
            };
        });

        res.json(meetings);
    } catch (err) {
        next(err);
    }
}

async function scheduleMeeting(req, res, next) {
    try {
        const { peerId, skill, date, time } = req.body;
        const userId = req.user.id;

        if (!peerId || !skill || !date || !time) {
            return res.status(400).json({ msg: 'Please provide peerId, skill, date, and time' });
        }

        const currentUser = await db.get('SELECT credits, name FROM users WHERE id = ?', [userId]);
        if (currentUser.credits < 10) {
            return res.status(400).json({ msg: 'Insufficient credits! Bookings cost 10 credits.' });
        }

        const peerUser = await db.get('SELECT name FROM users WHERE id = ?', [peerId]);
        if (!peerUser) return res.status(404).json({ msg: 'Peer user not found' });

        // Generate Jitsi Meet link (simulated secure coordinate link)
        const code = Math.random().toString(36).substring(2, 7) + '-' + Math.random().toString(36).substring(2, 7);
        const meetLink = `https://meet.jit.si/nexskill-${code}`;

        // Deduct credits and save
        await db.run('UPDATE users SET credits = credits - 10 WHERE id = ?', [userId]);

        const result = await db.run(`
            INSERT INTO meetings (senderId, receiverId, skill, date, time, meetLink, status, ratingSubmitted)
            VALUES (?, ?, ?, ?, ?, ?, 'scheduled', 0)
        `, [userId, peerId, skill, date, time, meetLink]);

        // Dispatch notifications & reward XP
        await notificationService.createNotification(
            peerId,
            'Meeting Scheduled',
            `${currentUser.name} has scheduled a 1-on-1 swap session in ${skill} on ${date} at ${time}.`,
            'meeting'
        );

        // Send email reminder to the peer
        const peerFull = await db.get('SELECT email FROM users WHERE id = ?', [peerId]);
        if (peerFull) {
            emailService.sendMeetingReminderEmail(peerFull.email, peerUser.name, {
                skill, date, time, meetLink, partnerName: currentUser.name
            }).catch(e => console.error('Meeting email error:', e.message));
        }

        await gamificationService.awardXP(userId, 30);
        await gamificationService.updateActivityStreak(userId);

        const updatedProfile = await userService.getFullUserProfile(userId);
        res.json({
            msg: 'Meeting scheduled successfully!',
            meetingId: result.id,
            user: updatedProfile
        });
    } catch (err) {
        next(err);
    }
}

async function markCompleted(req, res, next) {
    try {
        const meetingId = req.params.id;
        const userId = req.user.id;

        const meeting = await db.get('SELECT * FROM meetings WHERE id = ?', [meetingId]);
        if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });

        if (meeting.senderId !== userId && meeting.receiverId !== userId) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await db.run("UPDATE meetings SET status = 'completed' WHERE id = ?", [meetingId]);
        
        const peerId = meeting.senderId === userId ? meeting.receiverId : meeting.senderId;
        await notificationService.createNotification(
            peerId,
            'Session Marked Completed',
            `Your lesson in ${meeting.skill} has been marked completed. Please leave a rating and feedback review.`,
            'meeting'
        );

        res.json({ msg: 'Meeting status marked completed successfully.' });
    } catch (err) {
        next(err);
    }
}

async function submitRate(req, res, next) {
    try {
        const meetingId = req.params.id;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ msg: 'Please select a rating between 1 and 5 stars.' });
        }

        const meeting = await db.get('SELECT * FROM meetings WHERE id = ?', [meetingId]);
        if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });

        if (meeting.senderId !== userId && meeting.receiverId !== userId) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        if (!!meeting.ratingSubmitted) {
            return res.status(400).json({ msg: 'Feedback already submitted for this session.' });
        }

        const isSender = meeting.senderId === userId;
        const peerId = isSender ? meeting.receiverId : meeting.senderId;

        // Fetch peer data to update their overall rating
        const peer = await db.get('SELECT rating, ratingsCount FROM users WHERE id = ?', [peerId]);
        if (peer) {
            const newCount = peer.ratingsCount + 1;
            const newRating = ((peer.rating * peer.ratingsCount) + parseInt(rating)) / newCount;
            await db.run('UPDATE users SET rating = ?, ratingsCount = ? WHERE id = ?', [newRating, newCount, peerId]);
        }

        // Save rating feedback on meeting record
        await db.run(`
            UPDATE meetings 
            SET ratingSubmitted = 1, starRating = ?, feedbackComment = ?
            WHERE id = ?
        `, [parseInt(rating), comment || '', meetingId]);

        // Reward current user: +15 credits, +10 trust score, calculate level
        const currentUser = await db.get('SELECT credits, trustScore FROM users WHERE id = ?', [userId]);
        const newCredits = currentUser.credits + 15;
        const newTrust = Math.min(900, currentUser.trustScore + 10);

        // Fetch total meetings rated by user to update level
        const ratedCount = await db.get(`
            SELECT COUNT(*) AS count 
            FROM meetings 
            WHERE (senderId = ? OR receiverId = ?) AND ratingSubmitted = 1
        `, [userId, userId]);

        const newLevel = Math.min(10, Math.floor((ratedCount.count / 3) + 1));

        await db.run(`
            UPDATE users 
            SET credits = ?, trustScore = ?, level = ?
            WHERE id = ?
        `, [newCredits, newTrust, newLevel, userId]);

        // Reward Gamification XP: +100 XP for rating
        await gamificationService.awardXP(userId, 100);
        await gamificationService.updateActivityStreak(userId);

        // Verify "super-mentor" achievement badge (completed & rated 3 meetings)
        if (ratedCount.count >= 3) {
            await gamificationService.unlockAchievement(userId, 'super-mentor');
        }

        const updatedProfile = await userService.getFullUserProfile(userId);

        res.json({
            msg: 'Feedback submitted! Reward credits (+15) and XP (+100) credited.',
            user: updatedProfile
        });
    } catch (err) {
        next(err);
    }
}

// ==========================================
// ADMIN MEETING CONTROLLERS
// ==========================================

async function adminList(req, res, next) {
    try {
        const sql = `
            SELECT m.*,
                   su.name AS senderName, su.email AS senderEmail, su.studied AS senderStudy, su.photo AS senderPhoto,
                   ru.name AS receiverName, ru.email AS receiverEmail, ru.studied AS receiverStudy, ru.photo AS receiverPhoto
            FROM meetings m
            JOIN users su ON m.senderId = su.id
            JOIN users ru ON m.receiverId = ru.id
            ORDER BY m.createdAt DESC
        `;
        const rows = await db.query(sql);
        res.json(rows);
    } catch (err) {
        next(err);
    }
}

async function adminEdit(req, res, next) {
    try {
        const meetingId = req.params.id;
        const { date, time, meetLink, status } = req.body;

        const meeting = await db.get('SELECT * FROM meetings WHERE id = ?', [meetingId]);
        if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });

        await db.run(`
            UPDATE meetings
            SET date = ?, time = ?, meetLink = ?, status = ?
            WHERE id = ?
        `, [
            date !== undefined ? date : meeting.date,
            time !== undefined ? time : meeting.time,
            meetLink !== undefined ? meetLink : meeting.meetLink,
            status !== undefined ? status : meeting.status,
            meetingId
        ]);

        res.json({ msg: 'Meeting updated successfully' });
    } catch (err) {
        next(err);
    }
}

async function adminDelete(req, res, next) {
    try {
        const meetingId = req.params.id;
        const result = await db.run('DELETE FROM meetings WHERE id = ?', [meetingId]);
        if (result.changes === 0) {
            return res.status(404).json({ msg: 'Meeting not found' });
        }
        res.json({ msg: 'Meeting deleted successfully from admin panel' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getMeetings,
    scheduleMeeting,
    markCompleted,
    submitRate,
    adminList,
    adminEdit,
    adminDelete
};
