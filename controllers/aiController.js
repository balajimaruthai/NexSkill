const db = require('../db');
const aiService = require('../services/aiService');
const gamificationService = require('../services/gamificationService');
const notificationService = require('../services/notificationService');

async function getRoadmap(req, res, next) {
    try {
        const { skill } = req.query;
        const userId = req.user.id;

        if (!skill) return res.status(400).json({ msg: 'Please specify a target skill.' });

        const roadmap = aiService.generateLearningRoadmap(userId, skill);
        
        // Save roadmap to DB for persistence
        await db.run(`
            INSERT INTO ai_roadmaps (userId, skill, roadmap)
            VALUES (?, ?, ?)
        `, [userId, skill, JSON.stringify(roadmap)]);

        // Award AI usage XP: +50 XP
        await gamificationService.awardXP(userId, 50);
        await gamificationService.updateActivityStreak(userId);

        res.json({
            skill,
            roadmap
        });
    } catch (err) {
        next(err);
    }
}

async function reviewResume(req, res, next) {
    try {
        const { resumeText, targetSkill } = req.body;
        const userId = req.user.id;

        if (!resumeText) return res.status(400).json({ msg: 'Please provide resume text content.' });

        const analysis = aiService.analyzeResume(resumeText, targetSkill || 'General');

        // Award Resume check XP: +40 XP
        await gamificationService.awardXP(userId, 40);

        res.json({
            msg: 'ATS analysis completed successfully!',
            analysis
        });
    } catch (err) {
        next(err);
    }
}

// Start AI Interactive Mock Interview Session
async function startInterview(req, res, next) {
    try {
        const { skill, difficulty } = req.body;
        if (!skill || !difficulty) {
            return res.status(400).json({ msg: 'Please specify skill and difficulty track.' });
        }

        // Mock interview questions database
        const interviewPool = {
            'react': {
                'Beginner': [
                    "Question 1: Explain the difference between state and props in React.",
                    "Question 2: What is the virtual DOM and how does React use it to optimize rendering?"
                ],
                'Intermediate': [
                    "Question 1: How does React Context work and what are its performance limitations?",
                    "Question 2: What is React Fiber and how does it enable concurrent rendering?"
                ]
            },
            'python': {
                'Beginner': [
                    "Question 1: What is the difference between lists and tuples in Python?",
                    "Question 2: Explain local and global variable scopes in Python functions."
                ],
                'Intermediate': [
                    "Question 1: What is the Global Interpreter Lock (GIL) and how does it affect multi-threading?",
                    "Question 2: How do Python generators work under the hood using the yield statement?"
                ]
            }
        };

        const target = skill.toLowerCase().trim();
        const diff = difficulty || 'Beginner';
        const questions = (interviewPool[target] && interviewPool[target][diff]) || [
            `Question 1: What are the primary design principles in ${skill}?`,
            `Question 2: How do you debug runtime exceptions in ${skill}?`
        ];

        res.json({
            skill,
            difficulty: diff,
            questions
        });
    } catch (err) {
        next(err);
    }
}

// Submit answers for mock interview evaluation
async function submitInterview(req, res, next) {
    try {
        const { answers, questions } = req.body; // answers: array of text responses
        const userId = req.user.id;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ msg: 'Please provide your answers.' });
        }

        // Simple local evaluation logic based on length, keywords match
        const evaluations = [];
        let totalScore = 60; // baseline

        answers.forEach((ans, idx) => {
            const cleanAns = ans.trim();
            let score = 50;
            let feedback = "Answer is too short or generic. Try to expand with code examples or technical reasoning.";

            if (cleanAns.length > 50) {
                score += 20;
                feedback = "Good explanation. You covered the concepts well and provided detailed context.";
            }
            if (cleanAns.length > 120) {
                score += 15;
                feedback = "Excellent depth of answer. Highly structured explanation with strong terminology.";
            }

            // Keyword boosts
            const boosts = ['performance', 'optimization', 'under the hood', 'complexity', 'engine', 'reconciliation'];
            boosts.forEach(b => {
                if (cleanAns.toLowerCase().includes(b)) {
                    score += 5;
                }
            });

            const finalScore = Math.min(100, score);
            totalScore += finalScore;

            evaluations.push({
                question: questions[idx] || `Question ${idx + 1}`,
                answer: cleanAns,
                score: finalScore,
                feedback
            });
        });

        const overallScore = Math.round(totalScore / (answers.length + 1));

        // Award Interview completion XP: +200 XP
        await gamificationService.awardXP(userId, 200);
        await notificationService.createNotification(
            userId,
            'AI Mock Interview Graded',
            `Your mock interview has been evaluated by the AI Mentor. Overall score: ${overallScore}%`,
            'info'
        );

        res.json({
            msg: 'Interview evaluation graded by AI Mentor!',
            overallScore,
            evaluations
        });
    } catch (err) {
        next(err);
    }
}

// Get system health, audit logs, and toxic moderation logs for admin
async function getAdminDiagnostics(req, res, next) {
    try {
        const auditLogs = await db.query('SELECT a.*, u.name AS userName FROM audit_logs a LEFT JOIN users u ON a.userId = u.id ORDER BY a.createdAt DESC LIMIT 20');
        
        // Fetch stats counts
        const totalUsers = await db.get('SELECT COUNT(*) AS count FROM users');
        const totalRequests = await db.get('SELECT COUNT(*) AS count FROM requests');
        const totalMeetings = await db.get('SELECT COUNT(*) AS count FROM meetings');
        const avgRating = await db.get('SELECT AVG(rating) AS avg FROM users WHERE ratingsCount > 0');

        // CPU / Memory mock diagnostics
        const memoryUsage = process.memoryUsage();
        const diagnostics = {
            os: process.platform,
            nodeVersion: process.version,
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
            uptime: Math.round(process.uptime()) + ' seconds',
            databaseSize: 'PostgreSQL (Supabase)'
        };

        res.json({
            auditLogs,
            diagnostics,
            stats: {
                users: totalUsers.count,
                requests: totalRequests.count,
                meetings: totalMeetings.count,
                avgRating: parseFloat(avgRating.avg || 5).toFixed(2)
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getRoadmap,
    reviewResume,
    startInterview,
    submitInterview,
    getAdminDiagnostics
};
