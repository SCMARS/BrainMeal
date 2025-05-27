import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Обработчик Stripe Webhooks
 * Этот файл будет использоваться для обработки событий от Stripe
 */

/**
 * Обрабатывает событие успешного завершения checkout сессии
 */
export const handleCheckoutSessionCompleted = async (session) => {
    try {
        console.log('🎉 Обрабатываем успешный checkout:', session.id);

        const { customer, subscription, client_reference_id, customer_email } = session;

        // Извлекаем userId из client_reference_id (если передавали)
        const userId = client_reference_id || customer;

        if (!userId) {
            console.error('❌ Не найден userId в checkout session');
            return;
        }

        // Определяем план на основе суммы
        let planId = 'monthly';
        const amount = session.amount_total;
        
        if (amount >= 2000) { // 20€ в центах
            planId = 'yearly';
        } else if (amount >= 500) { // 5€ в центах
            planId = 'quarterly';
        } else {
            planId = 'monthly';
        }

        // Создаем объект подписки
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
        }

        const subscriptionData = {
            planId,
            status: 'active',
            stripeCustomerId: customer,
            stripeSubscriptionId: subscription,
            stripeSessionId: session.id,
            startedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            amount: amount / 100, // Конвертируем из центов
            currency: session.currency,
            customerEmail: customer_email,
            isTest: session.livemode === false,
            createdAt: now.toISOString()
        };

        // Обновляем пользователя в Firebase
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            subscription: subscriptionData,
            updatedAt: serverTimestamp()
        });

        // Создаем запись о платеже
        const paymentDoc = {
            userId,
            planId,
            stripeSessionId: session.id,
            stripeCustomerId: customer,
            stripeSubscriptionId: subscription,
            amount: amount / 100,
            currency: session.currency,
            status: 'completed',
            customerEmail: customer_email,
            isTest: session.livemode === false,
            createdAt: serverTimestamp(),
            completedAt: serverTimestamp()
        };

        await addDoc(collection(db, 'payments'), paymentDoc);

        console.log('✅ Подписка успешно активирована через webhook:', subscriptionData);

        return { success: true, subscription: subscriptionData };

    } catch (error) {
        console.error('❌ Ошибка при обработке checkout.session.completed:', error);
        throw error;
    }
};

/**
 * Обрабатывает событие успешной оплаты счета
 */
export const handleInvoicePaymentSucceeded = async (invoice) => {
    try {
        console.log('💰 Обрабатываем успешную оплату счета:', invoice.id);

        const { customer, subscription, customer_email } = invoice;

        // Здесь можно обновить статус подписки, продлить срок действия и т.д.
        // Для простоты пока просто логируем

        console.log('✅ Счет успешно оплачен:', {
            customer,
            subscription,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency
        });

        return { success: true };

    } catch (error) {
        console.error('❌ Ошибка при обработке invoice.payment_succeeded:', error);
        throw error;
    }
};

/**
 * Обрабатывает отмену подписки
 */
export const handleSubscriptionDeleted = async (subscription) => {
    try {
        console.log('❌ Обрабатываем отмену подписки:', subscription.id);

        const { customer } = subscription;

        // Находим пользователя по customer ID и деактивируем подписку
        // Для простоты пока просто логируем

        console.log('✅ Подписка отменена:', {
            customer,
            subscriptionId: subscription.id
        });

        return { success: true };

    } catch (error) {
        console.error('❌ Ошибка при обработке customer.subscription.deleted:', error);
        throw error;
    }
};

/**
 * Основной обработчик webhook событий
 */
export const handleStripeWebhook = async (event) => {
    try {
        console.log('📨 Получено Stripe событие:', event.type);

        switch (event.type) {
            case 'checkout.session.completed':
                return await handleCheckoutSessionCompleted(event.data.object);

            case 'invoice.payment_succeeded':
                return await handleInvoicePaymentSucceeded(event.data.object);

            case 'customer.subscription.deleted':
                return await handleSubscriptionDeleted(event.data.object);

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                console.log('ℹ️ Событие подписки:', event.type);
                return { success: true, message: 'Событие обработано' };

            default:
                console.log('⚠️ Неизвестное событие:', event.type);
                return { success: true, message: 'Событие проигнорировано' };
        }

    } catch (error) {
        console.error('❌ Ошибка при обработке webhook:', error);
        throw error;
    }
};

/**
 * Симуляция webhook для тестирования
 */
export const simulateWebhookEvent = async (userId, planId = 'monthly') => {
    try {
        console.log('🧪 ТЕСТ: Симулируем webhook событие');

        const mockSession = {
            id: `cs_test_webhook_${Date.now()}`,
            customer: `cus_test_${Date.now()}`,
            subscription: `sub_test_${Date.now()}`,
            client_reference_id: userId,
            customer_email: 'test@example.com',
            amount_total: planId === 'yearly' ? 2000 : planId === 'quarterly' ? 500 : 200,
            currency: 'eur',
            livemode: false
        };

        const result = await handleCheckoutSessionCompleted(mockSession);
        
        console.log('✅ ТЕСТ: Webhook событие обработано');
        return result;

    } catch (error) {
        console.error('❌ ТЕСТ: Ошибка при симуляции webhook:', error);
        throw error;
    }
};
