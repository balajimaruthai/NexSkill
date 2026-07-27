const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { upload } = require('../services/avatarService');

// @route   GET /api/users/profile
router.get('/profile', authenticateToken, userController.getProfile);

// @route   PUT /api/users/profile
router.put('/profile', authenticateToken, userController.updateProfile);

// @route   GET /api/users/peers
router.get('/peers', authenticateToken, userController.getPeers);

// ==========================================
// ADMIN ENDPOINTS (Restricted to Admin role)
// ==========================================

// @route   GET /api/users/admin/list
router.get('/admin/list', authenticateToken, requireAdmin, userController.adminList);

// @route   POST /api/users/admin/add
router.post('/admin/add', authenticateToken, requireAdmin, userController.adminAdd);

// @route   PUT /api/users/admin/edit/:email
router.put('/admin/edit/:email', authenticateToken, requireAdmin, userController.adminEdit);

// @route   DELETE /api/users/admin/delete/:email
router.delete('/admin/delete/:email', authenticateToken, requireAdmin, userController.adminDelete);

// @route   POST /api/users/avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
