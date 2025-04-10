const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');
const { authenticateToken } = require('../middleware/auth');

// Получение плана питания
router.get('/', authenticateToken, async (req, res) => {
    try {
        const mealPlanRef = db.collection('mealPlans')
            .where('userId', '==', req.user.uid)
            .orderBy('createdAt', 'desc')
            .limit(1);
        
        const snapshot = await mealPlanRef.get();
        if (snapshot.empty) {
            return res.status(404).json({ error: 'No meal plan found' });
        }

        const mealPlan = snapshot.docs[0].data();
        res.json(mealPlan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Генерация нового плана питания
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { userData, existingMeals } = req.body;

        // Валидация данных пользователя
        const requiredFields = ['age', 'gender', 'weight', 'height', 'dietType', 'calorieTarget', 'activityLevel'];
        const missingFields = requiredFields.filter(field => !userData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Подготовка данных для генерации
        const userProfile = {
            age: Number(userData.age),
            gender: userData.gender,
            weight: Number(userData.weight),
            height: Number(userData.height),
            dietType: userData.dietType,
            calorieTarget: Number(userData.calorieTarget),
            activityLevel: userData.activityLevel,
            foodPreferences: userData.dietaryPreferences || [],
            allergies: userData.allergies || []
        };

        // Здесь будет вызов сервиса генерации плана питания
        const generatedPlan = {
            userId: req.user.uid,
            createdAt: new Date().toISOString(),
            plan: [], // Здесь будет результат генерации
            userProfile,
            status: 'generated'
        };

        // Сохранение плана в Firestore
        const docRef = await db.collection('mealPlans').add(generatedPlan);
        generatedPlan.id = docRef.id;

        res.json(generatedPlan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Обновление плана питания
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { plan } = req.body;

        const mealPlanRef = db.collection('mealPlans').doc(id);
        const doc = await mealPlanRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }

        if (doc.data().userId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await mealPlanRef.update({
            plan,
            updatedAt: new Date().toISOString()
        });

        res.json({ message: 'Meal plan updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Удаление плана питания
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const mealPlanRef = db.collection('mealPlans').doc(id);
        const doc = await mealPlanRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }

        if (doc.data().userId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await mealPlanRef.delete();
        res.json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 