import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    getDoc,
    query, 
    where, 
    orderBy,
    onSnapshot,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Сервис для работы с планами питания
 * Обеспечивает точные расчеты калорий и КБЖУ
 */

// Константы для расчета калорий
const CALORIE_MULTIPLIERS = {
    sedentary: 1.2,      // Малоподвижный образ жизни
    light: 1.375,        // Легкая активность
    moderate: 1.55,      // Умеренная активность
    active: 1.725,       // Высокая активность
    veryActive: 1.9      // Очень высокая активность
};

// Макронутриенты для разных типов диет (в процентах от калорий)
const DIET_MACROS = {
    balanced: { protein: 25, carbs: 45, fat: 30 },
    cutting: { protein: 35, carbs: 25, fat: 40 },
    bulking: { protein: 25, carbs: 50, fat: 25 },
    keto: { protein: 25, carbs: 5, fat: 70 },
    lowCarb: { protein: 30, carbs: 20, fat: 50 },
    highProtein: { protein: 40, carbs: 30, fat: 30 }
};

/**
 * Рассчитывает базовый метаболизм (BMR) по формуле Миффлина-Сан Жеора
 */
export const calculateBMR = (weight, height, age, gender) => {
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
};

/**
 * Рассчитывает общий расход калорий (TDEE)
 */
export const calculateTDEE = (bmr, activityLevel) => {
    const multiplier = CALORIE_MULTIPLIERS[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
};

/**
 * Рассчитывает целевые калории в зависимости от цели
 */
export const calculateTargetCalories = (tdee, goal) => {
    switch (goal) {
        case 'cutting':
        case 'weightLoss':
            return Math.round(tdee * 0.8); // Дефицит 20%
        case 'bulking':
        case 'weightGain':
            return Math.round(tdee * 1.15); // Профицит 15%
        case 'maintenance':
        default:
            return tdee;
    }
};

/**
 * Рассчитывает макронутриенты в граммах
 */
export const calculateMacros = (calories, dietType = 'balanced') => {
    const macros = DIET_MACROS[dietType] || DIET_MACROS.balanced;
    
    return {
        protein: Math.round((calories * macros.protein / 100) / 4), // 4 ккал/г
        carbs: Math.round((calories * macros.carbs / 100) / 4),     // 4 ккал/г
        fat: Math.round((calories * macros.fat / 100) / 9)          // 9 ккал/г
    };
};

/**
 * Получает все приемы пищи пользователя
 */
export const getUserMeals = async (userId) => {
    try {
        const mealsRef = collection(db, 'meals');
        const q = query(
            mealsRef,
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching user meals:', error);
        throw error;
    }
};

/**
 * Получает приемы пищи за определенную дату
 */
export const getMealsByDate = async (userId, date) => {
    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const mealsRef = collection(db, 'meals');
        const q = query(
            mealsRef,
            where('userId', '==', userId),
            where('date', '>=', startOfDay.toISOString()),
            where('date', '<=', endOfDay.toISOString())
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching meals by date:', error);
        throw error;
    }
};

/**
 * Добавляет новый прием пищи
 */
export const addMeal = async (mealData) => {
    try {
        // Валидация данных
        if (!mealData.name || !mealData.userId) {
            throw new Error('Название блюда и ID пользователя обязательны');
        }

        // Обеспечиваем точность калорий
        const calories = Number(mealData.calories) || 0;
        const protein = Number(mealData.protein) || 0;
        const carbs = Number(mealData.carbs) || 0;
        const fat = Number(mealData.fat) || 0;

        // Проверяем соответствие калорий макронутриентам
        const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
        const calorieDifference = Math.abs(calories - calculatedCalories);
        
        if (calorieDifference > 10) {
            console.warn(`Несоответствие калорий: указано ${calories}, рассчитано ${calculatedCalories}`);
        }

        const meal = {
            ...mealData,
            calories,
            protein,
            carbs,
            fat,
            calculatedCalories,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'meals'), meal);
        return { id: docRef.id, ...meal };
    } catch (error) {
        console.error('Error adding meal:', error);
        throw error;
    }
};

/**
 * Обновляет прием пищи
 */
export const updateMeal = async (mealId, mealData) => {
    try {
        const calories = Number(mealData.calories) || 0;
        const protein = Number(mealData.protein) || 0;
        const carbs = Number(mealData.carbs) || 0;
        const fat = Number(mealData.fat) || 0;

        const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);

        const updatedMeal = {
            ...mealData,
            calories,
            protein,
            carbs,
            fat,
            calculatedCalories,
            updatedAt: serverTimestamp()
        };

        await updateDoc(doc(db, 'meals', mealId), updatedMeal);
        return { id: mealId, ...updatedMeal };
    } catch (error) {
        console.error('Error updating meal:', error);
        throw error;
    }
};

/**
 * Удаляет прием пищи
 */
export const deleteMeal = async (mealId) => {
    try {
        await deleteDoc(doc(db, 'meals', mealId));
        return true;
    } catch (error) {
        console.error('Error deleting meal:', error);
        throw error;
    }
};

/**
 * Рассчитывает общую пищевую ценность за день
 */
export const calculateDailyNutrition = (meals) => {
    return meals.reduce((total, meal) => ({
        calories: total.calories + (Number(meal.calories) || 0),
        protein: total.protein + (Number(meal.protein) || 0),
        carbs: total.carbs + (Number(meal.carbs) || 0),
        fat: total.fat + (Number(meal.fat) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

/**
 * Подписка на изменения приемов пищи в реальном времени
 */
export const subscribeMeals = (userId, callback) => {
    const mealsRef = collection(db, 'meals');
    const q = query(
        mealsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
        const meals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(meals);
    });
};

/**
 * Валидирует план питания на точность калорий
 */
export const validateMealPlan = (meals, targetCalories, tolerance = 50) => {
    const totalCalories = meals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
    const difference = Math.abs(totalCalories - targetCalories);
    
    return {
        isValid: difference <= tolerance,
        totalCalories,
        targetCalories,
        difference,
        tolerance
    };
};
