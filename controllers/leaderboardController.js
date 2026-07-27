const db = require('../db');

async function getLeaderboard(req, res, next) {
    try {
        const sort = req.query.sort || 'xp';
        let orderBy;

        if (sort === 'rating') {
            orderBy = 'rating DESC, ratingsCount DESC';
        } else if (sort === 'streak') {
            orderBy = 'streak DESC, xp DESC';
        } else {
            orderBy = 'xp DESC, level DESC';
        }

        const sql = `
            SELECT id, name, email, photo, studied, city, state, 
                   xp, level, rating, ratingsCount, streak, trustScore
            FROM users 
            WHERE verified = 1 
            ORDER BY ${orderBy} 
            LIMIT 50
        `;

        const users = await db.query(sql);

        const leaderboard = users.map(u => ({
            id: u.id,
            name: u.name,
            photo: u.photo || '',
            study: u.studied || '',
            xp: u.xp || 0,
            level: u.level || 1,
            rating: u.rating || 5,
            ratingsCount: u.ratingsCount || 0,
            streak: u.streak || 0,
            trustScore: u.trustScore || 750
        }));

        res.json(leaderboard);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getLeaderboard
};
