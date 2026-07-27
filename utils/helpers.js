const crypto = require('crypto');

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
}

function parseCSVString(str) {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(Boolean);
}

function isToxic(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    const badWords = [
        'abuse', 'fuck', 'shit', 'asshole', 'bitch', 'idiot', 'stupid',
        'scam', 'spam', 'fake', 'hacker', 'retard', 'bastard', 'crap'
    ];
    return badWords.some(word => lower.includes(word));
}

function isSpam(text) {
    if (!text) return false;
    // Check for repetitive sequences, suspicious links, spam keywords
    const lower = text.toLowerCase();
    const spamIndicators = ['buy now', 'click here', 'free money', 'make money fast', 'double your money', 'earn cash', 'whatsapp me', 'telegram me'];
    if (spamIndicators.some(ind => lower.includes(ind))) return true;
    
    // Repetition check (e.g., repeating the same word many times)
    const words = lower.split(/\s+/);
    if (words.length > 10) {
        const unique = new Set(words);
        if (unique.size / words.length < 0.3) return true; // Less than 30% unique words
    }
    return false;
}

module.exports = {
    generateOTP,
    parseCSVString,
    isToxic,
    isSpam
};
