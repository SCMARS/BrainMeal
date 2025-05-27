import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    deleteDoc,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

// Базовые достижения (используют ключи переводов)
export const DEFAULT_ACHIEVEMENTS = [
    {
        id: 'first_meal_plan',
        titleKey: 'firstMealPlan',
        descriptionKey: 'firstMealPlanDesc',
        type: 'milestone',
        category: 'meal_planning',
        completed: false,
        progress: 0,
        total: 1,
        reward: 'Разблокированы функции настройки плана питания',
        points: 100,
        icon: '🍽️',
        rarity: 'common',
        unlockedAt: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'profile_complete',
        titleKey: 'profileComplete',
        descriptionKey: 'profileCompleteDesc',
        type: 'milestone',
        category: 'profile',
        completed: false,
        progress: 0,
        total: 1,
        reward: 'Улучшенные рекомендации питания',
        points: 50,
        icon: '👤',
        rarity: 'common',
        unlockedAt: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'meal_plans_5',
        titleKey: 'mealPlans5',
        descriptionKey: 'mealPlans5Desc',
        type: 'progress',
        category: 'meal_planning',
        completed: false,
        progress: 0,
        total: 5,
        reward: 'Разблокированы премиум рецепты',
        points: 250,
        icon: '🔥',
        rarity: 'uncommon',
        unlockedAt: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'weight_goal',
        titleKey: 'weightGoal',
        descriptionKey: 'weightGoalDesc',
        type: 'milestone',
        category: 'health',
        completed: false,
        progress: 0,
        total: 1,
        reward: 'Персональный тренер по питанию',
        points: 500,
        icon: '🎯',
        rarity: 'rare',
        unlockedAt: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'streak_7_days',
        titleKey: 'streak7Days',
        descriptionKey: 'streak7DaysDesc',
        type: 'streak',
        category: 'consistency',
        completed: false,
        progress: 0,
        total: 7,
        reward: 'Бонусные рецепты',
        points: 300,
        icon: '📅',
        rarity: 'uncommon',
        unlockedAt: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'calorie_master',
        titleKey: 'calorieMaster',
        descriptionKey: 'calorieMasterDesc',
        type: 'progress',
        category: 'nutrition',
        completed: false,
        progress: 0,
        total: 10,
        reward: 'Калькулятор макронутриентов',
        points: 400,
        icon: '⚡',
        rarity: 'rare',
        unlockedAt: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'recipe_explorer',
        titleKey: 'recipeExplorer',
        descriptionKey: 'recipeExplorerDesc',
        type: 'progress',
        category: 'variety',
        completed: false,
        progress: 0,
        total: 20,
        reward: 'Доступ к международной кухне',
        points: 600,
        icon: '🌟',
        rarity: 'epic',
        unlockedAt: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'social_sharer',
        titleKey: 'socialSharer',
        descriptionKey: 'socialSharerDesc',
        type: 'progress',
        category: 'social',
        completed: false,
        progress: 0,
        total: 5,
        reward: 'Социальные функции',
        points: 200,
        icon: '📱',
        rarity: 'uncommon',
        unlockedAt: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'healthy_choices',
        titleKey: 'healthyChoices',
        descriptionKey: 'healthyChoicesDesc',
        type: 'progress',
        category: 'health',
        completed: false,
        progress: 0,
        total: 15,
        reward: 'Гид по здоровому питанию',
        points: 350,
        icon: '🥗',
        rarity: 'uncommon',
        unlockedAt: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'legendary_user',
        titleKey: 'legendaryUser',
        descriptionKey: 'legendaryUserDesc',
        type: 'streak',
        category: 'loyalty',
        completed: false,
        progress: 0,
        total: 30,
        reward: 'Статус VIP и все премиум функции',
        points: 1000,
        icon: '👑',
        rarity: 'legendary',
        unlockedAt: null,
        createdAt: new Date().toISOString()
    }
];

