const db = require('../db');
const userService = require('../services/userService');
const aiService = require('../services/aiService');
const bcrypt = require('bcryptjs');

async function getProfile(req, res, next) {
    try {
        const fullProfile = await userService.getFullUserProfile(req.user.id);
        res.json(fullProfile);
    } catch (err) {
        next(err);
    }
}

async function updateProfile(req, res, next) {
    try {
        const updated = await userService.updateProfile(req.user.id, req.body);
        res.json(updated);
    } catch (err) {
        next(err);
    }
}

// Get all matching peers with AI compatibility percentages
async function getPeers(req, res, next) {
    try {
        const userId = req.user.id;
        const usersRows = await db.query('SELECT * FROM users WHERE id != ? AND verified = 1', [userId]);
        const peers = [];

        for (const user of usersRows) {
            // Get skills
            const offer = await db.query("SELECT skill FROM user_skills WHERE userId = ? AND type = 'offer'", [user.id]);
            const learn = await db.query("SELECT skill FROM user_skills WHERE userId = ? AND type = 'learn'", [user.id]);
            
            let languagesList = [];
            try { languagesList = JSON.parse(user.languages || '[]'); } catch (e) {}

            let lacksInList = [];
            try { lacksInList = JSON.parse(user.lacksIn || '[]'); } catch (e) {}

            const peerObj = {
                id: user.id,
                name: user.name,
                email: user.email,
                study: user.studied || '',
                place: user.city || '',
                state: user.state || '',
                languages: languagesList,
                skillsOffer: offer.map(o => o.skill),
                skillsLearn: learn.map(l => l.skill),
                rating: user.rating,
                ratingsCount: user.ratingsCount,
                currentlyPosted: user.currentlyPosted || '',
                roleExpecting: user.roleExpecting || '',
                lacksIn: lacksInList,
                photo: user.photo || '',
                role: user.role,
                level: user.level,
                trustScore: user.trustScore
            };

            // Calculate matching score compatibility
            const matchDetails = aiService.getCompatibilityScore(req.user, peerObj);
            peerObj.matchScore = matchDetails.score;
            peerObj.matchReasoning = matchDetails.reasoning;

            peers.push(peerObj);
        }

        // Sort peers by compatibility match score descending
        res.json(peers.sort((a, b) => b.matchScore - a.matchScore));
    } catch (err) {
        next(err);
    }
}

// ==========================================
// ADMIN USER MANAGEMENT CONTROLLERS
// ==========================================

async function adminList(req, res, next) {
    try {
        const usersRows = await db.query('SELECT * FROM users ORDER BY id ASC');
        const list = [];
        for (const user of usersRows) {
            const offer = await db.query("SELECT skill FROM user_skills WHERE userId = ? AND type = 'offer'", [user.id]);
            const learn = await db.query("SELECT skill FROM user_skills WHERE userId = ? AND type = 'learn'", [user.id]);
            
            let parsedLangs = [];
            try { parsedLangs = JSON.parse(user.languages || '[]'); } catch (e) {}

            list.push({
                ...user,
                languages: parsedLangs,
                skillsOffer: offer.map(o => o.skill),
                skillsLearn: learn.map(l => l.skill)
            });
        }
        res.json(list);
    } catch (err) {
        next(err);
    }
}

