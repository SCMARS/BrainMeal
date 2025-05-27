# 🚀 Инструкция по настройке Stripe для BrainMeal

## 📋 Ваши планы подписки:

1. **Месячный план**: 2€/месяц + 4 дня бесплатно
2. **Трёхмесячный план**: 5€/3 месяца (самый популярный)
3. **Годовой план**: 20€/год (лучшая цена)

## 🔧 Шаг 1: Создание продуктов в Stripe

Запустите скрипт для создания продуктов:

```bash
npm run setup-stripe
```

Этот скрипт создаст все 3 продукта в вашем Stripe аккаунте и выведет Price ID, которые нужно будет скопировать.

## 📝 Шаг 2: Обновление Price ID в коде

После запуска скрипта вы получите 3 Price ID. Замените их в файле `src/services/stripeService.js`:

```javascript
export const SUBSCRIPTION_PLANS = {
    monthly: {
        // ...
        priceId: 'price_XXXXXXXXXX', // Замените на реальный Price ID
        // ...
    },
    quarterly: {
        // ...
        priceId: 'price_YYYYYYYYYY', // Замените на реальный Price ID
        // ...
    },
    yearly: {
        // ...
        priceId: 'price_ZZZZZZZZZZ', // Замените на реальный Price ID
        // ...
    }
};
```

## 🔑 Шаг 3: Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Публичный ключ уже добавлен в `.env.example`. Убедитесь, что он корректно скопирован в ваш `.env` файл.

## 🔥 Шаг 4: Настройка Firebase Functions

### 4.1 Инициализация Firebase Functions

```bash
firebase init functions
```

### 4.2 Установка зависимостей

```bash
cd functions
npm install stripe cors express
```

### 4.3 Создание Cloud Function

Скопируйте код из `STRIPE_SETUP.md` в файл `functions/index.js`.

### 4.4 Настройка секретного ключа

```bash
firebase functions:config:set stripe.secret_key="YOUR_STRIPE_SECRET_KEY"
```

### 4.5 Деплой Functions

```bash
firebase deploy --only functions
```

## 🔗 Шаг 5: Настройка Webhook в Stripe

1. Перейдите в [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Нажмите "Add endpoint"
3. URL: `https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/stripeWebhook`
4. Выберите события:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Скопируйте webhook secret и добавьте в Firebase config:

```bash
firebase functions:config:set stripe.webhook_secret="whsec_XXXXXXXXXX"
```

## 🧪 Шаг 6: Тестирование

### Тестовые карты для проверки:
- **Успешная оплата**: `4242 4242 4242 4242`
- **Отклоненная карта**: `4000 0000 0000 0002`
- **Требует 3D Secure**: `4000 0025 0000 3155`

### Проверка интеграции:
1. Запустите приложение: `npm run dev`
2. Перейдите на страницу `/subscription`
3. Выберите план и протестируйте оплату
4. Проверьте webhook события в Stripe Dashboard
5. Убедитесь, что данные обновляются в Firestore

## ⚠️ Важные замечания:

1. **Безопасность**: Никогда не коммитьте секретные ключи в Git
2. **Тестирование**: Используйте тестовые ключи для разработки
3. **Мониторинг**: Настройте логирование в Firebase Functions
4. **Backup**: Сделайте резервную копию конфигурации

## 🎯 Результат:

После выполнения всех шагов у вас будет:
- ✅ 3 продукта в Stripe с правильными ценами
- ✅ Рабочая интеграция с Firebase
- ✅ Автоматическое управление подписками
- ✅ Webhook для обработки событий
- ✅ Красивый UI для выбора планов

## 🆘 Помощь:

Если возникнут проблемы:
1. Проверьте логи Firebase Functions
2. Убедитесь, что все ключи корректны
3. Проверьте webhook события в Stripe
4. Убедитесь, что Firestore правила настроены

---

**Удачи с запуском! 🚀**
