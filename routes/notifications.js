const express = require('express');
const router  = express.Router();
const { authenticateToken } = require('../middleware/auth');
const notifService = require('../services/notificationService');
const pushService  = require('../services/pushService');

// GET /api/notifications — get all notifications for logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await notifService.getUserNotifications(req.user.id);
        res.json({ notifications });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// PATCH /api/notifications/:id/read — mark single notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        await notifService.markNotificationAsRead(req.params.id, req.user.id);
        res.json({ msg: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// PATCH /api/notifications/read-all — mark all notifications as read
router.patch('/read-all', authenticateToken, async (req, res) => {
    try {
        await notifService.markAllNotificationsAsRead(req.user.id);
        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// GET /api/notifications/vapid-public-key — return VAPID public key to frontend
router.get('/vapid-public-key', (req, res) => {
    res.json({ key: pushService.getVapidPublicKey() });
});

// POST /api/notifications/subscribe — save push subscription
router.post('/subscribe', authenticateToken, async (req, res) => {
    try {
        const { subscription } = req.body;
        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ msg: 'Invalid subscription object' });
        }
        await pushService.saveSubscription(req.user.id, subscription);
        res.json({ msg: 'Subscribed to push notifications' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// DELETE /api/notifications/unsubscribe — remove push subscription
router.delete('/unsubscribe', authenticateToken, async (req, res) => {
    try {
        const { endpoint } = req.body;
        await pushService.removeSubscription(endpoint);
        res.json({ msg: 'Unsubscribed' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// POST /api/notifications/test-push — send a test push to the logged-in user
router.post('/test-push', authenticateToken, async (req, res) => {
    try {
        await pushService.sendPushToUser(req.user.id, {
            title: '🔔 NexSkill Test',
            body:  'Push notifications are working!',
            icon:  '/icon-192.png',
            url:   '/'
        });
        res.json({ msg: 'Test push sent' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
