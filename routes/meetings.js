const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authenticateToken, requireAdmin, requireVerified } = require('../middleware/auth');

// @route   GET /api/meetings
router.get('/', authenticateToken, meetingController.getMeetings);

// @route   POST /api/meetings
router.post('/', authenticateToken, requireVerified, meetingController.scheduleMeeting);

// @route   POST /api/meetings/:id/complete
router.post('/:id/complete', authenticateToken, requireVerified, meetingController.markCompleted);

// @route   POST /api/meetings/:id/rate
router.post('/:id/rate', authenticateToken, requireVerified, meetingController.submitRate);

// ==========================================
// ADMIN ENDPOINTS (Restricted to Admin role)
// ==========================================

// @route   GET /api/meetings/admin/list
router.get('/admin/list', authenticateToken, requireAdmin, meetingController.adminList);

// @route   PUT /api/meetings/admin/:id
router.put('/admin/:id', authenticateToken, requireAdmin, meetingController.adminEdit);

// @route   DELETE /api/meetings/admin/:id
router.delete('/admin/:id', authenticateToken, requireAdmin, meetingController.adminDelete);

module.exports = router;
