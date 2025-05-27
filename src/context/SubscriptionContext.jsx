import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import {
    getUserSubscription,
    hasActiveSubscription,
    getUserFeatures,
    SUBSCRIPTION_PLANS
} from '../services/stripeService';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SubscriptionContext = createContext();

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};

export const SubscriptionProvider = ({ children }) => {
    const [subscription, setSubscription] = useState(null);
    const [features, setFeatures] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mealPlanCount, setMealPlanCount] = useState(0); // Счетчик полных планов питания
    const [totalGenerations, setTotalGenerations] = useState(0); // Счетчик всех генераций
    const [weeklyPlansCount, setWeeklyPlansCount] = useState(0); // Счетчик недельных планов (лимит 5)
    const { user } = useAuth();

    // Загрузка счетчика планов питания и генераций
    const loadMealPlanCount = async () => {
        if (!user?.uid) {
            setMealPlanCount(0);
            setTotalGenerations(0);
            setWeeklyPlansCount(0);
            return;
        }

        try {
            const userStatsRef = doc(db, 'userStats', user.uid);
            const userStatsDoc = await getDoc(userStatsRef);

            if (userStatsDoc.exists()) {
                const data = userStatsDoc.data();
                setMealPlanCount(data.mealPlanCount || 0);
                setTotalGenerations(data.totalGenerations || 0);
                setWeeklyPlansCount(data.weeklyPlansCount || 0);
            } else {
                // Создаем документ статистики если его нет
                await setDoc(userStatsRef, {
                    mealPlanCount: 0,
                    totalGenerations: 0,
                    weeklyPlansCount: 0,
                    createdAt: new Date(),
                    lastUpdated: new Date()
                });
                setMealPlanCount(0);
                setTotalGenerations(0);
                setWeeklyPlansCount(0);
            }
        } catch (err) {
            console.error('Error loading meal plan count:', err);
            setMealPlanCount(0);
            setTotalGenerations(0);
            setWeeklyPlansCount(0);
        }
    };

    // Загрузка данных подписки
    const loadSubscriptionData = async () => {
        if (!user?.uid) {
            setSubscription(null);
            setFeatures(null);
            setIsActive(false);
            setMealPlanCount(0);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [userSubscription, activeStatus, userFeatures] = await Promise.all([
                getUserSubscription(user.uid),
                hasActiveSubscription(user.uid),
                getUserFeatures(user.uid),
                loadMealPlanCount()
            ]);

            setSubscription(userSubscription);
            setIsActive(activeStatus);
            setFeatures(userFeatures);

            console.log('Subscription data loaded:', {
                subscription: userSubscription,
                isActive: activeStatus,
                features: userFeatures,
                mealPlanCount
            });

        } catch (err) {
            console.error('Error loading subscription data:', err);
            setError(err.message);

            // Устанавливаем бесплатные функции при ошибке
            setFeatures({
                maxMealPlans: 5,
                maxRecipes: 10,
                aiRecommendations: false,
                analytics: false,
                support: 'basic',
                dietTypes: ['balanced', 'cutting']
            });
        } finally {
            setLoading(false);
        }
    };

    // Перезагрузка данных подписки
    const refreshSubscription = async () => {
        await loadSubscriptionData();
    };

    // Проверка доступности функции
    const hasFeature = (featureName) => {
        if (!features) return false;
        return features[featureName] === true || features[featureName] === -1;
    };

    // Проверка лимитов
    const checkLimit = (limitName, currentCount) => {
        if (!features) return false;

        const limit = features[limitName];
        if (limit === -1) return true; // безлимит
        if (typeof limit !== 'number') return false;

        return currentCount < limit;
    };

    // Проверка возможности создания нового недельного плана питания
    const canCreateWeeklyPlan = () => {
        if (!features) return false;
        if (isActive) return true; // Премиум пользователи могут создавать безлимитно

        const limit = features.maxWeeklyPlans || 5;
        return weeklyPlansCount < limit;
    };

    // Проверка возможности создания нового плана питания или генерации
    const canCreateMealPlan = () => {
        if (!features) return false;
        if (isActive) return true; // Премиум пользователи могут создавать безлимитно

        const limit = features.maxGenerations || 5;
        return totalGenerations < limit;
    };

    // Проверка возможности генерации (для любого типа генерации)
    const canGenerate = () => {
        return canCreateMealPlan();
    };

    // Увеличение счетчика недельных планов питания
    const incrementWeeklyPlanCount = async () => {
        if (!user?.uid) return false;

        try {
            const userStatsRef = doc(db, 'userStats', user.uid);
            const newWeeklyPlansCount = weeklyPlansCount + 1;
            const newMealPlanCount = mealPlanCount + 1;
            const newTotalGenerations = totalGenerations + 1;

            await updateDoc(userStatsRef, {
                weeklyPlansCount: newWeeklyPlansCount,
                mealPlanCount: newMealPlanCount,
                totalGenerations: newTotalGenerations,
                lastUpdated: new Date()
            });

            setWeeklyPlansCount(newWeeklyPlansCount);
            setMealPlanCount(newMealPlanCount);
            setTotalGenerations(newTotalGenerations);
            return true;
        } catch (err) {
            console.error('Error incrementing weekly plan count:', err);
            return false;
        }
    };

    // Увеличение счетчика планов питания (для совместимости)
    const incrementMealPlanCount = async () => {
        return await incrementWeeklyPlanCount();
    };

    // Увеличение счетчика генераций (для отдельных блюд)
    const incrementGenerationCount = async () => {
        if (!user?.uid) return false;

        try {
            const userStatsRef = doc(db, 'userStats', user.uid);
            const newTotalGenerations = totalGenerations + 1;

            await updateDoc(userStatsRef, {
                totalGenerations: newTotalGenerations,
                lastUpdated: new Date()
            });

            setTotalGenerations(newTotalGenerations);
            return true;
        } catch (err) {
            console.error('Error incrementing generation count:', err);
            return false;
        }
    };

    // Получение оставшихся недельных планов
    const getRemainingWeeklyPlans = () => {
        if (!features) return 0;
        if (isActive) return -1; // безлимит для премиум

        const limit = features.maxWeeklyPlans || 5;
        return Math.max(0, limit - weeklyPlansCount);
    };

    // Получение оставшихся планов питания (для совместимости)
    const getRemainingMealPlans = () => {
        return getRemainingWeeklyPlans();
    };

    // Получение оставшихся генераций
    const getRemainingGenerations = () => {
        if (!features) return 0;
        if (isActive) return -1; // безлимит для премиум

        const limit = features.maxGenerations || 5;
        return Math.max(0, limit - totalGenerations);
    };

    // Получение информации о плане
    const getPlanInfo = () => {
        if (!subscription || !isActive) {
            return {
                nameKey: 'freeAccount',
                name: 'Бесплатный план', // fallback для обратной совместимости
                descriptionKey: 'basicNutritionFeatures',
                description: 'Базовые возможности планирования питания',
                price: 0,
                features: features || {}
            };
        }

        const plan = SUBSCRIPTION_PLANS[subscription.planId];
        return {
            nameKey: plan?.nameKey || 'unknownPlan',
            name: plan?.nameKey || 'Неизвестный план', // fallback для обратной совместимости
            descriptionKey: plan?.descriptionKey || '',
            description: plan?.descriptionKey || '',
            price: plan?.price || 0,
            features: features || {},
            expiresAt: subscription.expiresAt,
            status: subscription.status
        };
    };

    // Проверка необходимости обновления плана
    const needsUpgrade = (requiredFeature) => {
        return !hasFeature(requiredFeature) && !isActive;
    };

    // Получение рекомендуемого плана для функции
    const getRecommendedPlan = (requiredFeature) => {
        // Логика определения минимального плана для функции
        const featurePlanMapping = {
            aiRecommendations: 'premium',
            analytics: 'premium',
            nutritionistConsultation: 'pro',
            workoutPlans: 'pro',
            dataExport: 'pro'
        };

        return featurePlanMapping[requiredFeature] || 'basic';
    };

    // Форматирование оставшегося времени подписки
    const getTimeRemaining = () => {
        if (!subscription || !isActive) return null;

        const now = new Date();
        const expiresAt = new Date(subscription.expiresAt);
        const diffTime = expiresAt - now;

        if (diffTime <= 0) return 'Истекла';

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '1 день';
        if (diffDays < 7) return `${diffDays} дней`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} недель`;
        return `${Math.ceil(diffDays / 30)} месяцев`;
    };

    // Проверка истечения подписки в ближайшее время
    const isExpiringSoon = () => {
        if (!subscription || !isActive) return false;

        const now = new Date();
        const expiresAt = new Date(subscription.expiresAt);
        const diffTime = expiresAt - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays <= 7; // истекает в течение недели
    };

    useEffect(() => {
        loadSubscriptionData();
    }, [user]);

    const value = {
        // Состояние
        subscription,
        features,
        isActive,
        loading,
        error,
        mealPlanCount,
        totalGenerations,
        weeklyPlansCount,

        // Методы
        refreshSubscription,
        hasFeature,
        checkLimit,
        getPlanInfo,
        needsUpgrade,
        getRecommendedPlan,
        getTimeRemaining,
        isExpiringSoon,
        canCreateMealPlan,
        canCreateWeeklyPlan,
        canGenerate,
        incrementMealPlanCount,
        incrementWeeklyPlanCount,
        incrementGenerationCount,
        getRemainingMealPlans,
        getRemainingWeeklyPlans,
        getRemainingGenerations,

        // Вычисляемые значения
        planInfo: getPlanInfo(),
        timeRemaining: getTimeRemaining(),
        expiringSoon: isExpiringSoon(),
        remainingMealPlans: getRemainingMealPlans()
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

SubscriptionProvider.propTypes = {
    children: PropTypes.node.isRequired
};
