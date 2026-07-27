const db = require('../db');
const { isToxic, isSpam } = require('../utils/helpers');

// Helper to generate dynamic roadmaps for skills
const ROADMAPS_DB = {
    "react": {
        title: "React Web Development",
        modules: [
            { id: 1, title: "Module 1: JavaScript ES6+ Basics for React", topic: "Arrow functions, destructuring, spread operator, map/filter/reduce, imports/exports.", duration: "Week 1", projects: ["Array manipulation utilities"] },
            { id: 2, title: "Module 2: React Components & JSX", topic: "JSX syntax, components structure, props, rendering lists, conditional styling.", duration: "Week 2", projects: ["Personal portfolio components grid"] },
            { id: 3, title: "Module 3: React Hooks (useState & useEffect)", topic: "State management, event handlers, side-effects, API calls in useEffect.", duration: "Week 3", projects: ["Weather dashboard app"] },
            { id: 4, title: "Module 4: Advanced React (Context API & useReducer)", topic: "Global state management, reducer patterns, custom hooks.", duration: "Week 4", projects: ["Shopping cart checkout module"] }
        ]
    },
    "python": {
        title: "Python Programming & Scripting",
        modules: [
            { id: 1, title: "Module 1: Python syntax & basics", topic: "Variables, operators, control flow (if/else, loops), native collections (lists, dicts, tuples).", duration: "Week 1", projects: ["Inventory management script"] },
            { id: 2, title: "Module 2: Functional Python & File I/O", topic: "Functions, *args/**kwargs, files handling, exception safety.", duration: "Week 2", projects: ["CSV parser & report compiler"] },
            { id: 3, title: "Module 3: Object-Oriented Python", topic: "Classes, inheritance, properties, special dunder methods.", duration: "Week 3", projects: ["Bank system accounting module"] },
            { id: 4, title: "Module 4: Data Processing & APIs", topic: "Using external modules, requests library, scraping basics, intro to pandas.", duration: "Week 4", projects: ["Real-estate listings visualizer"] }
        ]
    },
    "figma": {
        title: "Figma UI/UX & Design Systems",
        modules: [
            { id: 1, title: "Module 1: Vector graphics & structures", topic: "Shapes, pen tool, curves, layers hierarchy, groups vs frames.", duration: "Week 1", projects: ["Custom icon set illustration"] },
            { id: 2, title: "Module 2: Auto Layout & Constraints", topic: "Flex alignment, Hug/Fill rules, resizing constraints.", duration: "Week 2", projects: ["Responsive navigation bar design"] },
            { id: 3, title: "Module 3: Components & Variants", topic: "Master components, child instances, states (hover, disabled), local styles.", duration: "Week 3", projects: ["Buttons and form fields design system library"] },
            { id: 4, title: "Module 4: High-fidelity Prototyping", topic: "Smart animate, interactive modules, transition curves, presentation triggers.", duration: "Week 4", projects: ["Interactive mobile app user flow mockup"] }
        ]
    }
};

const DEFAULT_ROADMAP = {
    title: "General Skill Track Acceleration",
    modules: [
        { id: 1, title: "Module 1: Core Fundamentals", topic: "Definitions, standard setup, tools of trade, simple examples.", duration: "Week 1", projects: ["Setup environment & hello-world task"] },
        { id: 2, title: "Module 2: Intermediate Implementation", topic: "Coding logic structures, functions, simple data storage.", duration: "Week 2", projects: ["Core utility builder task"] },
        { id: 3, title: "Module 3: Best Practices & Frameworks", topic: "Modular architectures, validation logic, performance guidelines.", duration: "Week 3", projects: ["Deploy simple web module"] }
    ]
};

