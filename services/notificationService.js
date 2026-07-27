const db = require('../db');

async function createNotification(userId, title, message, type = 'info') {
    const result = await db.run(`
        INSERT INTO notifications (userId, title, message, type, readStatus)
        VALUES (?, ?, ?, ?, 0)
    `, [userId, title, message, type]);
    return result.id;
}

async function getUserNotifications(userId) {
    const rows = await db.query(`
        SELECT * FROM notifications 
        WHERE userId = ? 
        ORDER BY readStatus ASC, createdAt DESC
    `, [userId]);
    return rows;
}

async function markNotificationAsRead(notificationId, userId) {
    await db.run(`
        UPDATE notifications 
        SET readStatus = 1 
        WHERE id = ? AND userId = ?
    `, [notificationId, userId]);
}

async function markAllNotificationsAsRead(userId) {
    await db.run(`
        UPDATE notifications 
        SET readStatus = 1 
        WHERE userId = ? AND readStatus = 0
    `, [userId]);
}

module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};
