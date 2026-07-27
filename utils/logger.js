const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../platform.log');

function log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    
    // Console output
    if (level === 'error') {
        console.error(formattedMessage);
    } else if (level === 'warn') {
        console.warn(formattedMessage);
    } else {
        console.log(formattedMessage);
    }
    
    // Log to file asynchronously
    fs.appendFile(logFilePath, formattedMessage + '\n', 'utf8', (err) => {
        if (err) console.error('Failed to write to platform.log:', err.message);
    });
}

module.exports = {
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta)
};
