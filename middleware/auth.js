const jwt = require('jsonwebtoken');
const db = require('../db');
const logger = require('../utils/logger');

// Central JWT Authentication Middleware
async function authenticateToken(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ msg: 'Token format is invalid' });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_skillswap_pro_2026');
        
        // Fetch user from DB to verify they exist
        const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.id]);
        if (!user) {
            return res.status(401).json({ msg: 'User does not exist' });
        }

        // Fetch user skills
        const skillsOfferRows = await db.query("SELECT skill FROM user_skills WHERE userId = ? AND type = 'offer'", [user.id]);
        const skillsLearnRows = await db.query("SELECT skill FROM user_skills WHERE userId = ? AND type = 'learn'", [user.id]);
        
        user.skillsOffer = skillsOfferRows.map(r => r.skill);
        user.skillsLearn = skillsLearnRows.map(r => r.skill);
        
        // Parse lists safely
        try { user.languages = JSON.parse(user.languages || '[]'); } catch (e) { user.languages = []; }
        try { user.lacksIn = JSON.parse(user.lacksIn || '[]'); } catch (e) { user.lacksIn = []; }

        // Fetch certifications
        const certs = await db.query('SELECT skill, level, date, score FROM certifications WHERE userId = ?', [user.id]);
        user.certifications = certs;

        // Fetch completed courses
        const comps = await db.query('SELECT videoId FROM completions WHERE userId = ?', [user.id]);
        user.completedCourses = comps.map(c => c.videoId);

        // Fetch connections
        const connectionsRows = await db.query(`
            SELECT DISTINCT CASE 
                WHEN senderId = ? THEN receiverId 
                ELSE senderId 
            END AS peerId
            FROM requests 
            WHERE (senderId = ? OR receiverId = ?) AND status = 'accepted'
        `, [user.id, user.id, user.id]);
        user.connections = connectionsRows.map(c => c.peerId);

        req.user = user;
        next();
    } catch (err) {
        logger.warn(`Auth token verification failed: ${err.message}`, { ip: req.ip });
        res.status(401).json({ msg: 'Token is not valid' });
    }
}

// Verify Admin Role Middleware
function requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'Admin') {
        return next();
    }
    return res.status(403).json({ msg: 'Access denied: Admin authorization required' });
}

// Verify Email Verification status Middleware
function requireVerified(req, res, next) {
    if (req.user && req.user.verified === 1) {
        return next();
    }
    return res.status(403).json({ msg: 'Email verification required. Please verify your account first.', isUnverified: true });
}

module.exports = {
    authenticateToken,
    requireAdmin,
    requireVerified
};