// 1. Calculate compatibility matches between two users
function getCompatibilityScore(userA, userB) {
    let score = 50; // base score
    const reasoning = [];

    // Mutual skill exchange check (Best compatibility!)
    const teachToLearn = userA.skillsOffer.some(s => userB.skillsLearn.includes(s));
    const learnToTeach = userA.skillsLearn.some(s => userB.skillsOffer.includes(s));

    if (teachToLearn) {
        score += 20;
        reasoning.push(`You teach skills that ${userB.name} is looking to learn.`);
    }
    if (learnToTeach) {
        score += 20;
        reasoning.push(`${userB.name} teaches skills that align with your learning goals.`);
    }

    // Language overlap
    const commonLangs = userA.languages.filter(l => userB.languages.includes(l));
    if (commonLangs.length > 0) {
        score += 10;
        reasoning.push(`You both speak: ${commonLangs.join(', ')}.`);
    } else {
        score -= 15;
        reasoning.push(`No common language matches found (potential communication gap).`);
    }

    // Trust rating compatibility
    const trustDiff = Math.abs(userA.trustScore - userB.trustScore);
    if (trustDiff < 100) {
        score += 5;
        reasoning.push(`Similar trust rating layer.`);
    }

    // Peer Ratings
    if (userB.rating >= 4.8) {
        score += 5;
        reasoning.push(`${userB.name} has an outstanding peer review rating (${userB.rating} ★).`);
    }

    // Final bound checks
    score = Math.min(100, Math.max(10, score));
    return {
        score,
        reasoning
    };
}

// 2. Local ATS Resume Analyzer
function analyzeResume(resumeText, targetSkill = '') {
    if (!resumeText) {
        return { score: 0, feedback: "Resume text is empty.", missingKeywords: [] };
    }

    const lowerText = resumeText.toLowerCase();
    let score = 40; // baseline
    const missingKeywords = [];
    const recommendations = [];

    // Structure checks
    if (lowerText.includes('experience') || lowerText.includes('work history')) {
        score += 15;
    } else {
        recommendations.push("Add a dedicated 'Work Experience' or 'Employment History' section.");
    }

    if (lowerText.includes('skills') || lowerText.includes('technologies')) {
        score += 15;
    } else {
        recommendations.push("Create a designated 'Skills' section listing tools and program languages.");
    }

    if (lowerText.includes('education') || lowerText.includes('certification')) {
        score += 10;
    }

    // Skill-based keyword overlap check
    const skillsKeywords = {
        'react': ['react', 'javascript', 'jsx', 'hooks', 'redux', 'context api', 'html', 'css', 'state', 'web development'],
        'python': ['python', 'django', 'flask', 'fastapi', 'data structure', 'scripting', 'algorithms', 'sql', 'pandas', 'numpy'],
        'figma': ['figma', 'ui/ux', 'design system', 'wireframe', 'prototype', 'user flow', 'auto layout', 'adobe xd', 'sketch', 'components']
    };

    const target = targetSkill.toLowerCase().trim();
    const keywords = skillsKeywords[target] || ['programming', 'software', 'git', 'database', 'project', 'testing'];

    let matchedCount = 0;
    keywords.forEach(kw => {
        if (lowerText.includes(kw)) {
            matchedCount++;
        } else {
            missingKeywords.push(kw);
        }
    });

    const matchRatio = matchedCount / keywords.length;
    score += Math.round(matchRatio * 20);

    if (matchRatio < 0.4) {
        recommendations.push(`Include more keywords related to your target skill (${targetSkill}): e.g. ${missingKeywords.slice(0, 3).join(', ')}.`);
    } else {
        recommendations.push("Great keyword density for your target skill track!");
    }

    return {
        score: Math.min(100, score),
        missingKeywords,
        recommendations
    };
}

// 3. Generate Skill Gap Analysis & Custom Learning Path
function generateLearningRoadmap(userId, skill) {
    const normSkill = skill.toLowerCase().trim();
    const blueprint = ROADMAPS_DB[normSkill] || DEFAULT_ROADMAP;
    return blueprint;
}

// 4. Scans text for toxicity or spam, returning flags
function performContentModeration(text) {
    const isToxicText = isToxic(text);
    const isSpamText = isSpam(text);

    return {
        flagged: isToxicText || isSpamText,
        reason: isToxicText ? 'toxicity' : (isSpamText ? 'spam' : null)
    };
}

module.exports = {
    getCompatibilityScore,
    analyzeResume,
    generateLearningRoadmap,
    performContentModeration
};