// Загрузка достижений пользователя
export const loadUserAchievements = async (userId) => {
    try {
        const userAchievementsRef = doc(db, 'userAchievements', userId);
        const docSnap = await getDoc(userAchievementsRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('📊 Loaded achievements from Firebase:', data.achievements?.length || 0);
            return data.achievements || DEFAULT_ACHIEVEMENTS;
        } else {
            // Если достижений нет, создаем базовые
            await initializeUserAchievements(userId);
            return DEFAULT_ACHIEVEMENTS;
        }
    } catch (error) {
        console.error('❌ Error loading achievements:', error);
        return DEFAULT_ACHIEVEMENTS;
    }
};

// Инициализация достижений для нового пользователя
export const initializeUserAchievements = async (userId) => {
    try {
        const userAchievementsRef = doc(db, 'userAchievements', userId);
        await setDoc(userAchievementsRef, {
            userId,
            achievements: DEFAULT_ACHIEVEMENTS,
            totalPoints: 0,
            completedCount: 0,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
        console.log('✅ Initialized achievements for user:', userId);
    } catch (error) {
        console.error('❌ Error initializing achievements:', error);
        throw error;
    }
};

// Сохранение достижений пользователя
export const saveUserAchievements = async (userId, achievements) => {
    try {
        const userAchievementsRef = doc(db, 'userAchievements', userId);

        const completedCount = achievements.filter(a => a.completed).length;
        const totalPoints = achievements
            .filter(a => a.completed)
            .reduce((sum, a) => sum + (a.points || 0), 0);

        await updateDoc(userAchievementsRef, {
            achievements,
            totalPoints,
            completedCount,
            lastUpdated: new Date().toISOString()
        });

        console.log('✅ Saved achievements to Firebase:', completedCount, 'completed');
    } catch (error) {
        console.error('❌ Error saving achievements:', error);
        throw error;
    }
};

// Обновление прогресса достижения
export const updateAchievementProgress = async (userId, achievementId, progress, completed = false) => {
    try {
        const achievements = await loadUserAchievements(userId);
        const achievementIndex = achievements.findIndex(a => a.id === achievementId);

        if (achievementIndex !== -1) {
            achievements[achievementIndex].progress = progress;
            achievements[achievementIndex].completed = completed;

            if (completed && !achievements[achievementIndex].unlockedAt) {
                achievements[achievementIndex].unlockedAt = new Date().toISOString();
            }

            await saveUserAchievements(userId, achievements);

            if (completed) {
                console.log('🎉 Achievement unlocked:', achievements[achievementIndex].title);
            }

            return achievements[achievementIndex];
        }
    } catch (error) {
        console.error('❌ Error updating achievement progress:', error);
        throw error;
    }
};

// Разблокировка достижения
export const unlockAchievement = async (userId, achievementId) => {
    return await updateAchievementProgress(userId, achievementId, 1, true);
};

// Получение статистики достижений
export const getAchievementStats = async (userId) => {
    try {
        const userAchievementsRef = doc(db, 'userAchievements', userId);
        const docSnap = await getDoc(userAchievementsRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                totalPoints: data.totalPoints || 0,
                completedCount: data.completedCount || 0,
                totalAchievements: data.achievements?.length || 0,
                completionRate: data.achievements?.length > 0
                    ? Math.round((data.completedCount / data.achievements.length) * 100)
                    : 0
            };
        }

        return {
            totalPoints: 0,
            completedCount: 0,
            totalAchievements: DEFAULT_ACHIEVEMENTS.length,
            completionRate: 0
        };
    } catch (error) {
        console.error('❌ Error getting achievement stats:', error);
        return {
            totalPoints: 0,
            completedCount: 0,
            totalAchievements: 0,
            completionRate: 0
        };
    }
};

// Подписка на изменения достижений в реальном времени
export const subscribeToAchievements = (userId, callback) => {
    try {
        const userAchievementsRef = doc(db, 'userAchievements', userId);

        return onSnapshot(userAchievementsRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                callback(data.achievements || DEFAULT_ACHIEVEMENTS);
            } else {
                callback(DEFAULT_ACHIEVEMENTS);
            }
        }, (error) => {
            console.error('❌ Error in achievements subscription:', error);
            callback(DEFAULT_ACHIEVEMENTS);
        });
    } catch (error) {
        console.error('❌ Error setting up achievements subscription:', error);
        return () => {}; // Возвращаем пустую функцию отписки
    }
};
