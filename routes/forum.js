const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const forumController = require('../controllers/forumController');

// Get all posts
router.get('/posts', auth, forumController.getPosts);

// Get single post with replies
router.get('/posts/:id', auth, forumController.getPostDetail);

// Create new post
router.post('/posts', auth, forumController.createPost);

// Reply to a post
router.post('/posts/:id/reply', auth, forumController.createReply);

module.exports = router;
