const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken, requireAdmin, requireVerified } = require('../middleware/auth');

// @route   GET /api/requests
router.get('/', authenticateToken, requestController.getRequests);

// @route   POST /api/requests
router.post('/', authenticateToken, requireVerified, requestController.sendRequest);

// @route   POST /api/requests/:id/action (handles accept/reject)
router.post('/:id/action', authenticateToken, requireVerified, requestController.handleAction);

// ==========================================
// ADMIN ENDPOINTS (Restricted to Admin role)
// ==========================================

// @route   GET /api/requests/admin/list
router.get('/admin/list', authenticateToken, requireAdmin, requestController.adminList);

// @route   DELETE /api/requests/admin/:id
router.delete('/admin/:id', authenticateToken, requireAdmin, requestController.adminDelete);

module.exports = router;
