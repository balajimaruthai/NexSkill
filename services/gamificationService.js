const db = require('../db');
const logger = require('../utils/logger');

// Record XP and handle Level Up checking
async function awardXP(userId, amount) {
    const user = await db.get('SELECT xp, level, name FROM users WHERE id = ?', [userId]);
    if (!user) return null;

    const newXP = (user.xp || 0) + amount;
    
    // Level Up math: Level = Math.floor(sqrt(XP / 100)) + 1
    // e.g. Level 1: 0 - 99 XP, Level 2: 100 - 399 XP, Level 3: 400 - 899 XP, Level 4: 900+ XP etc.
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    let leveledUp = false;

    if (newLevel > user.level) {
        leveledUp = true;
        logger.info(`User ${user.name} leveled up to Level ${newLevel}!`);
        // Award level-up bonus: +30 credits, +20 trust score
        await db.run(`
            UPDATE users 
            SET xp = ?, level = ?, credits = credits + 30, trustScore = MIN(900, trustScore + 20)
            WHERE id = ?
        `, [newXP, newLevel, userId]);
        
        // Unlock achievement for level
        await unlockAchievement(userId, `lvl-${newLevel}`);
    } else {
        await db.run('UPDATE users SET xp = ? WHERE id = ?', [newXP, userId]);
    }

    return {
        xp: newXP,
        level: newLevel,
        leveledUp
    };
}

// Check and update activity streaks
async function updateActivityStreak(userId) {
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const streak = await db.get('SELECT * FROM streaks WHERE userId = ?', [userId]);
    if (!streak) {
        // Initial setup
        await db.run(`
            INSERT INTO streaks (userId, currentStreak, lastActivityDate, bestStreak)
            VALUES (?, 1, ?, 1)
        `, [userId, todayStr]);
        return { currentStreak: 1, bestStreak: 1 };
    }

    const lastDate = streak.lastActivityDate;
    if (lastDate === todayStr) {
        // Already logged activity today, no streak update needed
        return { currentStreak: streak.currentStreak, bestStreak: streak.bestStreak };
    }

    // Determine if last activity was yesterday
    const lastTime = new Date(lastDate).getTime();
    const todayTime = new Date(todayStr).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const diff = todayTime - lastTime;

    let newStreak = 1;
    if (diff <= oneDayMs + 1000) { // Slack space for timezone shift
        newStreak = streak.currentStreak + 1;
    }

    const newBest = Math.max(streak.bestStreak, newStreak);

    await db.run(`
        UPDATE streaks
        SET currentStreak = ?, lastActivityDate = ?, bestStreak = ?
        WHERE userId = ?
    `, [newStreak, todayStr, newBest, userId]);

    // Streak thresholds achievements check
    if (newStreak >= 3) {
        await unlockAchievement(userId, 'streak-starter');
    }
    if (newStreak >= 7) {
        await unlockAchievement(userId, 'week-warrior');
    }

    // Award streak bonus XP: +50 XP
    await awardXP(userId, 50);

    return { currentStreak: newStreak, bestStreak: newBest };
}

// Unlock badge achievements
async function unlockAchievement(userId, achievementId) {
    try {
        const existing = await db.get('SELECT id FROM achievements WHERE userId = ? AND achievementId = ?', [userId, achievementId]);
        if (existing) return false;

        await db.run('INSERT INTO achievements (userId, achievementId) VALUES (?, ?)', [userId, achievementId]);
        
        // Dispatch in-app notification
        const titles = {
            'lvl-2': 'Level 2 Ascended',
            'lvl-3': 'Level 3 Pro',
            'lvl-4': 'Level 4 Master',
            'streak-starter': 'Streak Starter',
            'week-warrior': '7-Day Warrior',
            'cert-expert': 'Certified Specialist',
            'super-mentor': 'Super Peer Mentor'
        };
        const messages = {
            'lvl-2': 'Congratulations! You reached Level 2 and earned +30 Credits!',
            'lvl-3': 'Congratulations! You reached Level 3 and earned +30 Credits!',
            'lvl-4': 'Outstanding! You reached Level 4 and earned +30 Credits!',
            'streak-starter': 'You logged active sessions 3 days in a row!',
            'week-warrior': '7-Day Streak achieved! You are a platform champion.',
            'cert-expert': 'Passed your first Adaptive AI MCQ Assessment!',
            'super-mentor': 'Successfully conducted and rated 3 peer swap sessions.'
        };

        const title = titles[achievementId] || 'Badge Unlocked';
        const msg = messages[achievementId] || `Earned achievement badge: ${achievementId}`;

        await db.run(`
            INSERT INTO notifications (userId, title, message, type, readStatus)
            VALUES (?, ?, ?, 'reward', 0)
        `, [userId, title, msg]);

        // Award achievement completion XP: +100 XP
        await awardXP(userId, 100);
        return true;
    } catch (e) {
        logger.error(`Unlock achievement failed: ${e.message}`);
        return false;
    }
}

// Get user achievements list
async function getUserAchievements(userId) {
    const rows = await db.query('SELECT achievementId, unlockedAt FROM achievements WHERE userId = ?', [userId]);
    return rows;
}

module.exports = {
    awardXP,
    updateActivityStreak,
    unlockAchievement,
    getUserAchievements
};
