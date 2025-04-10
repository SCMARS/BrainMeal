const { auth } = require('../config/firebase-admin');
const logger = require('../utils/logger');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            logger.warn('No token provided in request');
            return res.status(401).json({ error: 'No token provided' });
        }

        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;
        logger.info(`Token verified for user ${decodedToken.uid}`);
        next();
    } catch (error) {
        logger.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { verifyToken }; 