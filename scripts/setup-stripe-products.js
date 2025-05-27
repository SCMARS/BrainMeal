import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'YOUR_STRIPE_SECRET_KEY');

async function createStripeProducts() {
    try {
        console.log('🚀 Создание продуктов и цен в Stripe...\n');

        // 1. Месячный план - 2€ + 4 дня бесплатно
        console.log('📦 Создание месячного плана...');
        const monthlyProduct = await stripe.products.create({
            name: 'Месячный план',
            description: 'Доступ ко всем функциям BrainMeal на месяц',
            metadata: {
                plan_type: 'monthly',
                trial_days: '4'
            }
        });

        const monthlyPrice = await stripe.prices.create({
            product: monthlyProduct.id,
            unit_amount: 200, // 2€ в центах
            currency: 'eur',
            recurring: {
                interval: 'month',
                trial_period_days: 4
            },
            metadata: {
                plan_id: 'monthly',
                trial_days: '4'
            }
        });

        console.log(`✅ Месячный план создан: ${monthlyProduct.id}`);
        console.log(`   Цена: ${monthlyPrice.id} (2€/месяц + 4 дня бесплатно)\n`);

        // 2. Трёхмесячный план - 5€ (самый популярный)
        console.log('📦 Создание трёхмесячного плана (ПОПУЛЯРНЫЙ)...');
        const quarterlyProduct = await stripe.products.create({
            name: 'Трёхмесячный план',
            description: 'Самый популярный! Доступ ко всем функциям BrainMeal на 3 месяца',
            metadata: {
                plan_type: 'quarterly',
                popular: 'true'
            }
        });

        const quarterlyPrice = await stripe.prices.create({
            product: quarterlyProduct.id,
            unit_amount: 500, // 5€ в центах
            currency: 'eur',
            recurring: {
                interval: 'month',
                interval_count: 3
            },
            metadata: {
                plan_id: 'quarterly',
                popular: 'true'
            }
        });

        console.log(`✅ Трёхмесячный план создан: ${quarterlyProduct.id}`);
        console.log(`   Цена: ${quarterlyPrice.id} (5€/3 месяца) 🔥 ПОПУЛЯРНЫЙ\n`);

        // 3. Годовой план - 20€
        console.log('📦 Создание годового плана...');
        const yearlyProduct = await stripe.products.create({
            name: 'Годовой план',
            description: 'Максимальная выгода! Доступ ко всем функциям BrainMeal на год',
            metadata: {
                plan_type: 'yearly',
                best_value: 'true'
            }
        });

        const yearlyPrice = await stripe.prices.create({
            product: yearlyProduct.id,
            unit_amount: 2000, // 20€ в центах
            currency: 'eur',
            recurring: {
                interval: 'year'
            },
            metadata: {
                plan_id: 'yearly',
                best_value: 'true'
            }
        });

        console.log(`✅ Годовой план создан: ${yearlyProduct.id}`);
        console.log(`   Цена: ${yearlyPrice.id} (20€/год)\n`);

        // Выводим итоговую информацию
        console.log('🎉 Все продукты успешно созданы!\n');
        console.log('📋 ИТОГОВАЯ ИНФОРМАЦИЯ:');
        console.log('=' .repeat(50));

        console.log('\n1️⃣ МЕСЯЧНЫЙ ПЛАН:');
        console.log(`   Product ID: ${monthlyProduct.id}`);
        console.log(`   Price ID: ${monthlyPrice.id}`);
        console.log(`   Цена: 2€/месяц + 4 дня бесплатно`);

        console.log('\n2️⃣ ТРЁХМЕСЯЧНЫЙ ПЛАН (ПОПУЛЯРНЫЙ):');
        console.log(`   Product ID: ${quarterlyProduct.id}`);
        console.log(`   Price ID: ${quarterlyPrice.id}`);
        console.log(`   Цена: 5€/3 месяца 🔥`);

        console.log('\n3️⃣ ГОДОВОЙ ПЛАН:');
        console.log(`   Product ID: ${yearlyProduct.id}`);
        console.log(`   Price ID: ${yearlyPrice.id}`);
        console.log(`   Цена: 20€/год`);

        console.log('\n📝 Скопируйте Price ID в ваш код:');
        console.log('=' .repeat(50));
        console.log(`MONTHLY_PRICE_ID: "${monthlyPrice.id}"`);
        console.log(`QUARTERLY_PRICE_ID: "${quarterlyPrice.id}"`);
        console.log(`YEARLY_PRICE_ID: "${yearlyPrice.id}"`);

        return {
            monthly: {
                productId: monthlyProduct.id,
                priceId: monthlyPrice.id,
                amount: 200,
                currency: 'eur',
                interval: 'month',
                trialDays: 4
            },
            quarterly: {
                productId: quarterlyProduct.id,
                priceId: quarterlyPrice.id,
                amount: 500,
                currency: 'eur',
                interval: 'month',
                intervalCount: 3,
                popular: true
            },
            yearly: {
                productId: yearlyProduct.id,
                priceId: yearlyPrice.id,
                amount: 2000,
                currency: 'eur',
                interval: 'year'
            }
        };

    } catch (error) {
        console.error('❌ Ошибка при создании продуктов:', error.message);
        throw error;
    }
}

// Запуск скрипта
createStripeProducts()
    .then((products) => {
        console.log('\n✅ Настройка завершена успешно!');
        console.log('\n🔧 Следующие шаги:');
        console.log('1. Скопируйте Price ID в ваш код');
        console.log('2. Обновите .env файл с публичным ключом');
        console.log('3. Настройте Firebase Functions');
        console.log('4. Протестируйте оплату');
    })
    .catch((error) => {
        console.error('\n💥 Ошибка настройки:', error.message);
        process.exit(1);
    });

export { createStripeProducts };
