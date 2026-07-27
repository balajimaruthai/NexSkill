const db = require('../db');
const aiService = require('./aiService');

// Save a new message
async function saveMessage(senderId, receiverId, message, mediaUrl = '', mediaType = '', repliedToId = null) {
    // 1. Moderate content
    let flagged = 0;
    if (message) {
        const mod = aiService.performContentModeration(message);
        if (mod.flagged) {
            flagged = 1;
            // Record toxic log or prefix warning
            message = `⚠️ [Flagged Content]: ${message}`;
        }
    }

    const result = await db.run(`
        INSERT INTO messages (senderId, receiverId, message, mediaUrl, mediaType, repliedToId, readStatus)
        VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [senderId, receiverId, message, mediaUrl, mediaType, repliedToId]);

    return {
        id: result.id,
        senderId,
        receiverId,
        message,
        mediaUrl,
        mediaType,
        repliedToId,
        flagged,
        readStatus: 0,
        createdAt: new Date().toISOString()
    };
}

// Get all messages between two users
async function getChatHistory(userId, peerId) {
    const sql = `
        SELECT m.*, 
               su.name AS senderName, su.photo AS senderPhoto,
               ru.name AS receiverName, ru.photo AS receiverPhoto
        FROM messages m
        JOIN users su ON m.senderId = su.id
        JOIN users ru ON m.receiverId = ru.id
        WHERE (m.senderId = ? AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = ?)
        ORDER BY m.createdAt ASC
    `;
    const rows = await db.query(sql, [userId, peerId, peerId, userId]);
    
    return rows.map(r => {
        let parsedReactions = {};
        try {
            parsedReactions = JSON.parse(r.reactions || '{}');
        } catch (e) {
            parsedReactions = {};
        }
        return {
            ...r,
            reactions: parsedReactions
        };
    });
}

// Add an emoji reaction to a message
async function addMessageReaction(messageId, userId, emoji) {
    const msg = await db.get('SELECT reactions FROM messages WHERE id = ?', [messageId]);
    if (!msg) return null;

    let reactions = {};
    try {
        reactions = JSON.parse(msg.reactions || '{}');
    } catch (e) {
        reactions = {};
    }

    // Toggle reaction: if user already reacted with this emoji, remove it. Otherwise add it.
    if (!reactions[emoji]) {
        reactions[emoji] = [];
    }

    const idx = reactions[emoji].indexOf(userId);
    if (idx !== -1) {
        reactions[emoji].splice(idx, 1);
        if (reactions[emoji].length === 0) {
            delete reactions[emoji];
        }
    } else {
        reactions[emoji].push(userId);
    }

    const updatedStr = JSON.stringify(reactions);
    await db.run('UPDATE messages SET reactions = ? WHERE id = ?', [updatedStr, messageId]);
    return reactions;
}

// Mark messages from peer as read
async function markAsRead(userId, peerId) {
    await db.run(`
        UPDATE messages
        SET readStatus = 1
        WHERE senderId = ? AND receiverId = ? AND readStatus = 0
    `, [peerId, userId]);
}

// Get active conversations list for user
async function getConversations(userId) {
    const sql = `
        SELECT DISTINCT CASE 
            WHEN senderId = ? THEN receiverId 
            ELSE senderId 
        END AS peerId
        FROM messages
        WHERE senderId = ? OR receiverId = ?
    `;
    const rows = await db.query(sql, [userId, userId, userId]);
    const peers = [];

    for (const r of rows) {
        const peer = await db.get('SELECT id, name, email, photo, trustScore, rating FROM users WHERE id = ?', [r.peerId]);
        if (peer) {
            // Count unread messages
            const unread = await db.get(`
                SELECT COUNT(*) AS count 
                FROM messages 
                WHERE senderId = ? AND receiverId = ? AND readStatus = 0
            `, [peer.id, userId]);
            
            // Get last message
            const lastMsg = await db.get(`
                SELECT message, createdAt 
                FROM messages 
                WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
                ORDER BY createdAt DESC LIMIT 1
            `, [userId, peer.id, peer.id, userId]);

            peers.push({
                id: peer.id,
                name: peer.name,
                email: peer.email,
                photo: peer.photo,
                trustScore: peer.trustScore,
                rating: peer.rating,
                unreadCount: unread.count,
                lastMessage: lastMsg ? lastMsg.message : '',
                lastMessageTime: lastMsg ? lastMsg.createdAt : ''
            });
        }
    }
    
    // Sort by last message time
    return peers.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
}

module.exports = {
    saveMessage,
    getChatHistory,
    addMessageReaction,
    markAsRead,
    getConversations
};
