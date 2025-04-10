const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов за 15 минут
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests, please try again later.'
    }
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 5, // максимум 5 попыток входа в час
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many login attempts, please try again later.'
    }
});

module.exports = {
    apiLimiter,
    authLimiter
}; 