const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const logger = require('../utils/logger');
const { generateOTP } = require('../utils/helpers');
const emailService = require('./emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_nexskill_2026';

// Register User (OTP verification stage)
async function registerUser(payload) {
    const { name, email, password, studied, city, state, languages, skillsOffer, skillsLearn, photo } = payload;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
        throw new Error('Email is already registered.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateOTP();

    // Insert user as unverified
    const result = await db.run(`
        INSERT INTO users (name, email, password, studied, city, state, languages, photo, role, entryExamCompleted, verified, verificationCode, credits, trustScore, xp, level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'User', 0, 0, ?, 50, 750, 0, 1)
    `, [
        name,
        normalizedEmail,
        hashedPassword,
        studied || '',
        city || '',
        state || '',
        JSON.stringify(languages || []),
        photo || '',
        verificationCode
    ]);

    const userId = result.id;

    // Seed skills mapping
    for (const skill of (skillsOffer || [])) {
        await db.run("INSERT INTO user_skills (userId, skill, type) VALUES (?, ?, 'offer')", [userId, skill]);
    }
    for (const skill of (skillsLearn || [])) {
        await db.run("INSERT INTO user_skills (userId, skill, type) VALUES (?, ?, 'learn')", [userId, skill]);
    }

    // Write audit log
    await db.run('INSERT INTO audit_logs (userId, action) VALUES (?, ?)', [userId, 'User Registered (Verification Pending)']);
    
    // Send verification email (fire-and-forget; don't block registration)
    emailService.sendVerificationEmail(normalizedEmail, name, verificationCode)
        .catch(err => logger.error(`Email send error: ${err.message}`));

    logger.info(`User registered: ${normalizedEmail}. Verification code dispatched via email.`);

    return {
        userId,
        email: normalizedEmail
        // Note: verificationCode no longer returned in response for security
    };
}

// Verify User Account via OTP code
async function verifyAccount(email, code) {
    const normalized = email.trim().toLowerCase();
    const user = await db.get('SELECT id, verificationCode, verified FROM users WHERE email = ?', [normalized]);
    
    if (!user) throw new Error('User not found.');
    if (user.verified === 1) return { msg: 'Account already verified.' };

    if (user.verificationCode !== code) {
        throw new Error('Verification code is invalid.');
    }

    await db.run(`
        UPDATE users 
        SET verified = 1, verificationCode = NULL, credits = credits + 20, trustScore = trustScore + 30 
        WHERE id = ?
    `, [user.id]);

    await db.run('INSERT INTO audit_logs (userId, action) VALUES (?, ?)', [user.id, 'Account Email Verified']);
    logger.info(`Account verified successfully: ${normalized}`);

    // Send welcome email (fire-and-forget)
    const verifiedUser = await db.get('SELECT name, email FROM users WHERE id = ?', [user.id]);
    if (verifiedUser) {
        emailService.sendWelcomeEmail(verifiedUser.email, verifiedUser.name)
            .catch(err => logger.error(`Welcome email error: ${err.message}`));
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return { token };
}

// Authenticate Login with brute-force protection
async function loginUser(email, password, ip = '', userAgent = '') {
    const normalized = email.trim().toLowerCase();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [normalized]);
    if (!user) {
        throw new Error('Invalid email or password.');
    }

    const now = Date.now();
    // Brute force lockout check
    if (user.failedLoginAttempts >= 5 && user.lockUntil > now) {
        const remainingMin = Math.round((user.lockUntil - now) / 60000);
        throw new Error(`Account temporarily locked. Please retry in ${remainingMin} minutes.`);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const newAttempts = (user.failedLoginAttempts || 0) + 1;
        let lockTime = 0;
        
        if (newAttempts >= 5) {
            lockTime = now + (15 * 60 * 1000); // 15 minutes lock
            logger.warn(`Account locked due to brute force: ${normalized}`);
        }

        await db.run('UPDATE users SET failedLoginAttempts = ?, lockUntil = ? WHERE id = ?', [newAttempts, lockTime, user.id]);
        throw new Error('Invalid email or password.');
    }

    // Success: Reset failed attempts
    await db.run('UPDATE users SET failedLoginAttempts = 0, lockUntil = 0 WHERE id = ?', [user.id]);
    await db.run('INSERT INTO audit_logs (userId, action, ipAddress, userAgent) VALUES (?, ?, ?, ?)', [
        user.id, 'User Login Success', ip, userAgent
    ]);

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return { token, user };
}

// Request Password Reset
async function requestPasswordReset(email) {
    const normalized = email.trim().toLowerCase();
    const user = await db.get('SELECT id FROM users WHERE email = ?', [normalized]);
    if (!user) throw new Error('Email is not registered.');

    const resetCode = generateOTP();
    await db.run('UPDATE users SET resetPasswordCode = ? WHERE id = ?', [resetCode, user.id]);
    await db.run('INSERT INTO audit_logs (userId, action) VALUES (?, ?)', [user.id, 'Password Reset Requested']);
    
    logger.info(`Password reset requested for: ${normalized}. Code dispatched via email.`);

    // Send reset code via email (fire-and-forget)
    const user2 = await db.get('SELECT name FROM users WHERE email = ?', [normalized]);
    emailService.sendPasswordResetEmail(normalized, user2?.name || 'User', resetCode)
        .catch(err => logger.error(`Reset email error: ${err.message}`));

    return resetCode; // still returned for admin/dev testing convenience
}

// Reset Password with code
async function resetPassword(email, code, newPassword) {
    const normalized = email.trim().toLowerCase();
    const user = await db.get('SELECT id, resetPasswordCode FROM users WHERE email = ?', [normalized]);
    if (!user) throw new Error('User not found.');

    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
        throw new Error('Reset verification code is invalid.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ?, resetPasswordCode = NULL WHERE id = ?', [hashed, user.id]);
    await db.run('INSERT INTO audit_logs (userId, action) VALUES (?, ?)', [user.id, 'Password Reset Completed']);
    
    logger.info(`Password reset completed for: ${normalized}`);
}

module.exports = {
    registerUser,
    verifyAccount,
    loginUser,
    requestPasswordReset,
    resetPassword
};
