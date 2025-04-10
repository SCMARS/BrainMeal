const { db } = require('../config/firebase');
const logger = require('../utils/logger');

const getUserProfile = async (userId) => {
    try {
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();

        if (!doc.exists) {
            throw new Error('User profile not found');
        }

        return doc.data();
    } catch (error) {
        logger.error('Error in getUserProfile:', error);
        throw error;
    }
};

const updateUserProfile = async (userId, profileData) => {
    try {
        const userRef = db.collection('users').doc(userId);
        
        // Validate required fields
        const requiredFields = ['name', 'email', 'age', 'gender', 'weight', 'height'];
        for (const field of requiredFields) {
            if (!profileData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate numeric fields
        const numericFields = ['age', 'weight', 'height'];
        for (const field of numericFields) {
            if (isNaN(Number(profileData[field]))) {
                throw new Error(`Invalid ${field}: must be a number`);
            }
        }

        await userRef.update(profileData);
        return profileData;
    } catch (error) {
        logger.error('Error in updateUserProfile:', error);
        throw error;
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile
}; 