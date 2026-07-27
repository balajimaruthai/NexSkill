const db = require('../db');
const userService = require('../services/userService');
const gamificationService = require('../services/gamificationService');
const assessmentService = require('../services/assessmentService');
const fs = require('fs');
const path = require('path');

const mcqsPath = path.join(__dirname, '../quiz_questions.json');

function readMCQs() {
    try {
        const data = fs.readFileSync(mcqsPath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

function writeMCQs(data) {
    fs.writeFileSync(mcqsPath, JSON.stringify(data, null, 2), 'utf8');
}

async function entryExam(req, res, next) {
    try {
        const userId = req.user.id;

        if (req.user.entryExamCompleted === 1) {
            return res.status(400).json({ msg: 'Entry exam already completed' });
        }

        const newTrust = Math.min(900, req.user.trustScore + 30);
        const newCredits = req.user.credits + 20;

        await db.run(`
            UPDATE users 
            SET entryExamCompleted = 1, trustScore = ?, credits = ?
            WHERE id = ?
        `, [newTrust, newCredits, userId]);

        // Award entry-exam completion XP: +200 XP
        await gamificationService.awardXP(userId, 200);
        await gamificationService.updateActivityStreak(userId);

        const updatedProfile = await userService.getFullUserProfile(userId);
        res.json({
            msg: 'Entry verification exam completed successfully! Dashboard unlocked +20 Credits, +30 Trust, +200 XP.',
            user: updatedProfile
        });
    } catch (err) {
        next(err);
    }
}

async function completeCourse(req, res, next) {
    try {
        const { videoId, skill } = req.body;
        const userId = req.user.id;

        if (!videoId || !skill) {
            return res.status(400).json({ msg: 'Please provide videoId and skill' });
        }

        const existing = await db.get('SELECT id FROM completions WHERE userId = ? AND videoId = ?', [userId, videoId]);
        if (existing) {
            return res.status(200).json({
                msg: 'Course video is already completed.',
                user: req.user
            });
        }

        await db.run('INSERT INTO completions (userId, videoId, skill) VALUES (?, ?, ?)', [userId, videoId, skill]);

        // Award Course completion XP: +150 XP
        await gamificationService.awardXP(userId, 150);
        await gamificationService.updateActivityStreak(userId);

        const updatedProfile = await userService.getFullUserProfile(userId);
        res.json({
            msg: `YouTube course completed! "Skill Achievers: ${skill}" badge unlocked, +150 XP credited.`,
            user: updatedProfile
        });
    } catch (err) {
        next(err);
    }
}

// Generate a new adaptive assessment session
async function startAdaptiveAssessment(req, res, next) {
    try {
        const { skill } = req.body;
        if (!skill) return res.status(400).json({ msg: 'Please select a skill track.' });

        const sessionQuestions = assessmentService.generateAdaptiveSession(skill);
        if (!sessionQuestions) {
            return res.status(400).json({ msg: `No assessment questions found for skill: ${skill}` });
        }

        // Return questions without the answers index for security!
        const secureQuestions = sessionQuestions.map(q => {
            const { a, ...rest } = q;
            return rest;
        });

        res.json({
            skill,
            questions: secureQuestions
        });
    } catch (err) {
        next(err);
    }
}

// Submit adaptive assessment answers
async function submitAdaptiveAssessment(req, res, next) {
    try {
        const { skill, answers } = req.body; // answers: array of numbers [0, 1, 3...]
        const userId = req.user.id;

        if (!skill || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ msg: 'Please provide skill and answers array.' });
        }

        // Fetch master questions to evaluate
        const mcqs = readMCQs();
        const normalized = Object.keys(mcqs).find(k => k.toLowerCase() === skill.toLowerCase().trim());
        if (!normalized) return res.status(400).json({ msg: 'Skill track not found.' });

        // Retrieve the exact same generated session pool
        // For local deterministic scoring, we rebuild the questions order from mcqs
        const skillMcqs = mcqs[normalized];
        const beginnerPool = skillMcqs.Beginner || [];
        const intermediatePool = skillMcqs.Intermediate || [];
        const advancedPool = skillMcqs.Advanced || [];

        // Combine questions in exact order of generator
        // In local state, we expect 2 Beginner, 2 Intermediate, 2 Advanced
        const questions = [];
        beginnerPool.slice(0, 2).forEach((q, idx) => questions.push({ ...q, difficulty: 'Beginner' }));
        intermediatePool.slice(0, 2).forEach((q, idx) => questions.push({ ...q, difficulty: 'Intermediate' }));
        advancedPool.slice(0, 2).forEach((q, idx) => questions.push({ ...q, difficulty: 'Advanced' }));

        const result = assessmentService.evaluateAdaptiveScore(questions, answers);

        if (result.certifiedLevel !== 'None') {
            const todayStr = new Date().toLocaleDateString();
            
            // Save verified certification
            await db.run(`
                INSERT INTO certifications (userId, skill, level, date, score)
                VALUES (?, ?, ?, ?, ?)
            `, [userId, skill, result.certifiedLevel, todayStr, result.score]);

            // Save adaptive assessment logs
            await db.run(`
                INSERT INTO adaptive_assessments (userId, skill, score, details)
                VALUES (?, ?, ?, ?)
            `, [userId, skill, result.score, JSON.stringify(result.details)]);

            // Award certification XP: +250 XP
            await gamificationService.awardXP(userId, 250);
            await gamificationService.unlockAchievement(userId, 'cert-expert');
        }

        const updatedProfile = await userService.getFullUserProfile(userId);

        res.json({
            msg: result.certifiedLevel !== 'None' 
                ? `Congratulations! You passed the Adaptive Assessment at ${result.certifiedLevel} level.`
                : 'Assessment completed. Unfortunately, you did not meet the passing threshold. Review the questions and try again!',
            results: result,
            user: updatedProfile
        });
    } catch (err) {
        next(err);
    }
}

// ==========================================
// ADMIN MCQ QUESTION CONTROLLERS
// ==========================================

async function getMCQs(req, res, next) {
    try {
        const data = readMCQs();
        res.json(data);
    } catch (err) {
        next(err);
    }
}

async function createTrack(req, res, next) {
    try {
        const { skillName } = req.body;
        if (!skillName) return res.status(400).json({ msg: 'Skill name is required.' });

        const data = readMCQs();
        const normalized = Object.keys(data).find(k => k.toLowerCase() === skillName.toLowerCase().trim());
        if (normalized) {
            return res.status(400).json({ msg: 'Skill track already exists.' });
        }

        data[skillName.trim()] = { Beginner: [], Intermediate: [], Advanced: [] };
        writeMCQs(data);
        res.json({ msg: 'Skill category track created successfully!', mcqs: data });
    } catch (err) {
        next(err);
    }
}

async function saveQuestion(req, res, next) {
    try {
        const { skill, difficulty, index, question } = req.body;
        if (!skill || !difficulty || !question) {
            return res.status(400).json({ msg: 'Skill, difficulty, and question details are required.' });
        }

        const data = readMCQs();
        if (!data[skill]) data[skill] = { Beginner: [], Intermediate: [], Advanced: [] };
        if (!data[skill][difficulty]) data[skill][difficulty] = [];

        if (index === -1) {
            data[skill][difficulty].push(question);
        } else {
            if (data[skill][difficulty][index]) {
                data[skill][difficulty][index] = question;
            } else {
                data[skill][difficulty].push(question);
            }
        }

        writeMCQs(data);
        res.json({ msg: 'Question saved successfully!', mcqs: data });
    } catch (err) {
        next(err);
    }
}

async function deleteQuestion(req, res, next) {
    try {
        const { skill, difficulty, index } = req.body;
        if (!skill || !difficulty || index === undefined) {
            return res.status(400).json({ msg: 'Skill, difficulty, and index are required.' });
        }

        const data = readMCQs();
        if (data[skill] && data[skill][difficulty] && data[skill][difficulty][index] !== undefined) {
            data[skill][difficulty].splice(index, 1);
            writeMCQs(data);
            return res.json({ msg: 'Question deleted successfully!', mcqs: data });
        }

        res.status(404).json({ msg: 'Question not found.' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    entryExam,
    completeCourse,
    startAdaptiveAssessment,
    submitAdaptiveAssessment,
    getMCQs,
    createTrack,
    saveQuestion,
    deleteQuestion
};
