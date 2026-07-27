const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
    logger.error(`Error in route ${req.method} ${req.url}: ${err.message}`, {
        stack: err.stack,
        ip: req.ip,
        user: req.user ? req.user.id : 'Guest'
    });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        msg: message,
        status: 'error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

module.exports = errorHandler;
