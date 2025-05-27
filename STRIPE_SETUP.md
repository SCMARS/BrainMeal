# Настройка Stripe оплаты с Firebase

## 1. Настройка Stripe

### Создание аккаунта Stripe
1. Зарегистрируйтесь на [stripe.com](https://stripe.com)
2. Получите API ключи в разделе "Developers" > "API keys"
3. Скопируйте Publishable key в `.env` файл

### Создание продуктов и цен
```bash
# Создайте продукты в Stripe Dashboard или через API
# Базовый план
stripe products create --name="Базовый план" --description="Основные функции планирования питания"

# Премиум план  
stripe products create --name="Премиум план" --description="Расширенные возможности и персонализация"

# Профессиональный план
stripe products create --name="Профессиональный план" --description="Для серьезного подхода к питанию"
```

## 2. Настройка Firebase Functions

### Установка Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

### Установка зависимостей для Functions
```bash
cd functions
npm install stripe cors express
```

### Создание Cloud Function для Stripe

Создайте файл `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Создание сессии оплаты
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const { paymentId, priceId, userEmail, userId, planId } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${req.headers.origin}/payment-result?session_id={CHECKOUT_SESSION_ID}&success=true&payment_id=${paymentId}`,
        cancel_url: `${req.headers.origin}/payment-result?canceled=true&payment_id=${paymentId}`,
        customer_email: userEmail,
        metadata: {
          userId,
          planId,
          paymentId
        }
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Webhook для обработки событий Stripe
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Обработка событий
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Обработчики событий
async function handleCheckoutSessionCompleted(session) {
  const { userId, planId, paymentId } = session.metadata;
  
  // Обновляем статус платежа
  await admin.firestore().collection('payments').doc(paymentId).update({
    status: 'succeeded',
    stripeSessionId: session.id,
    stripeCustomerId: session.customer,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer;
  
  // Находим пользователя по customer ID
  const paymentsSnapshot = await admin.firestore()
    .collection('payments')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (!paymentsSnapshot.empty) {
    const payment = paymentsSnapshot.docs[0].data();
    const userId = payment.userId;
    const planId = payment.planId;

    // Создаем/обновляем подписку пользователя
    await admin.firestore().collection('users').doc(userId).update({
      subscription: {
        planId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        expiresAt: new Date(subscription.current_period_end * 1000),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });
  }
}

async function handleSubscriptionUpdated(subscription) {
  // Обновляем данные подписки
  const usersSnapshot = await admin.firestore()
    .collection('users')
    .where('subscription.stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    const userDoc = usersSnapshot.docs[0];
    await userDoc.ref.update({
      'subscription.status': subscription.status,
      'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      'subscription.expiresAt': new Date(subscription.current_period_end * 1000),
      'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

async function handleSubscriptionDeleted(subscription) {
  // Деактивируем подписку
  const usersSnapshot = await admin.firestore()
    .collection('users')
    .where('subscription.stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    const userDoc = usersSnapshot.docs[0];
    await userDoc.ref.update({
      'subscription.status': 'canceled',
      'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
    });
  }
}
```

### Настройка переменных окружения для Functions
```bash
firebase functions:config:set stripe.secret_key="sk_test_your_secret_key"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
```

### Деплой Functions
```bash
firebase deploy --only functions
```

## 3. Настройка Webhook в Stripe

1. Перейдите в Stripe Dashboard > Developers > Webhooks
2. Добавьте новый endpoint: `https://your-project.cloudfunctions.net/stripeWebhook`
3. Выберите события:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Скопируйте webhook secret и добавьте в Firebase config

## 4. Тестирование

### Тестовые карты Stripe
- Успешная оплата: `4242 4242 4242 4242`
- Отклоненная карта: `4000 0000 0000 0002`
- Требует аутентификации: `4000 0025 0000 3155`

### Проверка интеграции
1. Создайте тестовый платеж
2. Проверьте webhook события в Stripe Dashboard
3. Убедитесь, что данные обновляются в Firestore

## 5. Безопасность

- Никогда не храните секретные ключи в коде
- Используйте HTTPS для всех запросов
- Проверяйте подписи webhook
- Валидируйте данные на сервере

## 6. Мониторинг

- Настройте логирование в Firebase Functions
- Мониторьте webhook события в Stripe
- Отслеживайте ошибки платежей
