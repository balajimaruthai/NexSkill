const db = require('../db');
const gamificationService = require('../services/gamificationService');

// Get all forum posts
async function getPosts(req, res, next) {
    try {
        const sql = `
            SELECT fp.*, u.name AS authorName, u.photo AS authorPhoto,
                   (SELECT COUNT(*) FROM forum_replies fr WHERE fr.postId = fp.id) AS replyCount
            FROM forum_posts fp
            JOIN users u ON fp.userId = u.id
            ORDER BY fp.createdAt DESC
            LIMIT 50
        `;
        const posts = await db.query(sql);
        res.json(posts);
    } catch (err) {
        next(err);
    }
}

// Get single post with replies
async function getPostDetail(req, res, next) {
    try {
        const postId = req.params.id;

        const post = await db.get(`
            SELECT fp.*, u.name AS authorName, u.photo AS authorPhoto
            FROM forum_posts fp
            JOIN users u ON fp.userId = u.id
            WHERE fp.id = ?
        `, [postId]);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const replies = await db.query(`
            SELECT fr.*, u.name AS authorName, u.photo AS authorPhoto
            FROM forum_replies fr
            JOIN users u ON fr.userId = u.id
            WHERE fr.postId = ?
            ORDER BY fr.createdAt ASC
        `, [postId]);

        res.json({ post, replies });
    } catch (err) {
        next(err);
    }
}

// Create new forum post
async function createPost(req, res, next) {
    try {
        const { title, body, tag } = req.body;
        const userId = req.user.id;

        if (!title || !body) {
            return res.status(400).json({ msg: 'Title and content are required.' });
        }

        await db.run(`
            INSERT INTO forum_posts (userId, title, body, tag, likes)
            VALUES (?, ?, ?, ?, 0)
        `, [userId, title, body, tag || 'General']);

        // Award XP for contributing
        await gamificationService.awardXP(userId, 25);

        res.json({ msg: 'Discussion posted successfully! (+25 XP)' });
    } catch (err) {
        next(err);
    }
}

// Submit a reply to a post
async function createReply(req, res, next) {
    try {
        const postId = req.params.id;
        const { body } = req.body;
        const userId = req.user.id;

        if (!body) {
            return res.status(400).json({ msg: 'Reply content is required.' });
        }

        const post = await db.get('SELECT id FROM forum_posts WHERE id = ?', [postId]);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        await db.run(`
            INSERT INTO forum_replies (postId, userId, body)
            VALUES (?, ?, ?)
        `, [postId, userId, body]);

        // Award XP for replying
        await gamificationService.awardXP(userId, 10);

        res.json({ msg: 'Reply posted! (+10 XP)' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getPosts,
    getPostDetail,
    createPost,
    createReply
};
