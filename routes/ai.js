const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken, requireAdmin, requireVerified } = require('../middleware/auth');

// @route   GET /api/ai/roadmap
router.get('/roadmap', authenticateToken, requireVerified, aiController.getRoadmap);

// @route   POST /api/ai/resume
router.post('/resume', authenticateToken, requireVerified, aiController.reviewResume);

// @route   POST /api/ai/interview/start
router.post('/interview/start', authenticateToken, requireVerified, aiController.startInterview);

// @route   POST /api/ai/interview/submit
router.post('/interview/submit', authenticateToken, requireVerified, aiController.submitInterview);

// @route   GET /api/ai/admin/diagnostics
router.get('/admin/diagnostics', authenticateToken, requireAdmin, aiController.getAdminDiagnostics);

module.exports = router;