async function adminAdd(req, res, next) {
    try {
        const {
            name, email, password, role, studied, city, state,
            credits, trustScore, languages, skillsOffer, skillsLearn
        } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const existing = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
        if (existing) {
            return res.status(400).json({ msg: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const parsedLangs = Array.isArray(languages) ? languages : (languages ? languages.split(',').map(s => s.trim()).filter(Boolean) : []);

        const result = await db.run(`
            INSERT INTO users (name, email, password, role, studied, city, state, credits, trustScore, languages, photo, entryExamCompleted, verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 1, 1)
        `, [
            name,
            normalizedEmail,
            hashedPassword,
            role || 'User',
            studied || '',
            city || '',
            state || '',
            parseInt(credits) || 50,
            parseInt(trustScore) || 750,
            JSON.stringify(parsedLangs)
        ]);

        const userId = result.id;

        // Insert skills offered & learned
        const parsedOffer = Array.isArray(skillsOffer) ? skillsOffer : (skillsOffer ? skillsOffer.split(',').map(s => s.trim()).filter(Boolean) : []);
        const parsedLearn = Array.isArray(skillsLearn) ? skillsLearn : (skillsLearn ? skillsLearn.split(',').map(s => s.trim()).filter(Boolean) : []);

        for (const skill of parsedOffer) {
            await db.run("INSERT INTO user_skills (userId, skill, type) VALUES (?, ?, 'offer')", [userId, skill]);
        }
        for (const skill of parsedLearn) {
            await db.run("INSERT INTO user_skills (userId, skill, type) VALUES (?, ?, 'learn')", [userId, skill]);
        }

        res.json({ msg: 'User added successfully from admin dashboard', userId });
    } catch (err) {
        next(err);
    }
}

async function adminEdit(req, res, next) {
    try {
        const { email } = req.params;
        const {
            name, newEmail, password, role, studied, city, state,
            credits, trustScore, languages, skillsOffer, skillsLearn
        } = req.body;

        const targetUser = await db.get('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (!targetUser) {
            return res.status(404).json({ msg: 'User profile not found' });
        }

        const userId = targetUser.id;

        // Compile fields to update
        let queryStr = `UPDATE users SET name = ?, role = ?, studied = ?, city = ?, state = ?, credits = ?, trustScore = ?`;
        const params = [
            name,
            role || 'User',
            studied || '',
            city || '',
            state || '',
            parseInt(credits) || 50,
            parseInt(trustScore) || 750
        ];

        if (newEmail && newEmail.toLowerCase() !== email.toLowerCase()) {
            const checkEmail = await db.get('SELECT id FROM users WHERE email = ?', [newEmail.trim().toLowerCase()]);
            if (checkEmail) {
                return res.status(400).json({ msg: 'New email address is already taken' });
            }
            queryStr += `, email = ?`;
            params.push(newEmail.trim().toLowerCase());
        }

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            queryStr += `, password = ?`;
            params.push(hashedPassword);
        }

        const parsedLangs = Array.isArray(languages) ? languages : (languages ? languages.split(',').map(s => s.trim()).filter(Boolean) : []);
        queryStr += `, languages = ? WHERE id = ?`;
        params.push(JSON.stringify(parsedLangs), userId);

        await db.run(queryStr, params);

        // Update skills
        await db.run("DELETE FROM user_skills WHERE userId = ?", [userId]);
        const parsedOffer = Array.isArray(skillsOffer) ? skillsOffer : (skillsOffer ? skillsOffer.split(',').map(s => s.trim()).filter(Boolean) : []);
        const parsedLearn = Array.isArray(skillsLearn) ? skillsLearn : (skillsLearn ? skillsLearn.split(',').map(s => s.trim()).filter(Boolean) : []);

        for (const skill of parsedOffer) {
            await db.run("INSERT INTO user_skills (userId, skill, type) VALUES (?, ?, 'offer')", [userId, skill]);
        }
        for (const skill of parsedLearn) {
            await db.run("INSERT INTO user_skills (userId, skill, type) VALUES (?, ?, 'learn')", [userId, skill]);
        }

        res.json({ msg: 'User profile updated successfully' });
    } catch (err) {
        next(err);
    }
}

async function adminDelete(req, res, next) {
    try {
        const { email } = req.params;
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedEmail === req.user.email.toLowerCase()) {
            return res.status(400).json({ msg: 'You cannot delete your own admin account!' });
        }

        const result = await db.run('DELETE FROM users WHERE email = ?', [normalizedEmail]);
        if (result.changes === 0) {
            return res.status(404).json({ msg: 'User profile not found' });
        }

        res.json({ msg: 'User profile deleted successfully' });
    } catch (err) {
        next(err);
    }
}

async function uploadAvatar(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        const relativePath = `/uploads/avatars/${req.file.filename}`;
        await db.run('UPDATE users SET photo = ? WHERE id = ?', [relativePath, req.user.id]);
        res.json({ msg: 'Avatar updated', photo: relativePath });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    getPeers,
    adminList,
    adminAdd,
    adminEdit,
    adminDelete,
    uploadAvatar
};
