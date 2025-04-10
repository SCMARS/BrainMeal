const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getUserProfile, updateUserProfile } = require('../controllers/profile');
const logger = require('../utils/logger');

// Get user profile
router.get('/', auth, async (req, res, next) => {
    try {
        const profile = await getUserProfile(req.user.uid);
        res.json(profile);
    } catch (error) {
        logger.error('Error getting user profile:', error);
        next(error);
    }
});

// Update user profile
router.put('/', auth, async (req, res, next) => {
    try {
        const updatedProfile = await updateUserProfile(req.user.uid, req.body);
        res.json(updatedProfile);
    } catch (error) {
        logger.error('Error updating user profile:', error);
        next(error);
    }
});

module.exports = router; 