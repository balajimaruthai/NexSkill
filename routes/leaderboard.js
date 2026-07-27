const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const leaderboardController = require('../controllers/leaderboardController');

router.get('/', authenticateToken, leaderboardController.getLeaderboard);

module.exports = router;
