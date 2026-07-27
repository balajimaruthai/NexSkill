const db = require('../db');

// Compile a complete user profile payload including all child relationships
async function getFullUserProfile(userId) {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return null;

    const skillsOfferRows = await db.query("SELECT skill FROM user_skills WHERE userId = ? AND type = 'offer'", [userId]);
    const skillsLearnRows = await db.query("SELECT skill FROM user_skills WHERE userId = ? AND type = 'learn'", [userId]);
    
    user.skillsOffer = skillsOfferRows.map(r => r.skill);
    user.skillsLearn = skillsLearnRows.map(r => r.skill);

    try { user.languages = JSON.parse(user.languages || '[]'); } catch (e) { user.languages = []; }
    try { user.lacksIn = JSON.parse(user.lacksIn || '[]'); } catch (e) { user.lacksIn = []; }

    const certs = await db.query('SELECT skill, level, date, score FROM certifications WHERE userId = ?', [userId]);
    user.certifications = certs;

    const comps = await db.query('SELECT videoId FROM completions WHERE userId = ?', [userId]);
    user.completedCourses = comps.map(c => c.videoId);

    // Fetch active connections list (accepted swap requests)
    const connectionsRows = await db.query(`
        SELECT DISTINCT CASE 
            WHEN senderId = ? THEN receiverId 
            ELSE senderId 
        END AS peerId
        FROM requests 
        WHERE (senderId = ? OR receiverId = ?) AND status = 'accepted'
    `, [userId, userId, userId]);
    user.connections = connectionsRows.map(c => c.peerId);

    // Remove password hash from response payload
    delete user.password;
    return user;
}

// Update profile details
async function updateProfile(userId, body) {
    const { name, studied, city, state, languages, skillsOffer, skillsLearn, photo } = body;

    const parsedLangs = Array.isArray(languages) ? languages : (languages ? languages.split(',').map(s => s.trim()).filter(Boolean) : []);
    
    await db.run(`
        UPDATE users
        SET name = ?, studied = ?, city = ?, state = ?, languages = ?, photo = CASE WHEN ? != '' THEN ? ELSE photo END
        WHERE id = ?
    `, [
        name,
        studied,
        city,
        state,
        JSON.stringify(parsedLangs),
        photo || '',
        photo || '',
        userId
    ]);

    // Update skills offered/learned
    if (skillsOffer !== undefined) {
        await db.run("DELETE FROM user_skills WHERE userId = ? AND type = 'offer'", [userId]);
        const parsedOffer = Array.isArray(skillsOffer) ? skillsOffer : skillsOffer.split(',').map(s => s.trim()).filter(Boolean);
        for (const skill of parsedOffer) {
            await db.run("INSERT INTO user_skills (userId, skill, type) VALUES (?, ?, 'offer')", [userId, skill]);
        }
    }

    if (skillsLearn !== undefined) {
        await db.run("DELETE FROM user_skills WHERE userId = ? AND type = 'learn'", [userId]);
        const parsedLearn = Array.isArray(skillsLearn) ? skillsLearn : skillsLearn.split(',').map(s => s.trim()).filter(Boolean);
        for (const skill of parsedLearn) {
            await db.run("INSERT INTO user_skills (userId, skill, type) VALUES (?, ?, 'learn')", [userId, skill]);
        }
    }

    return getFullUserProfile(userId);
}

module.exports = {
    getFullUserProfile,
    updateProfile
};
