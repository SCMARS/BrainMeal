/**
 * Netlify Function для обработки Stripe Webhooks
 * Автоматически активирует подписки после успешной оплаты
 */

const admin = require('firebase-admin');

// Инициализация Firebase Admin (только один раз)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseapp.com`
  });
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  // Разрешаем только POST запросы
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const stripeEvent = JSON.parse(event.body);
    
    console.log('📨 Получено Stripe событие:', stripeEvent.type);
    console.log('📊 ID события:', stripeEvent.id);

    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        console.log('✅ Событие подписки обработано:', stripeEvent.type);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(stripeEvent.data.object);
        break;

      default:
        console.log('⚠️ Неизвестное событие:', stripeEvent.type);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Обработка успешного завершения checkout
 */
async function handleCheckoutCompleted(session) {
  try {
    console.log('🎉 Обрабатываем checkout.session.completed:', session.id);
    
    const {
      customer,
      subscription,
      customer_email,
      amount_total,
      currency,
      client_reference_id
    } = session;

    // Получаем userId из client_reference_id
    let userId = client_reference_id;
    
    // Если userId нет, пытаемся найти по email
    if (!userId && customer_email) {
      console.log('🔍 Ищем пользователя по email:', customer_email);
      const usersSnapshot = await db.collection('users')
        .where('email', '==', customer_email)
        .limit(1)
        .get();
      
      if (!usersSnapshot.empty) {
        userId = usersSnapshot.docs[0].id;
        console.log('✅ Найден пользователь по email:', userId);
      }
    }

    if (!userId) {
      console.error('❌ Не найден userId для сессии:', session.id);
      return;
    }

    // Определяем план на основе суммы
    let planId = 'monthly';
    if (amount_total >= 2000) { // 20€ в центах
      planId = 'yearly';
    } else if (amount_total >= 500) { // 5€ в центах
      planId = 'quarterly';
    }

    console.log('📋 Определен план:', planId, 'для суммы:', amount_total);

    // Рассчитываем дату окончания
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

    // Создаем объект подписки
    const subscriptionData = {
      planId,
      status: 'active',
      stripeCustomerId: customer,
      stripeSubscriptionId: subscription,
      stripeSessionId: session.id,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: expiresAt.toISOString(),
      amount: amount_total / 100,
      currency,
      customerEmail: customer_email,
      isTest: session.livemode === false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      webhookProcessed: true
    };

    console.log('💾 Сохраняем подписку для пользователя:', userId);

    // Обновляем пользователя
    await db.collection('users').doc(userId).update({
      subscription: subscriptionData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Создаем запись о платеже
    await db.collection('payments').add({
      userId,
      planId,
      stripeSessionId: session.id,
      stripeCustomerId: customer,
      stripeSubscriptionId: subscription,
      amount: amount_total / 100,
      currency,
      status: 'completed',
      customerEmail: customer_email,
      isTest: session.livemode === false,
      webhookProcessed: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Подписка активирована автоматически:', userId, planId);

  } catch (error) {
    console.error('❌ Ошибка в handleCheckoutCompleted:', error);
    throw error;
  }
}

/**
 * Обработка отмены подписки
 */
async function handleSubscriptionCancelled(subscription) {
  try {
    console.log('❌ Обрабатываем отмену подписки:', subscription.id);
    
    const { customer } = subscription;
    
    // Находим пользователя и деактивируем подписку
    const usersSnapshot = await db.collection('users')
      .where('subscription.stripeCustomerId', '==', customer)
      .get();

    for (const userDoc of usersSnapshot.docs) {
      await userDoc.ref.update({
        'subscription.status': 'cancelled',
        'subscription.cancelledAt': admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Подписка отменена для пользователя:', userDoc.id);
    }
    
  } catch (error) {
    console.error('❌ Ошибка в handleSubscriptionCancelled:', error);
    throw error;
  }
}
