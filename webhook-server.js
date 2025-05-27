const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4242;

// Middleware
app.use(cors());
app.use(express.raw({ type: 'application/json' }));

// Webhook endpoint
app.post('/webhook', (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        // Здесь будет обработка Stripe события
        const event = JSON.parse(req.body);
        
        console.log('📨 Получено Stripe событие:', event.type);
        console.log('📊 Данные события:', JSON.stringify(event.data.object, null, 2));
        
        // Обрабатываем разные типы событий
        switch (event.type) {
            case 'checkout.session.completed':
                console.log('🎉 Checkout завершен успешно!');
                console.log('💰 Сумма:', event.data.object.amount_total / 100, event.data.object.currency);
                console.log('👤 Email:', event.data.object.customer_email);
                break;
                
            case 'invoice.payment_succeeded':
                console.log('💳 Платеж по счету успешен!');
                break;
                
            case 'customer.subscription.created':
                console.log('✅ Подписка создана!');
                break;
                
            case 'customer.subscription.updated':
                console.log('🔄 Подписка обновлена!');
                break;
                
            case 'customer.subscription.deleted':
                console.log('❌ Подписка отменена!');
                break;
                
            default:
                console.log('⚠️ Неизвестное событие:', event.type);
        }
        
        res.json({ received: true });
        
    } catch (err) {
        console.error('❌ Ошибка обработки webhook:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// Статус endpoint
app.get('/status', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Webhook сервер работает',
        timestamp: new Date().toISOString()
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log('🚀 Webhook сервер запущен на порту', PORT);
    console.log('📡 Endpoint: http://localhost:4242/webhook');
    console.log('📊 Статус: http://localhost:4242/status');
    console.log('');
    console.log('🔧 Для подключения Stripe CLI выполните:');
    console.log('   stripe listen --forward-to localhost:4242/webhook');
    console.log('');
});

module.exports = app;
