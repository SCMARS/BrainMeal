const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret_key);
const cors = require("cors")({origin: true});

admin.initializeApp();

// Создание сессии оплаты
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const {paymentId, priceId, userEmail, userId, planId} = req.body;

      console.log("Creating checkout session for:", {paymentId, priceId, userEmail, userId, planId});

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: "subscription",
        success_url: `${req.headers.origin}/payment-result?session_id={CHECKOUT_SESSION_ID}&success=true&payment_id=${paymentId}`,
        cancel_url: `${req.headers.origin}/payment-result?canceled=true&payment_id=${paymentId}`,
        customer_email: userEmail,
        metadata: {
          userId,
          planId,
          paymentId,
        },
      });

      console.log("Checkout session created:", session.id);
      res.json({sessionId: session.id});
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({error: error.message});
    }
  });
});

// Webhook для обработки событий Stripe
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Received webhook event:", event.type);

  // Обработка событий
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Обработчики событий
/**
 * Обработка завершения сессии оплаты
 * @param {Object} session - Объект сессии Stripe
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log("🎉 Handling checkout session completed:", session.id);
    console.log("📊 Session data:", JSON.stringify(session, null, 2));

    const {
      customer,
      subscription,
      customer_email,
      amount_total,
      currency,
      metadata,
      client_reference_id
    } = session;

    // Получаем userId из client_reference_id (приоритет) или metadata
    let userId = client_reference_id || metadata?.userId;

    console.log("🔍 Ищем userId:", { client_reference_id, metadata_userId: metadata?.userId });

    // Если userId нет, пытаемся найти по email
    if (!userId && customer_email) {
      console.log("🔍 Ищем пользователя по email:", customer_email);
      const usersSnapshot = await admin.firestore()
        .collection("users")
        .where("email", "==", customer_email)
        .limit(1)
        .get();

      if (!usersSnapshot.empty) {
        userId = usersSnapshot.docs[0].id;
        console.log("✅ Найден пользователь по email:", userId);
      }
    }

    if (!userId) {
      console.error("❌ Не найден userId для сессии:", session.id);
      console.error("❌ Доступные данные:", { customer_email, client_reference_id, metadata });
      return;
    }

    // Определяем план на основе суммы
    let planId = metadata?.planId || 'monthly';
    if (!metadata?.planId) {
      if (amount_total >= 2000) { // 20€ в центах
        planId = 'yearly';
      } else if (amount_total >= 500) { // 5€ в центах
        planId = 'quarterly';
      } else {
        planId = 'monthly';
      }
    }

    console.log("📋 Определен план:", planId, "для суммы:", amount_total);

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

    console.log("💾 Сохраняем подписку:", subscriptionData);

    // Обновляем пользователя
    await admin.firestore().collection("users").doc(userId).update({
      subscription: subscriptionData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Создаем запись о платеже
    await admin.firestore().collection("payments").add({
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

    console.log("✅ Подписка активирована для пользователя:", userId, "план:", planId);
    return { success: true, userId, planId };

  } catch (error) {
    console.error("❌ Ошибка в handleCheckoutSessionCompleted:", error);
    throw error;
  }
}

/**
 * Обработка создания подписки
 * @param {Object} subscription - Объект подписки Stripe
 */
async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer;

  console.log("Handling subscription created for customer:", customerId);

  // Находим пользователя по customer ID
  const paymentsSnapshot = await admin.firestore()
      .collection("payments")
      .where("stripeCustomerId", "==", customerId)
      .limit(1)
      .get();

  if (!paymentsSnapshot.empty) {
    const payment = paymentsSnapshot.docs[0].data();
    const userId = payment.userId;
    const planId = payment.planId;

    console.log("Creating subscription for user:", userId, "plan:", planId);

    // Создаем/обновляем подписку пользователя
    await admin.firestore().collection("users").doc(userId).update({
      subscription: {
        planId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        expiresAt: new Date(subscription.current_period_end * 1000),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    });
  }
}

/**
 * Обработка обновления подписки
 * @param {Object} subscription - Объект подписки Stripe
 */
async function handleSubscriptionUpdated(subscription) {
  console.log("Handling subscription updated:", subscription.id);

  // Обновляем данные подписки
  const usersSnapshot = await admin.firestore()
      .collection("users")
      .where("subscription.stripeSubscriptionId", "==", subscription.id)
      .limit(1)
      .get();

  if (!usersSnapshot.empty) {
    const userDoc = usersSnapshot.docs[0];
    await userDoc.ref.update({
      "subscription.status": subscription.status,
      "subscription.currentPeriodStart": new Date(subscription.current_period_start * 1000),
      "subscription.currentPeriodEnd": new Date(subscription.current_period_end * 1000),
      "subscription.expiresAt": new Date(subscription.current_period_end * 1000),
      "subscription.updatedAt": admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Обработка удаления подписки
 * @param {Object} subscription - Объект подписки Stripe
 */
async function handleSubscriptionDeleted(subscription) {
  console.log("Handling subscription deleted:", subscription.id);

  // Деактивируем подписку
  const usersSnapshot = await admin.firestore()
      .collection("users")
      .where("subscription.stripeSubscriptionId", "==", subscription.id)
      .limit(1)
      .get();

  if (!usersSnapshot.empty) {
    const userDoc = usersSnapshot.docs[0];
    await userDoc.ref.update({
      "subscription.status": "canceled",
      "subscription.updatedAt": admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Тестовая функция для симуляции webhook
 */
exports.testWebhook = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const { planId = 'monthly' } = data;

    console.log('🧪 ТЕСТ: Симулируем webhook для пользователя:', userId);

    // Симулируем checkout session
    const mockSession = {
      id: `cs_test_${Date.now()}`,
      customer: `cus_test_${Date.now()}`,
      subscription: `sub_test_${Date.now()}`,
      client_reference_id: userId,
      customer_email: context.auth.token.email || 'test@example.com',
      amount_total: planId === 'yearly' ? 2000 : planId === 'quarterly' ? 500 : 200,
      currency: 'eur',
      livemode: false,
      metadata: { userId, planId }
    };

    await handleCheckoutSessionCompleted(mockSession);

    return {
      success: true,
      message: 'Тестовая подписка активирована через Firebase Function',
      sessionId: mockSession.id,
      planId
    };

  } catch (error) {
    console.error('❌ Ошибка в testWebhook:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
