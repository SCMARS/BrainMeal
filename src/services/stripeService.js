import { loadStripe } from '@stripe/stripe-js';
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    getDoc,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Инициализация Stripe (замените на ваш публичный ключ)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

/**
 * Сервис для работы с платежами через Stripe и Firebase
 */

// Планы подписки (будут переведены в компонентах)
export const SUBSCRIPTION_PLANS = {
    monthly: {
        id: 'monthly',
        nameKey: 'monthlyPlan',
        descriptionKey: 'accessToAllFeatures',
        price: 2, // в евро
        priceId: 'price_1RT6hwLzPyGGQkjPqgGuCOl9', // Месячный план
        currency: 'EUR',
        featureKeys: [
            'aiMealGeneration',
            'preciseCalorieTracking',
            'personalRecommendations',
            'detailedNutritionAnalytics',
            'allDietTypesSupport',
            'mobileApp'
        ],
        durationKey: 'month',
        trialDays: 4,
        badgeKey: 'freeDays'
    },
    quarterly: {
        id: 'quarterly',
        nameKey: 'quarterlyPlan',
        descriptionKey: 'mostPopularChoice',
        price: 5, // в евро за 3 месяца
        priceId: 'price_1RT6hxLzPyGGQkjPO6LY74l9', // Трёхмесячный план (популярный)
        currency: 'EUR',
        featureKeys: [
            'allMonthlyFeatures',
            'savingsVsMonthly58',
            'expandedRecipeDatabase',
            'prioritySupport',
            'weeklyProgressReports',
            'fitnessTrackerIntegration'
        ],
        durationKey: 'threeMonths',
        popular: true,
        badgeKey: 'mostPopular',
        savings: '58%'
    },
    yearly: {
        id: 'yearly',
        nameKey: 'yearlyPlan',
        descriptionKey: 'maximumValueForSerious',
        price: 20, // в евро за год
        priceId: 'price_1RT6hyLzPyGGQkjPXmAkSn5Q', // Годовой план
        currency: 'EUR',
        featureKeys: [
            'allQuarterlyFeatures',
            'savingsVsMonthly83',
            'nutritionistConsultations',
            'personalWorkoutPlans',
            'unlimitedMealPlans',
            'dataExportReports',
            'earlyAccessNewFeatures'
        ],
        durationKey: 'year',
        bestValue: true,
        badgeKey: 'bestPrice',
        savings: '83%'
    }
};

/**
 * Создает сессию оплаты в Stripe (временная версия с Payment Links)
 */
export const createCheckoutSession = async (userId, planId, userEmail) => {
    try {
        const plan = SUBSCRIPTION_PLANS[planId];
        if (!plan) {
            throw new Error('Неверный план подписки');
        }

        // Создаем документ платежа в Firebase
        const paymentDoc = {
            userId,
            planId,
            userEmail,
            amount: plan.price,
            currency: plan.currency,
            status: 'pending',
            createdAt: serverTimestamp(),
            planNameKey: plan.nameKey,
            planFeatureKeys: plan.featureKeys
        };

        const docRef = await addDoc(collection(db, 'payments'), paymentDoc);

        // ТЕСТОВЫЕ Payment Links (Test Mode)
        const paymentLinks = {
            monthly: 'https://buy.stripe.com/test_00wfZiclpclFesV8qYeIw00', // Месячный план - 2€/месяц (ТЕСТ)
            quarterly: 'https://buy.stripe.com/test_XXXXXX', // Создайте для трёхмесячного плана - 5€/3 месяца
            yearly: 'https://buy.stripe.com/test_XXXXXX' // Создайте для годового плана - 20€/год
        };

        const paymentLink = paymentLinks[planId];
        if (!paymentLink) {
            throw new Error(`Payment link not found for plan: ${planId}`);
        }

        // Перенаправляем на Payment Link с параметрами
        const urlWithParams = `${paymentLink}?client_reference_id=${docRef.id}&prefilled_email=${encodeURIComponent(userEmail)}`;
        window.location.href = urlWithParams;

        return { paymentId: docRef.id };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
};

/**
 * Перенаправляет на страницу оплаты Stripe
 */
export const redirectToCheckout = async (sessionId) => {
    try {
        const stripe = await stripePromise;

        const { error } = await stripe.redirectToCheckout({
            sessionId: sessionId,
        });

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Error redirecting to checkout:', error);
        throw error;
    }
};

/**
 * Создает и перенаправляет на оплату одним вызовом
 */
export const initiatePayment = async (userId, planId, userEmail) => {
    try {
        const { sessionId } = await createCheckoutSession(userId, planId, userEmail);
        await redirectToCheckout(sessionId);
    } catch (error) {
        console.error('Error initiating payment:', error);
        throw error;
    }
};

/**
 * Получает статус платежа
 */
export const getPaymentStatus = async (paymentId) => {
    try {
        const paymentDoc = await getDoc(doc(db, 'payments', paymentId));

        if (!paymentDoc.exists()) {
            throw new Error('Платеж не найден');
        }

        return {
            id: paymentDoc.id,
            ...paymentDoc.data()
        };
    } catch (error) {
        console.error('Error getting payment status:', error);
        throw error;
    }
};

/**
 * Подписывается на изменения статуса платежа
 */
export const subscribeToPaymentStatus = (paymentId, callback) => {
    const paymentRef = doc(db, 'payments', paymentId);

    return onSnapshot(paymentRef, (doc) => {
        if (doc.exists()) {
            callback({
                id: doc.id,
                ...doc.data()
            });
        }
    });
};

/**
 * Получает активную подписку пользователя
 */
export const getUserSubscription = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (!userDoc.exists()) {
            return null;
        }

        const userData = userDoc.data();
        return userData.subscription || null;
    } catch (error) {
        console.error('Error getting user subscription:', error);
        return null;
    }
};

