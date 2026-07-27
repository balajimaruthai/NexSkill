const webpush = require('web-push');
const db = require('../db');

// VAPID keys should be set in .env; if missing, generate them on first run
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    const vapidKeys = webpush.generateVAPIDKeys();
    console.log('🔑  VAPID Keys generated. Add these to your .env:');
    console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
    console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
    process.env.VAPID_PUBLIC_KEY  = vapidKeys.publicKey;
    process.env.VAPID_PRIVATE_KEY = vapidKeys.privateKey;
}

webpush.setVapidDetails(
    'mailto:balajimaruthal@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

async function getSubscriptions() {
    try {
        const rows = await db.query('SELECT * FROM push_subscriptions');
        return rows;
    } catch (e) {
        return [];
    }
}

async function saveSubscription(userId, subscription) {
    await db.pool.query(`
        INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (endpoint)
        DO UPDATE SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth
    `, [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]);
}

async function removeSubscription(endpoint) {
    await db.pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
}

async function sendPushToUser(userId, payload) {
    const subs = await db.pool.query('SELECT * FROM push_subscriptions WHERE user_id = $1', [userId]).then(r => r.rows);
    for (const sub of subs) {
        const subscription = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
        };
        try {
            await webpush.sendNotification(subscription, JSON.stringify(payload));
        } catch (err) {
            if (err.statusCode === 410) {
                await removeSubscription(sub.endpoint);
            } else {
                console.error('Push error:', err.message);
            }
        }
    }
}

async function sendDailyReminders() {
    try {
        // Get all users with push subscriptions
        const users = await db.query(`
            SELECT DISTINCT ps.user_id AS "userId", u.name
            FROM push_subscriptions ps
            JOIN users u ON u.id = ps.user_id
        `);

        for (const user of users) {
            // Check pending skill requests
            const pendingRequests = await db.pool.query(
                `SELECT COUNT(*) AS cnt FROM requests WHERE receiverid = $1 AND status = 'pending'`,
                [user.userId]
            ).then(r => r.rows);

            // Check upcoming meetings
            const upcomingMeetings = await db.pool.query(
                `SELECT COUNT(*) AS cnt FROM meetings WHERE (senderid = $1 OR receiverid = $2) AND status = 'scheduled' AND date >= CURRENT_DATE::TEXT`,
                [user.userId, user.userId]
            ).then(r => r.rows);

            const pending  = parseInt(pendingRequests[0]?.cnt  || 0, 10);
            const upcoming = parseInt(upcomingMeetings[0]?.cnt || 0, 10);

            let title = '👋 Good morning from NexSkill!';
            let body  = 'Have a great day of learning!';

            if (pending > 0 && upcoming > 0) {
                body = `You have ${pending} pending request(s) and ${upcoming} upcoming meeting(s). Stay on top of it!`;
            } else if (pending > 0) {
                body = `You have ${pending} pending skill request(s) waiting for your response.`;
            } else if (upcoming > 0) {
                body = `You have ${upcoming} upcoming session(s) scheduled. Don't miss them!`;
            }

            await sendPushToUser(user.userId, {
                title,
                body,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                url: '/'
            });
        }
        console.log(`✅  Daily reminders sent to ${users.length} user(s)`);
    } catch (err) {
        console.error('❌  Daily reminder cron failed:', err.message);
    }
}

module.exports = {
    saveSubscription,
    removeSubscription,
    sendPushToUser,
    sendDailyReminders,
    getVapidPublicKey: () => process.env.VAPID_PUBLIC_KEY
};
