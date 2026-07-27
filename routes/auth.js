const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateBody } = require('../middleware/validator');

const registerSchema = {
    name: { required: true, minLength: 2 },
    email: { required: true, type: 'email' },
    password: { required: true, minLength: 8 }
};

const loginSchema = {
    email: { required: true, type: 'email' },
    password: { required: true }
};

// @route   POST /api/auth/register
router.post('/register', validateBody(registerSchema), authController.register);

// @route   POST /api/auth/verify
router.post('/verify', authController.verify);

// @route   POST /api/auth/login
router.post('/login', validateBody(loginSchema), authController.login);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', authController.requestPasswordReset);

// @route   POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
