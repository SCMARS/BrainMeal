import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useMealPlan } from './MealPlanContext';
import {
    loadUserAchievements,
    saveUserAchievements,
    updateAchievementProgress,
    unlockAchievement,
    getAchievementStats,
    subscribeToAchievements,
    DEFAULT_ACHIEVEMENTS
} from '../services/achievementsService';

const AchievementsContext = createContext();

export const useAchievements = () => {
    const context = useContext(AchievementsContext);
    if (!context) {
        throw new Error('useAchievements must be used within an AchievementsProvider');
    }
    return context;
};

export const AchievementsProvider = ({ children }) => {
    const { user } = useAuth();
    const { meals } = useMealPlan();
    const [achievements, setAchievements] = useState(DEFAULT_ACHIEVEMENTS);
    const [stats, setStats] = useState({
        totalPoints: 0,
        completedCount: 0,
        totalAchievements: 0,
        completionRate: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Загрузка достижений при входе пользователя
    useEffect(() => {
        if (user?.uid) {
            loadAchievements();
            setupRealtimeSubscription();
        } else {
            setAchievements(DEFAULT_ACHIEVEMENTS);
            setStats({
                totalPoints: 0,
                completedCount: 0,
                totalAchievements: DEFAULT_ACHIEVEMENTS.length,
                completionRate: 0
            });
        }
    }, [user?.uid]);

    // Загрузка достижений
    const loadAchievements = async () => {
        try {
            setLoading(true);
            const userAchievements = await loadUserAchievements(user.uid);
            setAchievements(userAchievements);
            
            const achievementStats = await getAchievementStats(user.uid);
            setStats(achievementStats);
            
            setError(null);
        } catch (err) {
            console.error('Error loading achievements:', err);
            setError('Ошибка загрузки достижений');
        } finally {
            setLoading(false);
        }
    };

    // Подписка на изменения в реальном времени
    const setupRealtimeSubscription = () => {
        if (!user?.uid) return;

        const unsubscribe = subscribeToAchievements(user.uid, (updatedAchievements) => {
            setAchievements(updatedAchievements);
            updateStats(updatedAchievements);
        });

        return unsubscribe;
    };

    // Обновление статистики
    const updateStats = (achievementsList) => {
        const completedCount = achievementsList.filter(a => a.completed).length;
        const totalPoints = achievementsList
            .filter(a => a.completed)
            .reduce((sum, a) => sum + (a.points || 0), 0);
        
        setStats({
            totalPoints,
            completedCount,
            totalAchievements: achievementsList.length,
            completionRate: achievementsList.length > 0 
                ? Math.round((completedCount / achievementsList.length) * 100) 
                : 0
        });
    };

    // Проверка и обновление достижений на основе активности
    useEffect(() => {
        if (user?.uid && achievements.length > 0) {
            checkAndUpdateAchievements();
        }
    }, [user?.uid, meals, achievements.length]);

    // Проверка достижений
    const checkAndUpdateAchievements = async () => {
        try {
            let hasUpdates = false;
            const updatedAchievements = [...achievements];

            // Проверка первого плана питания
            const firstMealPlan = updatedAchievements.find(a => a.id === 'first_meal_plan');
            if (firstMealPlan && !firstMealPlan.completed && meals.length > 0) {
                firstMealPlan.completed = true;
                firstMealPlan.progress = 1;
                firstMealPlan.unlockedAt = new Date().toISOString();
                hasUpdates = true;
                console.log('🎉 Achievement unlocked: First Meal Plan!');
            }

            // Проверка 5 планов питания
            const mealPlans5 = updatedAchievements.find(a => a.id === 'meal_plans_5');
            if (mealPlans5 && !mealPlans5.completed) {
                const planCount = Math.min(meals.length, 5);
                mealPlans5.progress = planCount;
                if (planCount >= 5) {
                    mealPlans5.completed = true;
                    mealPlans5.unlockedAt = new Date().toISOString();
                    hasUpdates = true;
                    console.log('🎉 Achievement unlocked: 5 Meal Plans!');
                }
            }

            // Проверка исследователя рецептов
            const recipeExplorer = updatedAchievements.find(a => a.id === 'recipe_explorer');
            if (recipeExplorer && !recipeExplorer.completed) {
                const uniqueRecipes = new Set(meals.map(m => m.name)).size;
                recipeExplorer.progress = Math.min(uniqueRecipes, 20);
                if (uniqueRecipes >= 20) {
                    recipeExplorer.completed = true;
                    recipeExplorer.unlockedAt = new Date().toISOString();
                    hasUpdates = true;
                    console.log('🎉 Achievement unlocked: Recipe Explorer!');
                }
            }

            // Проверка здорового выбора
            const healthyChoices = updatedAchievements.find(a => a.id === 'healthy_choices');
            if (healthyChoices && !healthyChoices.completed) {
                const healthyMeals = meals.filter(m => 
                    m.calories < 500 && 
                    m.protein > 15 && 
                    (m.name.toLowerCase().includes('салат') || 
                     m.name.toLowerCase().includes('овощ') ||
                     m.name.toLowerCase().includes('фрукт'))
                ).length;
                healthyChoices.progress = Math.min(healthyMeals, 15);
                if (healthyMeals >= 15) {
                    healthyChoices.completed = true;
                    healthyChoices.unlockedAt = new Date().toISOString();
                    hasUpdates = true;
                    console.log('🎉 Achievement unlocked: Healthy Choices!');
                }
            }

            // Сохраняем обновления
            if (hasUpdates) {
                await saveUserAchievements(user.uid, updatedAchievements);
                setAchievements(updatedAchievements);
                updateStats(updatedAchievements);
            }
        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    };

    // Ручное разблокирование достижения
    const unlockAchievementManually = async (achievementId) => {
        try {
            const unlockedAchievement = await unlockAchievement(user.uid, achievementId);
            if (unlockedAchievement) {
                await loadAchievements(); // Перезагружаем для синхронизации
                return unlockedAchievement;
            }
        } catch (error) {
            console.error('Error unlocking achievement:', error);
            throw error;
        }
    };

    // Обновление прогресса достижения
    const updateProgress = async (achievementId, progress, completed = false) => {
        try {
            const updatedAchievement = await updateAchievementProgress(
                user.uid, 
                achievementId, 
                progress, 
                completed
            );
            if (updatedAchievement) {
                await loadAchievements(); // Перезагружаем для синхронизации
                return updatedAchievement;
            }
        } catch (error) {
            console.error('Error updating achievement progress:', error);
            throw error;
        }
    };

    // Получение достижений по категории
    const getAchievementsByCategory = (category) => {
        return achievements.filter(a => a.category === category);
    };

    // Получение завершенных достижений
    const getCompletedAchievements = () => {
        return achievements.filter(a => a.completed);
    };

    // Получение незавершенных достижений
    const getPendingAchievements = () => {
        return achievements.filter(a => !a.completed);
    };

    // Получение достижений по редкости
    const getAchievementsByRarity = (rarity) => {
        return achievements.filter(a => a.rarity === rarity);
    };

    const value = {
        achievements,
        stats,
        loading,
        error,
        loadAchievements,
        unlockAchievementManually,
        updateProgress,
        checkAndUpdateAchievements,
        getAchievementsByCategory,
        getCompletedAchievements,
        getPendingAchievements,
        getAchievementsByRarity
    };

    return (
        <AchievementsContext.Provider value={value}>
            {children}
        </AchievementsContext.Provider>
    );
};

export default AchievementsContext;
