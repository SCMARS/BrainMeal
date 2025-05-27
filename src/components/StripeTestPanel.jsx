import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Alert,
    Divider,
    Stack,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Payment as PaymentIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Launch as LaunchIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
    checkStripePaymentStatus,
    getStripeSubscriptionInfo,
    createStripeCheckoutSession,
    SUBSCRIPTION_PLANS
} from '../services/stripeService';

const StripeTestPanel = () => {
    const { user } = useAuth();
    const { subscription, refreshSubscription } = useSubscription();

    const [sessionId, setSessionId] = useState('');
    const [subscriptionId, setSubscriptionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleCheckPayment = async () => {
        if (!sessionId.trim()) {
            setError('Введите Session ID');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setResult(null);

            const paymentResult = await checkStripePaymentStatus(sessionId);
            setResult({
                type: 'payment',
                data: paymentResult
            });

        } catch (err) {
            setError(`Ошибка: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Активация подписки по Session ID
    const handleActivateBySessionId = async () => {
        if (!sessionId.trim()) {
            setError('Введите Session ID');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Симулируем активацию подписки на основе Session ID
            const { simulateSuccessfulPayment } = await import('../services/stripeService');

            // Определяем план на основе Session ID или используем monthly по умолчанию
            const planId = 'monthly'; // Можно улучшить логику определения плана

            const result = await simulateSuccessfulPayment(user?.uid, planId);

            setResult({
                type: 'activation',
                data: {
                    success: true,
                    message: `Подписка активирована для Session ID: ${sessionId}`,
                    sessionId,
                    planId
                }
            });

            // Обновляем данные подписки
            setTimeout(() => {
                refreshSubscription();
            }, 1000);

        } catch (err) {
            setError(`Ошибка активации: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckSubscription = async () => {
        if (!subscriptionId.trim()) {
            setError('Введите Subscription ID');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setResult(null);

            const subResult = await getStripeSubscriptionInfo(subscriptionId);
            setResult({
                type: 'subscription',
                data: subResult
            });

        } catch (err) {
            setError(`Ошибка: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const openStripePaymentLink = (planId) => {
        if (!user?.uid) {
            setError('Пользователь не авторизован');
            return;
        }

        try {
            // Используем Payment Link с автоматической передачей данных
            const baseUrl = 'https://buy.stripe.com/test_00wfZiclpclFesV8qYeIw00';

            // Добавляем параметры для автоматической передачи данных
            const params = new URLSearchParams({
                'client_reference_id': user.uid, // Автоматически передаем User ID
                'prefilled_email': user.email || '', // Автоматически заполняем email
            });

            const checkoutUrl = `${baseUrl}?${params.toString()}`;

            console.log('🔗 Открываем Stripe Checkout с автоматическими данными:', {
                userId: user.uid,
                email: user.email,
                planId
            });

            // Открываем Stripe Checkout
            console.log('🚀 Открываем URL:', checkoutUrl);
            const newWindow = window.open(checkoutUrl, '_blank');

            if (!newWindow) {
                alert('Popup заблокирован! Разрешите popup для этого сайта или скопируйте ссылку: ' + checkoutUrl);
            }

            setResult({
                type: 'checkout_opened',
                data: {
                    message: `Stripe Checkout открыт для плана ${planId}. User ID передан автоматически.`,
                    planId,
                    userId: user.uid,
                    email: user.email
                }
            });

        } catch (err) {
            setError(`Ошибка открытия Checkout: ${err.message}`);
        }
    };

    const openStripeDashboard = () => {
        window.open('https://dashboard.stripe.com/test/payments', '_blank');
    };

    const createDemoPayment = async () => {
        try {
            setLoading(true);
            setError('');
            setResult(null);

            // Симулируем создание демо-платежа
            const demoPayment = {
                id: `cs_test_demo_${Date.now()}`,
                status: 'complete',
                amount_total: 200, // 2 EUR в центах
                currency: 'eur',
                customer_email: user?.email || 'demo@example.com',
                created: Math.floor(Date.now() / 1000),
                subscription: {
                    id: `sub_demo_${Date.now()}`,
                    status: 'active',
                    current_period_start: Math.floor(Date.now() / 1000),
                    current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
                }
            };

            setResult({
                type: 'demo_payment',
                data: demoPayment
            });

            setSessionId(demoPayment.id);

        } catch (err) {
            setError(`Ошибка: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card sx={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                border: '2px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 3,
                mb: 3
            }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PaymentIcon sx={{ color: '#6366f1', mr: 1 }} />
                        <Typography variant="h6" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
                            💳 Тестирование Stripe платежей
                        </Typography>
                        <Tooltip title="Открыть Stripe Dashboard">
                            <IconButton
                                onClick={openStripeDashboard}
                                sx={{ ml: 'auto', color: '#6366f1' }}
                            >
                                <LaunchIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                        Используйте эту панель для тестирования реальных Stripe платежей
                    </Typography>

                    {/* Текущая подписка */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Текущая подписка:
                        </Typography>
                        {subscription ? (
                            <Box sx={{
                                p: 2,
                                bgcolor: 'rgba(34, 197, 94, 0.1)',
                                borderRadius: 2,
                                border: '1px solid rgba(34, 197, 94, 0.3)'
                            }}>
                                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                    <Chip label={`План: ${subscription.planId}`} color="success" size="small" />
                                    <Chip label={`Статус: ${subscription.status}`} color="success" size="small" />
                                </Stack>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Действует до: {new Date(subscription.expiresAt).toLocaleDateString()}
                                </Typography>
                                {subscription.isTest && (
                                    <Chip label="Тестовая подписка" color="warning" size="small" sx={{ mt: 1 }} />
                                )}
                            </Box>
                        ) : (
                            <Box sx={{
                                p: 2,
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: 2,
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Активная подписка не найдена
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Тестовые карты Stripe */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            💳 Тестовые карты Stripe:
                        </Typography>
                        <Box sx={{
                            p: 2,
                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            mb: 2
                        }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                ✅ Успешные платежи:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '12px', mb: 0.5 }}>
                                4242 4242 4242 4242 (Visa)
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '12px', mb: 0.5 }}>
                                5555 5555 5555 4444 (Mastercard)
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '12px', mb: 1 }}>
                                CVC: любые 3 цифры, Дата: любая будущая
                            </Typography>

                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#ef4444' }}>
                                ❌ Отклоненные платежи:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '12px', mb: 0.5 }}>
                                4000 0000 0000 9995 (Недостаточно средств)
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                4000 0000 0000 0002 (Общая ошибка)
                            </Typography>
                        </Box>
                    </Box>

                    {/* Тестовые ссылки Stripe */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            🔗 Тестовые ссылки оплаты:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => openStripePaymentLink('monthly')}
                                startIcon={<LaunchIcon />}
                                sx={{
                                    borderColor: '#6366f1',
                                    color: '#6366f1',
                                    '&:hover': {
                                        borderColor: '#4f46e5',
                                        backgroundColor: 'rgba(99, 102, 241, 0.1)'
                                    }
                                }}
                            >
                                Monthly (2€) - НАСТРОЕН
                            </Button>

                            <Button
                                variant="outlined"
                                size="small"
                                disabled
                                sx={{
                                    borderColor: '#9ca3af',
                                    color: '#9ca3af'
                                }}
                            >
                                Quarterly (5€) - НЕ НАСТРОЕН
                            </Button>

                            <Button
                                variant="outlined"
                                size="small"
                                disabled
                                sx={{
                                    borderColor: '#9ca3af',
                                    color: '#9ca3af'
                                }}
                            >
                                Yearly (20€) - НЕ НАСТРОЕН
                            </Button>
                        </Stack>
                        <Box sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#10b981' }}>
                                ✅ Автоматическая передача данных:
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}>
                                1. Нажмите кнопку "Monthly (2€) - НАСТРОЕН"
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}>
                                2. Email и User ID передаются автоматически
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}>
                                3. Используйте тестовую карту: 4242 4242 4242 4242
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}>
                                4. После оплаты используйте Session ID для активации ниже
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', mt: 1 }}>
                                👤 Ваш User ID: {user?.uid?.slice(0, 12)}...
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            onClick={createDemoPayment}
                            disabled={loading}
                            startIcon={<PaymentIcon />}
                            sx={{
                                mt: 2,
                                background: 'linear-gradient(45deg, #10b981, #059669)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #059669, #047857)',
                                }
                            }}
                        >
                            🎭 Создать демо-платеж
                        </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Проверка статуса платежа */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Проверить статус платежа:
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <TextField
                                label="Stripe Session ID"
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value)}
                                placeholder="cs_test_..."
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleCheckPayment}
                                disabled={loading}
                                startIcon={<CheckCircleIcon />}
                                sx={{
                                    background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #4f46e5, #7c3aed)',
                                    }
                                }}
                            >
                                Проверить
                            </Button>
                        </Stack>

                        <Button
                            variant="outlined"
                            onClick={handleActivateBySessionId}
                            disabled={loading || !sessionId.trim()}
                            startIcon={<CheckCircleIcon />}
                            fullWidth
                            sx={{
                                borderColor: '#10b981',
                                color: '#10b981',
                                mb: 2,
                                '&:hover': {
                                    borderColor: '#059669',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)'
                                }
                            }}
                        >
                            🚀 Активировать подписку по Session ID
                        </Button>
                    </Box>

                    {/* Проверка подписки */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Проверить подписку:
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <TextField
                                label="Stripe Subscription ID"
                                value={subscriptionId}
                                onChange={(e) => setSubscriptionId(e.target.value)}
                                placeholder="sub_..."
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleCheckSubscription}
                                disabled={loading}
                                startIcon={<InfoIcon />}
                                sx={{
                                    background: 'linear-gradient(45deg, #8b5cf6, #a855f7)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #7c3aed, #9333ea)',
                                    }
                                }}
                            >
                                Проверить
                            </Button>
                        </Stack>
                    </Box>

                    {/* Результаты */}
                    {result && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Результат:
                            </Typography>
                            <Box sx={{
                                p: 2,
                                bgcolor: 'rgba(34, 197, 94, 0.1)',
                                borderRadius: 2,
                                border: '1px solid rgba(34, 197, 94, 0.3)'
                            }}>
                                <pre style={{
                                    margin: 0,
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.9)',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            </Box>
                        </Box>
                    )}

                    {/* Ошибки */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            onClose={() => setError('')}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Быстрые действия */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            ⚡ Быстрые действия:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            <Button
                                variant="outlined"
                                onClick={refreshSubscription}
                                startIcon={<RefreshIcon />}
                                size="small"
                                sx={{
                                    borderColor: '#6366f1',
                                    color: '#6366f1',
                                    '&:hover': {
                                        borderColor: '#4f46e5',
                                        backgroundColor: 'rgba(99, 102, 241, 0.1)'
                                    }
                                }}
                            >
                                Обновить статус
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => window.open('https://stripe.com/docs/testing', '_blank')}
                                startIcon={<InfoIcon />}
                                size="small"
                                sx={{
                                    borderColor: '#10b981',
                                    color: '#10b981',
                                    '&:hover': {
                                        borderColor: '#059669',
                                        backgroundColor: 'rgba(16, 185, 129, 0.1)'
                                    }
                                }}
                            >
                                Документация Stripe
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => window.open('https://dashboard.stripe.com/test/webhooks', '_blank')}
                                startIcon={<LaunchIcon />}
                                size="small"
                                sx={{
                                    borderColor: '#f59e0b',
                                    color: '#f59e0b',
                                    '&:hover': {
                                        borderColor: '#d97706',
                                        backgroundColor: 'rgba(245, 158, 11, 0.1)'
                                    }
                                }}
                            >
                                Webhooks
                            </Button>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default StripeTestPanel;