/**
 * Проверяет, есть ли у пользователя активная подписка
 */
export const hasActiveSubscription = async (userId) => {
    try {
        const subscription = await getUserSubscription(userId);

        if (!subscription) {
            return false;
        }

        // Проверяем, не истекла ли подписка
        const now = new Date();
        const expiresAt = new Date(subscription.expiresAt);

        return subscription.status === 'active' && expiresAt > now;
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return false;
    }
};

/**
 * Получает доступные функции для пользователя
 */
export const getUserFeatures = async (userId) => {
    try {
        const subscription = await getUserSubscription(userId);

        if (!subscription || !hasActiveSubscription(userId)) {
            // Бесплатные функции
            return {
                maxMealPlans: 5,
                maxWeeklyPlans: 5, // Лимит на недельные планы питания
                maxGenerations: 5, // Общий лимит на все генерации
                maxRecipes: 10,
                aiRecommendations: false,
                analytics: false,
                achievements: false,
                support: 'basic',
                dietTypes: ['balanced', 'cutting']
            };
        }

        const plan = SUBSCRIPTION_PLANS[subscription.planId];

        switch (subscription.planId) {
            case 'basic':
                return {
                    maxMealPlans: 10,
                    maxRecipes: 50,
                    aiRecommendations: false,
                    analytics: false,
                    support: 'basic',
                    dietTypes: ['balanced', 'cutting', 'bulking']
                };
            case 'monthly':
            case 'quarterly':
            case 'yearly':
                return {
                    maxMealPlans: -1, // безлимит
                    maxWeeklyPlans: -1, // безлимит на недельные планы
                    maxGenerations: -1, // безлимит на все генерации
                    maxRecipes: -1, // безлимит
                    aiRecommendations: true,
                    analytics: true,
                    achievements: true,
                    support: 'priority',
                    dietTypes: ['balanced', 'cutting', 'bulking', 'keto', 'vegan', 'vegetarian']
                };
            case 'pro':
                return {
                    maxMealPlans: -1, // безлимит
                    maxWeeklyPlans: -1, // безлимит на недельные планы
                    maxGenerations: -1, // безлимит на все генерации
                    maxRecipes: -1, // безлимит
                    aiRecommendations: true,
                    analytics: true,
                    achievements: true,
                    support: 'premium',
                    dietTypes: ['balanced', 'cutting', 'bulking', 'keto', 'vegan', 'vegetarian'],
                    nutritionistConsultation: true,
                    workoutPlans: true,
                    dataExport: true
                };
            default:
                return getUserFeatures(userId); // возвращаем бесплатные функции
        }
    } catch (error) {
        console.error('Error getting user features:', error);
        return getUserFeatures(userId); // возвращаем бесплатные функции при ошибке
    }
};

/**
 * Форматирует цену для отображения
 */
export const formatPrice = (price, currency = 'EUR') => {
    const locale = currency === 'EUR' ? 'de-DE' : 'ru-RU';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(price);
};

/**
 * ТЕСТОВАЯ ФУНКЦИЯ: Симулирует успешную оплату и активацию подписки
 * Используется только для тестирования
 */
