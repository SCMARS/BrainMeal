# 🔧 Настройка Stripe Dashboard для BrainMeal

## 🚨 **Текущая проблема:**
```
IntegrationError: The Checkout client-only integration is not enabled. 
Enable it in the Dashboard at https://dashboard.stripe.com/account/checkout/settings.
```

## ✅ **Решение 1: Включить Checkout (Быстро)**

### **Шаги:**
1. Перейдите: https://dashboard.stripe.com/account/checkout/settings
2. Включите **"Client-only integration"**
3. Сохраните настройки
4. Перезапустите приложение

---

## 🔗 **Решение 2: Payment Links (Рекомендуется)**

### **Преимущества:**
- ✅ Не требует Firebase Functions
- ✅ Готовые страницы оплаты от Stripe
- ✅ Автоматическая обработка платежей
- ✅ Поддержка всех способов оплаты

### **Шаги создания Payment Links:**

#### **1. Месячный план (2€/месяц + 4 дня бесплатно):**
1. Перейдите: https://dashboard.stripe.com/payment-links
2. Нажмите **"Create payment link"**
3. Выберите продукт: **"Месячный план"**
4. Настройки:
   - **Billing**: Recurring
   - **Trial period**: 4 days
   - **Collect customer information**: Email address
5. **Advanced settings**:
   - **Success URL**: `https://your-domain.com/payment-result?success=true`
   - **Cancel URL**: `https://your-domain.com/payment-result?canceled=true`
6. Скопируйте ссылку (например: `https://buy.stripe.com/live_abc123`)

#### **2. Трёхмесячный план (5€/3 месяца):**
1. Повторите шаги выше для трёхмесячного плана
2. Скопируйте ссылку

#### **3. Годовой план (20€/год):**
1. Повторите шаги выше для годового плана
2. Скопируйте ссылку

### **Обновление кода:**
Замените ссылки в `src/services/stripeService.js`:
```javascript
const paymentLinks = {
    monthly: 'https://buy.stripe.com/live_YOUR_MONTHLY_LINK',
    quarterly: 'https://buy.stripe.com/live_YOUR_QUARTERLY_LINK', 
    yearly: 'https://buy.stripe.com/live_YOUR_YEARLY_LINK'
};
```

---

## 🔄 **Решение 3: Firebase Functions (Продакшен)**

### **Для полноценного решения:**
1. Обновите план Firebase до **Blaze**
2. Настройте Firebase Functions (см. `STRIPE_SETUP_INSTRUCTIONS.md`)
3. Настройте Webhook в Stripe Dashboard

---

## 🧪 **Тестирование:**

### **Тестовые карты:**
- **Успешная оплата**: `4242 4242 4242 4242`
- **Отклоненная карта**: `4000 0000 0000 0002`
- **Требует 3D Secure**: `4000 0025 0000 3155`

### **Проверка интеграции:**
1. Запустите приложение: `npm run dev`
2. Перейдите на `/subscription`
3. Выберите план и нажмите "Выбрать план"
4. Проверьте перенаправление на Stripe
5. Завершите тестовый платеж
6. Проверьте webhook события в Stripe Dashboard

---

## 📋 **Чек-лист готовности:**

### **Минимальная настройка (Payment Links):**
- [ ] Созданы Payment Links для всех 3 планов
- [ ] Обновлены ссылки в коде
- [ ] Настроены Success/Cancel URL
- [ ] Протестированы тестовые платежи

### **Полная настройка (Firebase Functions):**
- [ ] План Firebase обновлен до Blaze
- [ ] Firebase Functions развернуты
- [ ] Webhook настроен в Stripe
- [ ] Секретные ключи настроены
- [ ] Протестирована полная интеграция

---

## 🆘 **Помощь:**

### **Если Payment Links не работают:**
1. Проверьте, что ссылки скопированы правильно
2. Убедитесь, что продукты активны в Stripe
3. Проверьте настройки Success/Cancel URL

### **Если Checkout не работает:**
1. Убедитесь, что "Client-only integration" включена
2. Проверьте публичный ключ в `.env`
3. Убедитесь, что используете LIVE ключи для продакшена

### **Логи для отладки:**
- Откройте Developer Tools → Console
- Проверьте ошибки в Network tab
- Проверьте webhook события в Stripe Dashboard

---

**Рекомендация: Начните с Payment Links для быстрого запуска! 🚀**
