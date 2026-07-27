const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Sender address — update to your verified domain once you add one in Resend.
// For now, Resend's sandbox address works for testing.
const FROM = 'NexSkill <onboarding@resend.dev>';
const APP_URL = process.env.APP_URL || 'https://localhost:5000';

// ── Helpers ────────────────────────────────────────────────────────────────

function baseTemplate(content) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#0d0d1a; font-family:'Inter',Arial,sans-serif; color:#e0e0f0; }
    .wrapper { max-width:600px; margin:40px auto; background:#13132a; border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); }
    .header { background:linear-gradient(135deg,#6c3ff6 0%,#a855f7 100%); padding:32px 40px; text-align:center; }
    .logo { font-size:1.5rem; font-weight:800; color:#fff; letter-spacing:-0.5px; }
    .logo span { background:rgba(255,255,255,0.2); border-radius:6px; padding:2px 8px; font-size:0.9rem; margin-left:4px; }
    .body { padding:40px; }
    h2 { font-size:1.4rem; font-weight:700; color:#fff; margin-bottom:12px; }
    p  { color:#9999bb; font-size:0.95rem; line-height:1.6; margin-bottom:16px; }
    .otp-box { background:rgba(108,63,246,0.15); border:1px solid rgba(108,63,246,0.4); border-radius:12px; text-align:center; padding:24px; margin:24px 0; }
    .otp-code { font-size:2.5rem; font-weight:800; letter-spacing:12px; color:#a78bfa; font-family:monospace; }
    .otp-expiry { color:#6666aa; font-size:0.8rem; margin-top:8px; }
    .btn { display:inline-block; background:linear-gradient(135deg,#6c3ff6,#a855f7); color:#fff; text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:600; font-size:1rem; margin:16px 0; }
    .info-card { background:rgba(255,255,255,0.04); border-radius:10px; padding:20px; margin:16px 0; }
    .info-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.9rem; }
    .info-row:last-child { border-bottom:none; }
    .info-label { color:#6666aa; }
    .info-value { color:#c0c0e0; font-weight:600; }
    .footer { background:#0d0d1a; padding:24px 40px; text-align:center; color:#444466; font-size:0.8rem; }
    .footer a { color:#6c3ff6; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Nex<span>Skill</span></div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} NexSkill. All rights reserved.</p>
      <p style="margin-top:8px;">
        You received this email because you have an account on <a href="${APP_URL}">NexSkill</a>.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ── 1. Email Verification OTP ───────────────────────────────────────────────

async function sendVerificationEmail(toEmail, toName, otp) {
    const html = baseTemplate(`
        <h2>👋 Verify your NexSkill account</h2>
        <p>Hi <strong>${toName}</strong>, welcome to NexSkill! To complete your registration, enter this verification code:</p>
        <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">⏱ Expires in 15 minutes</div>
        </div>
        <p>If you didn't create a NexSkill account, you can safely ignore this email.</p>
    `);

    try {
        const { data, error } = await resend.emails.send({
            from: FROM,
            to:   [toEmail],
            subject: `${otp} is your NexSkill verification code`,
            html
        });
        if (error) throw new Error(error.message);
        console.log(`📧 Verification email sent to ${toEmail} (id: ${data?.id})`);
        return true;
    } catch (err) {
        console.error('❌ Verification email failed:', err.message);
        return false;
    }
}

// ── 2. Password Reset Email ─────────────────────────────────────────────────

async function sendPasswordResetEmail(toEmail, toName, resetCode) {
    const resetLink = `${APP_URL}?reset=${resetCode}`;

    const html = baseTemplate(`
        <h2>🔐 Reset your password</h2>
        <p>Hi <strong>${toName}</strong>, we received a request to reset your NexSkill password.</p>
        <div class="otp-box">
            <div class="otp-code" style="font-size:1.8rem; letter-spacing:8px;">${resetCode}</div>
            <div class="otp-expiry">⏱ Expires in 30 minutes</div>
        </div>
        <p style="text-align:center;">Or use the button below to reset directly:</p>
        <div style="text-align:center;">
            <a href="${resetLink}" class="btn">Reset Password →</a>
        </div>
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    `);

    try {
        const { data, error } = await resend.emails.send({
            from: FROM,
            to:   [toEmail],
            subject: 'Reset your NexSkill password',
            html
        });
        if (error) throw new Error(error.message);
        console.log(`📧 Password reset email sent to ${toEmail} (id: ${data?.id})`);
        return true;
    } catch (err) {
        console.error('❌ Password reset email failed:', err.message);
        return false;
    }
}

// ── 3. Meeting Reminder Email ───────────────────────────────────────────────

async function sendMeetingReminderEmail(toEmail, toName, meeting) {
    const { skill, date, time, meetLink, partnerName } = meeting;

    const html = baseTemplate(`
        <h2>📅 Your session is coming up!</h2>
        <p>Hi <strong>${toName}</strong>, a reminder that your skill exchange session starts in <strong>1 hour</strong>.</p>
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Skill</span>
                <span class="info-value">${skill}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Partner</span>
                <span class="info-value">${partnerName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date</span>
                <span class="info-value">${date}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Time</span>
                <span class="info-value">${time}</span>
            </div>
        </div>
        ${meetLink ? `
        <div style="text-align:center;">
            <a href="${meetLink}" class="btn">Join Meeting →</a>
        </div>
        ` : ''}
        <p>Make sure you're prepared and have a good connection. Best of luck! 🚀</p>
    `);

    try {
        const { data, error } = await resend.emails.send({
            from: FROM,
            to:   [toEmail],
            subject: `⏰ Reminder: Your ${skill} session starts in 1 hour`,
            html
        });
        if (error) throw new Error(error.message);
        console.log(`📧 Meeting reminder sent to ${toEmail} (id: ${data?.id})`);
        return true;
    } catch (err) {
        console.error('❌ Meeting reminder email failed:', err.message);
        return false;
    }
}

// ── 4. Welcome Email (sent after email verification) ───────────────────────

async function sendWelcomeEmail(toEmail, toName) {
    const html = baseTemplate(`
        <h2>🎉 Welcome to NexSkill, ${toName}!</h2>
        <p>Your account is verified and ready to go. Here's what you can do next:</p>
        <div class="info-card">
            <div class="info-row"><span class="info-label">🔍 Discover</span><span class="info-value">Find peers with skills you want</span></div>
            <div class="info-row"><span class="info-label">💬 Connect</span><span class="info-value">Send swap requests & chat</span></div>
            <div class="info-row"><span class="info-label">📅 Schedule</span><span class="info-value">Book 1-on-1 learning sessions</span></div>
            <div class="info-row"><span class="info-label">🏆 Earn</span><span class="info-value">Get certificates & level up</span></div>
        </div>
        <div style="text-align:center;">
            <a href="${APP_URL}" class="btn">Start Learning →</a>
        </div>
    `);

    try {
        const { data, error } = await resend.emails.send({
            from: FROM,
            to:   [toEmail],
            subject: `🎉 Welcome to NexSkill, ${toName}!`,
            html
        });
        if (error) throw new Error(error.message);
        console.log(`📧 Welcome email sent to ${toEmail} (id: ${data?.id})`);
        return true;
    } catch (err) {
        console.error('❌ Welcome email failed:', err.message);
        return false;
    }
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendMeetingReminderEmail,
    sendWelcomeEmail
};
