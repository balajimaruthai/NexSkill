const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticateToken, requireAdmin, requireVerified } = require('../middleware/auth');

// @route   POST /api/progress/entry-exam
router.post('/entry-exam', authenticateToken, progressController.entryExam);

// @route   POST /api/progress/course
router.post('/course', authenticateToken, requireVerified, progressController.completeCourse);

// @route   POST /api/progress/assessment/start
router.post('/assessment/start', authenticateToken, requireVerified, progressController.startAdaptiveAssessment);

// @route   POST /api/progress/assessment/submit
router.post('/assessment/submit', authenticateToken, requireVerified, progressController.submitAdaptiveAssessment);

// ==========================================
// MCQ MANAGEMENT ENDPOINTS (Admin Restricted)
// ==========================================

// @route   GET /api/progress/mcqs
router.get('/mcqs', authenticateToken, progressController.getMCQs);

// @route   POST /api/progress/mcqs/track
router.post('/mcqs/track', authenticateToken, requireAdmin, progressController.createTrack);

// @route   POST /api/progress/mcqs/question
router.post('/mcqs/question', authenticateToken, requireAdmin, progressController.saveQuestion);

// @route   DELETE /api/progress/mcqs/question
router.delete('/mcqs/question', authenticateToken, requireAdmin, progressController.deleteQuestion);

module.exports = router;
