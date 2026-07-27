const db = require('../db');
const notificationService = require('../services/notificationService');
const gamificationService = require('../services/gamificationService');

async function getRequests(req, res, next) {
    try {
        const userId = req.user.id;
        const sql = `
            SELECT r.*, 
                   su.name AS senderName, su.studied AS senderStudy, su.photo AS senderPhoto, su.email AS senderEmail,
                   ru.name AS receiverName, ru.studied AS receiverStudy, ru.photo AS receiverPhoto, ru.email AS receiverEmail
            FROM requests r
            JOIN users su ON r.senderId = su.id
            JOIN users ru ON r.receiverId = ru.id
            WHERE r.senderId = ? OR r.receiverId = ?
            ORDER BY r.createdAt DESC
        `;

        const rows = await db.query(sql, [userId, userId]);
        const received = [];
        const sent = [];

        for (const row of rows) {
            const formatted = {
                id: row.id,
                senderId: row.senderId,
                receiverId: row.receiverId,
                skill: row.skill,
                status: row.status,
                date: new Date(row.createdAt).toLocaleDateString()
            };

            if (row.receiverId === userId) {
                formatted.peerName = row.senderName;
                formatted.peerStudy = row.senderStudy;
                formatted.peerPhoto = row.senderPhoto;
                formatted.peerEmail = row.senderEmail;
                received.push(formatted);
            } else {
                formatted.peerName = row.receiverName;
                formatted.peerStudy = row.receiverStudy;
                formatted.peerPhoto = row.receiverPhoto;
                formatted.peerEmail = row.receiverEmail;
                sent.push(formatted);
            }
        }

        res.json({ received, sent });
    } catch (err) {
        next(err);
    }
}

async function sendRequest(req, res, next) {
    try {
        const { receiverId, skill } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !skill) {
            return res.status(400).json({ msg: 'Please provide receiverId and skill' });
        }

        if (parseInt(receiverId) === senderId) {
            return res.status(400).json({ msg: 'You cannot send a swap request to yourself!' });
        }

        const receiver = await db.get('SELECT id, name FROM users WHERE id = ?', [receiverId]);
        if (!receiver) {
            return res.status(404).json({ msg: 'Peer not found' });
        }

        const existing = await db.get(`
            SELECT id FROM requests 
            WHERE ((senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)) 
              AND status IN ('pending', 'accepted')
        `, [senderId, receiverId, receiverId, senderId]);

        if (existing) {
            return res.status(400).json({ msg: 'A connection request is already pending or established.' });
        }

        const result = await db.run(`
            INSERT INTO requests (senderId, receiverId, skill, status)
            VALUES (?, ?, ?, 'pending')
        `, [senderId, receiverId, skill]);

        // Dispatch notification and award XP
        await notificationService.createNotification(
            receiverId,
            'New Swap Request',
            `${req.user.name} wants to connect with you to exchange skills in ${skill}.`,
            'match'
        );

        await gamificationService.awardXP(senderId, 20); // Award 20 XP for connecting activity
        await gamificationService.updateActivityStreak(senderId);

        res.json({ msg: 'Swap request sent successfully', requestId: result.id });
    } catch (err) {
        next(err);
    }
}

async function handleAction(req, res, next) {
    try {
        const requestId = req.params.id;
        const { action } = req.body; // 'accepted' or 'rejected'
        const userId = req.user.id;

        if (!['accepted', 'rejected'].includes(action)) {
            return res.status(400).json({ msg: 'Invalid action. Must be accepted or rejected.' });
        }

        const request = await db.get('SELECT * FROM requests WHERE id = ?', [requestId]);
        if (!request) return res.status(404).json({ msg: 'Request not found' });

        if (request.receiverId !== userId) {
            return res.status(403).json({ msg: 'Not authorized to perform this action.' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ msg: `Request has already been ${request.status}` });
        }

        await db.run('UPDATE requests SET status = ? WHERE id = ?', [action, requestId]);

        // Dispatch notifications
        await notificationService.createNotification(
            request.senderId,
            `Request ${action === 'accepted' ? 'Approved' : 'Declined'}`,
            `${req.user.name} has ${action} your skill swap connection request for ${request.skill}.`,
            action === 'accepted' ? 'match' : 'info'
        );

        if (action === 'accepted') {
            // Reward receiver +50 XP and sender +50 XP
            await gamificationService.awardXP(userId, 50);
            await gamificationService.awardXP(request.senderId, 50);
            await gamificationService.updateActivityStreak(userId);
            await gamificationService.updateActivityStreak(request.senderId);
        }

        res.json({ msg: `Request has been ${action} successfully` });
    } catch (err) {
        next(err);
    }
}

// ==========================================
// ADMIN REQUEST CONTROLLERS
// ==========================================

async function adminList(req, res, next) {
    try {
        const sql = `
            SELECT r.*,
                   su.name AS senderName, su.email AS senderEmail, su.studied AS senderStudy, su.photo AS senderPhoto,
                   ru.name AS receiverName, ru.email AS receiverEmail, ru.studied AS receiverStudy, ru.photo AS receiverPhoto
            FROM requests r
            JOIN users su ON r.senderId = su.id
            JOIN users ru ON r.receiverId = ru.id
            ORDER BY r.createdAt DESC
        `;
        const rows = await db.query(sql);
        res.json(rows);
    } catch (err) {
        next(err);
    }
}

async function adminDelete(req, res, next) {
    try {
        const requestId = req.params.id;
        const result = await db.run('DELETE FROM requests WHERE id = ?', [requestId]);
        if (result.changes === 0) {
            return res.status(404).json({ msg: 'Request not found' });
        }
        res.json({ msg: 'Request deleted successfully from admin panel' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getRequests,
    sendRequest,
    handleAction,
    adminList,
    adminDelete
};