export const simulateSuccessfulPayment = async (userId, planId) => {
    try {
        console.log('🧪 ТЕСТ: Симулируем успешную оплату для плана:', planId);

        const plan = SUBSCRIPTION_PLANS[planId];
        if (!plan) {
            throw new Error('Неверный план подписки');
        }

        // Рассчитываем дату окончания подписки
        const now = new Date();
        const expiresAt = new Date(now);

        switch (planId) {
            case 'monthly':
                expiresAt.setMonth(now.getMonth() + 1);
                break;
            case 'quarterly':
                expiresAt.setMonth(now.getMonth() + 3);
                break;
            case 'yearly':
                expiresAt.setFullYear(now.getFullYear() + 1);
                break;
            default:
                expiresAt.setMonth(now.getMonth() + 1);
        }

        // Создаем объект подписки
        const subscription = {
            planId: planId,
            status: 'active',
            startedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            amount: plan.price,
            currency: plan.currency,
            isTest: true, // Помечаем как тестовую
            createdAt: now.toISOString()
        };

        // Сохраняем подписку в Firebase
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            subscription: subscription,
            updatedAt: serverTimestamp()
        });

        // Создаем запись о платеже
        const paymentDoc = {
            userId,
            planId,
            amount: plan.price,
            currency: plan.currency,
            status: 'completed',
            isTest: true,
            createdAt: serverTimestamp(),
            completedAt: serverTimestamp()
        };

        await addDoc(collection(db, 'payments'), paymentDoc);

        console.log('✅ ТЕСТ: Подписка успешно активирована!', subscription);

        return {
            success: true,
            subscription: subscription,
            message: `Тестовая подписка "${plan.nameKey}" активирована до ${expiresAt.toLocaleDateString()}`
        };

    } catch (error) {
        console.error('❌ ТЕСТ: Ошибка при симуляции оплаты:', error);
        throw error;
    }
};

/**
 * ТЕСТОВАЯ ФУНКЦИЯ: Отменяет подписку (для тестирования)
 */
export const cancelTestSubscription = async (userId) => {
    try {
        console.log('🧪 ТЕСТ: Отменяем подписку для пользователя:', userId);

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            subscription: null,
            updatedAt: serverTimestamp()
        });

        console.log('✅ ТЕСТ: Подписка отменена!');

        return {
            success: true,
            message: 'Тестовая подписка отменена'
        };

    } catch (error) {
        console.error('❌ ТЕСТ: Ошибка при отмене подписки:', error);
        throw error;
    }
};

/**
 * Создание Stripe Checkout Session с правильными metadata
 */
export const createStripeCheckoutSession = async (userId, planId, userEmail) => {
    try {
        console.log('🔄 Создаем Stripe Checkout Session:', { userId, planId, userEmail });

        // В реальном приложении здесь был бы запрос к вашему backend
        // который создает Checkout Session через Stripe API

        const plan = SUBSCRIPTION_PLANS[planId];
        if (!plan) {
            throw new Error(`План ${planId} не найден`);
        }

        // Для демонстрации используем Payment Link с параметрами
        const paymentLink = `https://buy.stripe.com/test_00wfZiclpclFesV8qYeIw00`;

        // Добавляем параметры для передачи данных в Stripe
        const urlParams = new URLSearchParams({
            'client_reference_id': userId,
            'prefilled_email': userEmail || '',
            'metadata[userId]': userId,
            'metadata[planId]': planId,
            'metadata[source]': 'brainmeal_app'
        });

        const checkoutUrl = `${paymentLink}?${urlParams.toString()}`;

        return {
            success: true,
            checkoutUrl,
            sessionId: `cs_demo_${Date.now()}`, // В реальности вернется от Stripe
            metadata: {
                userId,
                planId,
                userEmail
            }
        };

    } catch (error) {
        console.error('❌ Ошибка при создании Checkout Session:', error);
        throw error;
    }
};

/**
 * Проверка статуса платежа через Stripe (для реальных платежей)
 */
export const checkStripePaymentStatus = async (sessionId) => {
    try {
        console.log('🔍 Проверяем статус платежа Stripe:', sessionId);

        // В реальном приложении здесь был бы запрос к вашему backend
        // который проверяет статус через Stripe API

        // Для демонстрации возвращаем mock данные
        return {
            success: true,
            status: 'completed',
            subscription: {
                id: sessionId,
                status: 'active',
                planId: 'monthly',
                customerId: 'cus_test_123'
            }
        };

    } catch (error) {
        console.error('❌ Ошибка при проверке статуса платежа:', error);
        throw error;
    }
};

/**
 * Получение информации о подписке из Stripe
 */
export const getStripeSubscriptionInfo = async (subscriptionId) => {
    try {
        console.log('📊 Получаем информацию о подписке Stripe:', subscriptionId);

        // В реальном приложении здесь был бы запрос к Stripe API
        // через ваш backend для получения актуальной информации о подписке

        return {
            id: subscriptionId,
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // +30 дней
            plan: {
                id: 'monthly',
                amount: 200, // 2 EUR в центах
                currency: 'eur',
                interval: 'month'
            }
        };

    } catch (error) {
        console.error('❌ Ошибка при получении информации о подписке:', error);
        throw error;
    }
};
