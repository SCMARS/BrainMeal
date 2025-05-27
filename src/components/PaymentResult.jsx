import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscribeToPaymentStatus } from '../services/stripeService';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const sessionId = searchParams.get('session_id');
    const paymentId = searchParams.get('payment_id');
    const success = searchParams.get('success') === 'true';
    const canceled = searchParams.get('canceled') === 'true';

    useEffect(() => {
        if (!sessionId && !paymentId) {
            setError('Отсутствуют параметры платежа');
            setLoading(false);
            return;
        }

        let unsubscribe;

        const fetchPaymentStatus = async () => {
            try {
                if (paymentId) {
                    // Подписываемся на изменения статуса платежа
                    unsubscribe = subscribeToPaymentStatus(paymentId, (payment) => {
                        setPaymentStatus(payment);
                        setLoading(false);
                    });
                } else {
                    // Если есть только session_id, ждем обновления от webhook
                    setPaymentStatus({
                        status: success ? 'succeeded' : canceled ? 'canceled' : 'pending'
                    });
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching payment status:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPaymentStatus();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [sessionId, paymentId, success, canceled]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'succeeded':
                return <SuccessIcon sx={{ fontSize: 80, color: '#4caf50' }} />;
            case 'failed':
                return <ErrorIcon sx={{ fontSize: 80, color: '#f44336' }} />;
            case 'canceled':
                return <ErrorIcon sx={{ fontSize: 80, color: '#ff9800' }} />;
            case 'pending':
            default:
                return <PendingIcon sx={{ fontSize: 80, color: '#2196f3' }} />;
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'succeeded':
                return {
                    title: 'Оплата прошла успешно!',
                    message: 'Ваша подписка активирована. Теперь вы можете пользоваться всеми возможностями выбранного плана.',
                    color: '#4caf50'
                };
            case 'failed':
                return {
                    title: 'Ошибка оплаты',
                    message: 'К сожалению, платеж не прошел. Проверьте данные карты и попробуйте снова.',
                    color: '#f44336'
                };
            case 'canceled':
                return {
                    title: 'Оплата отменена',
                    message: 'Вы отменили процесс оплаты. Вы можете попробовать снова в любое время.',
                    color: '#ff9800'
                };
            case 'pending':
            default:
                return {
                    title: 'Обработка платежа...',
                    message: 'Ваш платеж обрабатывается. Это может занять несколько минут.',
                    color: '#2196f3'
                };
        }
    };

    const handleContinue = () => {
        if (paymentStatus?.status === 'succeeded') {
            navigate('/dashboard');
        } else {
            navigate('/subscription');
        }
    };

    const handleRetry = () => {
        navigate('/subscription');
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                flexDirection: 'column'
            }}>
                <CircularProgress size={60} sx={{ color: '#ff6b35', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Проверяем статус платежа...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => navigate('/subscription')}
                    sx={{
                        background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #e55a2b, #e8851a)'
                        }
                    }}
                >
                    Вернуться к выбору плана
                </Button>
            </Box>
        );
    }

    const status = paymentStatus?.status || 'pending';
    const statusInfo = getStatusMessage(status);

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            p: 2
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card sx={{
                    maxWidth: 500,
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)',
                    border: `2px solid ${statusInfo.color}30`,
                    borderRadius: 3,
                    textAlign: 'center'
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            {getStatusIcon(status)}
                        </motion.div>

                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 'bold',
                                color: statusInfo.color,
                                mt: 2,
                                mb: 1
                            }}
                        >
                            {statusInfo.title}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(255,255,255,0.8)',
                                mb: 3,
                                lineHeight: 1.6
                            }}
                        >
                            {statusInfo.message}
                        </Typography>

                        {paymentStatus?.planName && (
                            <Box sx={{
                                p: 2,
                                backgroundColor: `${statusInfo.color}10`,
                                borderRadius: 2,
                                border: `1px solid ${statusInfo.color}30`,
                                mb: 3
                            }}>
                                <Typography variant="h6" sx={{ color: statusInfo.color, mb: 1 }}>
                                    {paymentStatus.planName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {paymentStatus.amount} ₽ / месяц
                                </Typography>
                            </Box>
                        )}

                        {status === 'pending' && (
                            <Box sx={{ mb: 3 }}>
                                <CircularProgress size={30} sx={{ color: statusInfo.color }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>
                                    Обновление статуса...
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            {status === 'succeeded' && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleContinue}
                                    sx={{
                                        background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
                                        }
                                    }}
                                >
                                    Перейти в приложение
                                </Button>
                            )}

                            {(status === 'failed' || status === 'canceled') && (
                                <>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/dashboard')}
                                        sx={{
                                            borderColor: 'rgba(255,255,255,0.3)',
                                            color: 'rgba(255,255,255,0.8)',
                                            '&:hover': {
                                                borderColor: 'rgba(255,255,255,0.5)',
                                                background: 'rgba(255,255,255,0.1)'
                                            }
                                        }}
                                    >
                                        На главную
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleRetry}
                                        sx={{
                                            background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #e55a2b, #e8851a)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
                                            }
                                        }}
                                    >
                                        Попробовать снова
                                    </Button>
                                </>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>
        </Box>
    );
};

export default PaymentResult;
