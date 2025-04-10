const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Получить профиль пользователя
router.get('/:firebaseId', verifyToken, userController.getProfile);

// Создать или обновить профиль
router.post('/', verifyToken, userController.createOrUpdateProfile);

// Обновить профиль
router.put('/:firebaseId', verifyToken, userController.updateProfile);

// Удалить профиль
router.delete('/:firebaseId', verifyToken, userController.deleteProfile);

module.exports = router; 