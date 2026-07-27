const authService = require('../services/authService');
const userService = require('../services/userService');

async function register(req, res, next) {
    try {
        const result = await authService.registerUser(req.body);
        res.json({
            msg: 'Registration initiated! Please check your email for the 6-digit verification code.',
            email: result.email
        });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
}

async function verify(req, res, next) {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ msg: 'Please provide email and verification code.' });
        }

        const result = await authService.verifyAccount(email, code);
        res.json({
            msg: 'Account successfully verified! Credentials unlocked.',
            token: result.token
        });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password, req.ip, req.headers['user-agent']);
        
        // Fetch full profile info to send back
        const userProfile = await userService.getFullUserProfile(result.user.id);

        res.json({
            token: result.token,
            user: userProfile
        });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
}

async function requestPasswordReset(req, res, next) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ msg: 'Please enter your email address.' });
        
        const resetCode = await authService.requestPasswordReset(email);
        res.json({
            msg: 'A password reset code has been sent to your email address.',
        });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
}

async function resetPassword(req, res, next) {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ msg: 'Please provide email, OTP code, and new password.' });
        }

        await authService.resetPassword(email, code, newPassword);
        res.json({ msg: 'Password has been reset successfully! You can now log back into your account.' });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
}

module.exports = {
    register,
    verify,
    login,
    requestPasswordReset,
    resetPassword
};
