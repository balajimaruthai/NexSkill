const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken, requireVerified } = require('../middleware/auth');

// @route   GET /api/chat/history/:peerId
router.get('/history/:peerId', authenticateToken, requireVerified, chatController.getHistory);

// @route   POST /api/chat/message
router.post('/message', authenticateToken, requireVerified, chatController.sendMessage);

// @route   POST /api/chat/react
router.post('/react', authenticateToken, requireVerified, chatController.reactMessage);

// @route   GET /api/chat/conversations
router.get('/conversations', authenticateToken, requireVerified, chatController.getActiveConversations);

module.exports = router;
