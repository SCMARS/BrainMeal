import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Star as StarIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SubscriptionPlans from '../components/SubscriptionPlans';
import TestSubscriptionPanel from '../components/TestSubscriptionPanel';
import StripeTestPanel from '../components/StripeTestPanel';
import { getUserSubscription, hasActiveSubscription, SUBSCRIPTION_PLANS } from '../services/stripeService';

const Subscription = () => {
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasActive, setHasActive] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { user } = useAuth();
    const { t, language } = useLanguage();

    // Обработка URL параметров после успешной оплаты Stripe
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const sessionId = urlParams.get('session_id');

        if (success === 'true' && sessionId) {
            setSuccessMessage(`✅ Платеж успешно завершен! Session ID: ${sessionId}. Используйте кнопку активации ниже.`);

            // Очищаем URL от параметров
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const [subscription, isActive] = await Promise.all([
                    getUserSubscription(user.uid),
                    hasActiveSubscription(user.uid)
                ]);

                setCurrentSubscription(subscription);
                setHasActive(isActive);
            } catch (error) {
                console.error('Error fetching subscription data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionData();
    }, [user]);

    if (!user) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="warning">
                    Необходимо войти в систему для просмотра планов подписки
                </Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <CircularProgress size={60} sx={{ color: '#ff6b35' }} />
            </Box>
        );
    }

    return (
        <Box sx={{
            height: '100vh',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                width: '8px',
            },
            '&::-webkit-scrollbar-track': {
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                borderRadius: '4px',
                '&:hover': {
                    background: 'linear-gradient(45deg, #e55a2b, #e8851a)',
                },
            },
        }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Заголовок страницы */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 2
                        }}
                    >
                        {t('subscriptionPlans')}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255,255,255,0.8)',
                            maxWidth: 800,
                            mx: 'auto',
                            lineHeight: 1.6
                        }}
                    >
                        {t('getAccessToPersonalized')}
                    </Typography>
                </Box>
            </motion.div>

            {/* Сообщение об успешной оплате */}
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Alert
                        severity="success"
                        sx={{ mb: 3 }}
                        onClose={() => setSuccessMessage('')}
                    >
                        {successMessage}
                    </Alert>
                </motion.div>
            )}

            {/* Тестовые панели (только в development) */}
            {process.env.NODE_ENV === 'development' && (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <TestSubscriptionPanel />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <StripeTestPanel />
                    </motion.div>
                </>
            )}

            {/* Текущая подписка */}
            {hasActive && currentSubscription && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card sx={{
                        mb: 4,
                        background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                        border: '2px solid #4caf50',
                        borderRadius: 3
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CheckIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {t('activeSubscription')}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                            {SUBSCRIPTION_PLANS[currentSubscription.planId]?.name || t('unknownPlan')}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                            {t('validUntil')}: {new Date(currentSubscription.expiresAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip
                                    label={t('active')}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Преимущества подписки */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <Card sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    borderRadius: 3
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                            🚀 {t('whatYouGetWithSubscription')}
                        </Typography>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                            gap: 3
                        }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2
                                }}>
                                    <Typography variant="h4">🤖</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                                    {t('aiRecommendations')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {t('personalizedMealPlans')}
                                </Typography>
                            </Box>

                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2
                                }}>
                                    <Typography variant="h4">📊</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                                    {t('detailedAnalytics')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {t('progressTracking')}
                                </Typography>
                            </Box>

                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2
                                }}>
                                    <Typography variant="h4">🍽️</Typography>
                                </Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                                    {t('unlimitedPlans')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {t('createUnlimitedMealPlans')}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Планы подписки */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <SubscriptionPlans
                    currentPlan={currentSubscription?.planId}
                />
            </motion.div>

            {/* FAQ секция */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <Card sx={{
                    mt: 4,
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    borderRadius: 3
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                            ❓ {t('frequentlyAskedQuestions')}
                        </Typography>

                        <Box sx={{ display: 'grid', gap: 2 }}>
                            <Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                                    {t('canCancelSubscription')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {t('canCancelAnytime')}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                                    {t('isRefundAvailable')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {t('fullRefund14Days')}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                                    {t('isPaymentSecure')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {t('stripeSecurePayment')}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>
            </Container>
        </Box>
    );
};

export default Subscription;
