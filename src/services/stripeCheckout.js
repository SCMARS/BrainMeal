/**
 * Сервис для создания Stripe Checkout Sessions с автоматической передачей данных
 */

/**
 * Создание Checkout Session через Firebase Function (будущая реализация)
 */
export const createCheckoutSession = async (userId, planId, userEmail) => {
    try {
        console.log('🔄 Создаем Checkout Session:', { userId, planId, userEmail });

        // В будущем здесь будет вызов Firebase Function
        // const createCheckout = httpsCallable(functions, 'createCheckoutSession');
        // const result = await createCheckout({ planId, userId, userEmail });
        // return result.data;

        // Пока используем Payment Link с параметрами
        const baseUrl = 'https://buy.stripe.com/test_00wfZiclpclFesV8qYeIw00';
        
        const params = new URLSearchParams({
            'client_reference_id': userId,
            'prefilled_email': userEmail || '',
            // Можно добавить больше параметров если Stripe их поддерживает
        });

        return {
            success: true,
            checkoutUrl: `${baseUrl}?${params.toString()}`,
            metadata: {
                userId,
                planId,
                userEmail
            }
        };

    } catch (error) {
        console.error('❌ Ошибка создания Checkout Session:', error);
        throw error;
    }
};

/**
 * Обработка успешного платежа (вызывается после redirect из Stripe)
 */
export const handleSuccessfulPayment = async (sessionId, userId) => {
    try {
        console.log('🎉 Обрабатываем успешный платеж:', { sessionId, userId });

        // Здесь можно добавить логику для автоматической активации подписки
        // Например, вызов Firebase Function для активации

        return {
            success: true,
            message: 'Платеж обработан успешно',
            sessionId,
            userId
        };

    } catch (error) {
        console.error('❌ Ошибка обработки платежа:', error);
        throw error;
    }
};

/**
 * Получение информации о Checkout Session
 */
export const getCheckoutSessionInfo = async (sessionId) => {
    try {
        console.log('🔍 Получаем информацию о Checkout Session:', sessionId);

        // В реальном приложении здесь был бы запрос к backend
        // который получает информацию через Stripe API

        // Пока возвращаем mock данные
        return {
            id: sessionId,
            status: 'complete',
            customer_email: 'user@example.com',
            client_reference_id: 'user_123',
            amount_total: 200, // 2€ в центах
            currency: 'eur',
            metadata: {
                planId: 'monthly',
                userId: 'user_123'
            }
        };

    } catch (error) {
        console.error('❌ Ошибка получения информации о сессии:', error);
        throw error;
    }
};
