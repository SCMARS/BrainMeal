import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Chip,
    Divider,
    Stack
} from '@mui/material';
import {
    Science as ScienceIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import {
    simulateSuccessfulPayment,
    cancelTestSubscription,
    SUBSCRIPTION_PLANS
} from '../services/stripeService';

const TestSubscriptionPanel = () => {
    const { user } = useAuth();
    const {
        isActive,
        subscription,
        planInfo,
        refreshSubscription,
        mealPlanCount,
        totalGenerations,
        weeklyPlansCount,
        remainingMealPlans,
        getRemainingWeeklyPlans,
        getRemainingGenerations
    } = useSubscription();

    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');

    const handleActivateSubscription = async () => {
        if (!user?.uid) {
            setMessage('Пользователь не авторизован');
            setMessageType('error');
            return;
        }

        try {
            setLoading(true);
            setMessage('');

            const result = await simulateSuccessfulPayment(user.uid, selectedPlan);

            setMessage(result.message);
            setMessageType('success');

            // Обновляем данные подписки
            setTimeout(() => {
                refreshSubscription();
            }, 1000);

        } catch (error) {
            setMessage(`Ошибка: ${error.message}`);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!user?.uid) {
            setMessage('Пользователь не авторизован');
            setMessageType('error');
            return;
        }

        try {
            setLoading(true);
            setMessage('');

            const result = await cancelTestSubscription(user.uid);

            setMessage(result.message);
            setMessageType('success');

            // Обновляем данные подписки
            setTimeout(() => {
                refreshSubscription();
            }, 1000);

        } catch (error) {
            setMessage(`Ошибка: ${error.message}`);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshStatus = () => {
        refreshSubscription();
        setMessage('Статус подписки обновлен');
        setMessageType('info');
    };

    // Функция для тестирования Firebase Function webhook
    const handleTestFirebaseWebhook = async () => {
        if (!user?.uid) {
            setMessage('Пользователь не авторизован');
            setMessageType('error');
            return;
        }

        try {
            setLoading(true);
            setMessage('');

            const testWebhook = httpsCallable(functions, 'testWebhook');
            const result = await testWebhook({ planId: selectedPlan });

            setMessage(`Firebase Function: ${result.data.message}`);
            setMessageType('success');

            // Обновляем данные подписки
            setTimeout(() => {
                refreshSubscription();
            }, 1000);

        } catch (error) {
            setMessage(`Ошибка Firebase Function: ${error.message}`);
            setMessageType('error');
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
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 140, 66, 0.1) 100%)',
                border: '2px solid rgba(255, 107, 53, 0.3)',
                borderRadius: 3,
                mb: 3
            }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ScienceIcon sx={{ color: '#ff6b35', mr: 1 }} />
                        <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                            🧪 Тестовая панель подписок
                        </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                        Эта панель позволяет тестировать систему подписок без реальных платежей
                    </Typography>

                    {/* Текущий статус */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Текущий статус:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip
                                label={isActive ? 'Премиум активен' : 'Бесплатный план'}
                                color={isActive ? 'success' : 'default'}
                                icon={isActive ? <CheckCircleIcon /> : <CancelIcon />}
                            />
                            {subscription && (
                                <Chip
                                    label={`План: ${subscription.planId}`}
                                    variant="outlined"
                                />
                            )}
                        </Stack>

                        {/* Информация о лимитах */}
                        <Box sx={{
                            p: 2,
                            bgcolor: 'rgba(255,255,255,0.05)',
                            borderRadius: 2,
                            mb: 2
                        }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                📊 Статистика использования:
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                • Недельные планы: {weeklyPlansCount} / {isActive ? '∞' : '5'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                • Всего планов: {mealPlanCount}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                • Всего генераций: {totalGenerations} / {isActive ? '∞' : '5'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                • Осталось недельных планов: {isActive ? '∞' : getRemainingWeeklyPlans()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                • Осталось генераций: {isActive ? '∞' : getRemainingGenerations()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                • Аналитика: {isActive ? '✅ Доступна' : '❌ Заблокирована'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                • Достижения: {isActive ? '✅ Доступны' : '❌ Заблокированы'}
                            </Typography>
                        </Box>

                        {subscription && (
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                Действует до: {new Date(subscription.expiresAt).toLocaleDateString()}
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Управление подпиской */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Тестовые действия:
                        </Typography>

                        {!isActive && (
                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Выберите план для активации</InputLabel>
                                    <Select
                                        value={selectedPlan}
                                        onChange={(e) => setSelectedPlan(e.target.value)}
                                        label="Выберите план для активации"
                                    >
                                        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                                            <MenuItem key={key} value={key}>
                                                {plan.nameKey} - {plan.price}€
                                                {plan.popular && ' (Популярный)'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Stack spacing={1}>
                                    <Button
                                        variant="contained"
                                        onClick={handleActivateSubscription}
                                        disabled={loading}
                                        startIcon={<CheckCircleIcon />}
                                        sx={{
                                            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                                            }
                                        }}
                                        fullWidth
                                    >
                                        {loading ? 'Активация...' : 'Активировать тестовую подписку'}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        onClick={handleTestFirebaseWebhook}
                                        disabled={loading}
                                        startIcon={<ScienceIcon />}
                                        sx={{
                                            borderColor: '#2196f3',
                                            color: '#2196f3',
                                            '&:hover': {
                                                borderColor: '#1976d2',
                                                backgroundColor: 'rgba(33, 150, 243, 0.1)'
                                            }
                                        }}
                                        fullWidth
                                    >
                                        {loading ? 'Тестирование...' : 'Тест Firebase Function'}
                                    </Button>
                                </Stack>
                            </Box>
                        )}

                        {isActive && (
                            <Button
                                variant="contained"
                                onClick={handleCancelSubscription}
                                disabled={loading}
                                startIcon={<CancelIcon />}
                                sx={{
                                    background: 'linear-gradient(45deg, #f44336, #e57373)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                                    },
                                    mb: 2
                                }}
                                fullWidth
                            >
                                {loading ? 'Отмена...' : 'Отменить тестовую подписку'}
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            onClick={handleRefreshStatus}
                            startIcon={<RefreshIcon />}
                            fullWidth
                            sx={{
                                borderColor: '#ff6b35',
                                color: '#ff6b35',
                                '&:hover': {
                                    borderColor: '#e55a2b',
                                    backgroundColor: 'rgba(255, 107, 53, 0.1)'
                                }
                            }}
                        >
                            Обновить статус
                        </Button>
                    </Box>

                    {/* Сообщения */}
                    {message && (
                        <Alert
                            severity={messageType}
                            sx={{ mt: 2 }}
                            onClose={() => setMessage('')}
                        >
                            {message}
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default TestSubscriptionPanel;
