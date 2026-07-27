const fs = require('fs');
const path = require('path');
const db = require('../db');

const mcqsPath = path.join(__dirname, '../quiz_questions.json');

function readMCQs() {
    try {
        const data = fs.readFileSync(mcqsPath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

// Generates an adaptive assessment session
function generateAdaptiveSession(skill) {
    const mcqs = readMCQs();
    const normalized = Object.keys(mcqs).find(k => k.toLowerCase() === skill.toLowerCase().trim());
    if (!normalized) return null;

    const skillMcqs = mcqs[normalized];
    
    // We compile an initial question queue:
    // 2 Beginner, 2 Intermediate, 1 Advanced
    // As the user progresses, we can evaluate adaptive paths.
    // To make it simple and fully functional: we return a customized question bundle containing:
    // [q0, q1] (Beginner), [q2, q3] (Intermediate), [q4, q5] (Advanced)
    // The client answers them. Based on performance, we evaluate their verified skill level.
    const beginnerPool = skillMcqs.Beginner || [];
    const intermediatePool = skillMcqs.Intermediate || [];
    const advancedPool = skillMcqs.Advanced || [];

    // Shuffle helper
    const shuffle = arr => arr.sort(() => 0.5 - Math.random());

    const selectedBeginner = shuffle([...beginnerPool]).slice(0, 2);
    const selectedIntermediate = shuffle([...intermediatePool]).slice(0, 2);
    const selectedAdvanced = shuffle([...advancedPool]).slice(0, 2);

    const questions = [];
    
    // Add Beginner
    selectedBeginner.forEach((q, idx) => {
        questions.push({ ...q, id: `beg-${idx}`, difficulty: 'Beginner' });
    });
    // Add Intermediate
    selectedIntermediate.forEach((q, idx) => {
        questions.push({ ...q, id: `int-${idx}`, difficulty: 'Intermediate' });
    });
    // Add Advanced
    selectedAdvanced.forEach((q, idx) => {
        questions.push({ ...q, id: `adv-${idx}`, difficulty: 'Advanced' });
    });

    return questions;
}

// Evaluate user answers and calculate adaptive score and certification level
function evaluateAdaptiveScore(questions, answers) {
    let score = 0;
    let correctCount = 0;
    const details = [];

    // answers: array of selected option indexes: [ans0, ans1, ...]
    questions.forEach((q, idx) => {
        const userAns = parseInt(answers[idx]);
        const isCorrect = userAns === parseInt(q.a);

        if (isCorrect) {
            correctCount++;
            // Beginner = 10 pts, Intermediate = 20 pts, Advanced = 30 pts
            if (q.difficulty === 'Beginner') score += 10;
            else if (q.difficulty === 'Intermediate') score += 20;
            else if (q.difficulty === 'Advanced') score += 30;
        }

        details.push({
            q: q.q,
            difficulty: q.difficulty,
            correct: isCorrect,
            userAnswer: q.o[userAns] || 'Unanswered',
            correctAnswer: q.o[q.a]
        });
    });

    // Max possible score: (2*10) + (2*20) + (2*30) = 20 + 40 + 60 = 120 points
    const maxScore = 120;
    const finalPercent = Math.round((score / maxScore) * 100);

    // Determine certified level based on scores
    let certifiedLevel = 'None';
    if (finalPercent >= 85) {
        certifiedLevel = 'Advanced';
    } else if (finalPercent >= 60) {
        certifiedLevel = 'Intermediate';
    } else if (finalPercent >= 40) {
        certifiedLevel = 'Beginner';
    }

    return {
        score: finalPercent,
        correctCount,
        totalQuestions: questions.length,
        certifiedLevel,
        details
    };
}

module.exports = {
    generateAdaptiveSession,
    evaluateAdaptiveScore
};
