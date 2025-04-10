const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query
    });

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.details || err.message
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token'
        });
    }

    if (err.name === 'ForbiddenError') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'You do not have permission to access this resource'
        });
    }

    if (err.name === 'NotFoundError') {
        return res.status(404).json({
            error: 'Not Found',
            message: err.message || 'Resource not found'
        });
    }

    // Default error
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

module.exports = errorHandler; 