const User = require('../models/User');
const logger = require('../utils/logger');

// Создание или обновление профиля пользователя
exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { firebaseId, ...profileData } = req.body;
        
        // Проверяем существование пользователя
        let user = await User.findOne({ firebaseId });
        
        if (user) {
            // Обновляем существующий профиль
            user = await User.findOneAndUpdate(
                { firebaseId },
                { ...profileData, updatedAt: Date.now() },
                { new: true }
            );
            logger.info(`Profile updated for user ${firebaseId}`);
        } else {
            // Создаем новый профиль
            user = new User({
                firebaseId,
                ...profileData
            });
            await user.save();
            logger.info(`New profile created for user ${firebaseId}`);
        }
        
        res.status(200).json(user);
    } catch (error) {
        logger.error('Error in createOrUpdateProfile:', error);
        res.status(500).json({ error: 'Failed to save profile data' });
    }
};

// Получение профиля пользователя
exports.getProfile = async (req, res) => {
    try {
        const { firebaseId } = req.params;
        const user = await User.findOne({ firebaseId });
        
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        logger.error('Error in getProfile:', error);
        res.status(500).json({ error: 'Failed to fetch profile data' });
    }
};

// Обновление профиля пользователя
exports.updateProfile = async (req, res) => {
    try {
        const { firebaseId } = req.params;
        const updateData = req.body;
        
        const user = await User.findOneAndUpdate(
            { firebaseId },
            { ...updateData, updatedAt: Date.now() },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        logger.info(`Profile updated for user ${firebaseId}`);
        res.status(200).json(user);
    } catch (error) {
        logger.error('Error in updateProfile:', error);
        res.status(500).json({ error: 'Failed to update profile data' });
    }
};

// Удаление профиля пользователя
exports.deleteProfile = async (req, res) => {
    try {
        const { firebaseId } = req.params;
        const user = await User.findOneAndDelete({ firebaseId });
        
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        logger.info(`Profile deleted for user ${firebaseId}`);
        res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        logger.error('Error in deleteProfile:', error);
        res.status(500).json({ error: 'Failed to delete profile data' });
    }
}; 