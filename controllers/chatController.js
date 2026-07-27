const chatService = require('../services/chatService');
const gamificationService = require('../services/gamificationService');

async function getHistory(req, res, next) {
    try {
        const userId = req.user.id;
        const peerId = req.params.peerId;
        if (!peerId) return res.status(400).json({ msg: 'Please provide peerId.' });

        const history = await chatService.getChatHistory(userId, peerId);
        
        // Mark these incoming messages as read
        await chatService.markAsRead(userId, peerId);

        res.json(history);
    } catch (err) {
        next(err);
    }
}

async function sendMessage(req, res, next) {
    try {
        const senderId = req.user.id;
        const { receiverId, message, mediaUrl, mediaType, repliedToId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ msg: 'Please provide receiverId.' });
        }
        if (!message && !mediaUrl) {
            return res.status(400).json({ msg: 'Cannot send empty message.' });
        }

        const msgObj = await chatService.saveMessage(
            senderId,
            receiverId,
            message,
            mediaUrl || '',
            mediaType || '',
            repliedToId || null
        );

        // Award chat activity XP: +10 XP
        await gamificationService.awardXP(senderId, 10);
        await gamificationService.updateActivityStreak(senderId);

        res.json(msgObj);
    } catch (err) {
        next(err);
    }
}

async function reactMessage(req, res, next) {
    try {
        const userId = req.user.id;
        const { messageId, emoji } = req.body;

        if (!messageId || !emoji) {
            return res.status(400).json({ msg: 'Please provide messageId and emoji.' });
        }

        const updatedReactions = await chatService.addMessageReaction(messageId, userId, emoji);
        if (!updatedReactions) {
            return res.status(404).json({ msg: 'Message not found.' });
        }

        res.json({ msg: 'Reaction toggled successfully!', reactions: updatedReactions });
    } catch (err) {
        next(err);
    }
}

async function getActiveConversations(req, res, next) {
    try {
        const userId = req.user.id;
        const conversations = await chatService.getConversations(userId);
        res.json(conversations);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getHistory,
    sendMessage,
    reactMessage,
    getActiveConversations
};
