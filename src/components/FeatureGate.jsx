import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    Chip
} from '@mui/material';
import {
    Lock as LockIcon,
    Star as StarIcon,
    Upgrade as UpgradeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSubscription } from '../context/SubscriptionContext';
import { SUBSCRIPTION_PLANS } from '../services/stripeService';

/**
 * Компонент для ограничения доступа к функциям на основе подписки
 */
const FeatureGate = ({
    feature,
    children,
    fallback = null,
    showUpgrade = true,
    customMessage = null
}) => {
    const {
        hasFeature,
        getRecommendedPlan,
        isActive,
        planInfo
    } = useSubscription();
    const navigate = useNavigate();

    // Если функция доступна, показываем контент
    if (hasFeature(feature)) {
        return children;
    }

    // Если передан кастомный fallback, используем его
    if (fallback) {
        return fallback;
    }

    // Если не нужно показывать upgrade, возвращаем null
    if (!showUpgrade) {
        return null;
    }

    const recommendedPlan = getRecommendedPlan(feature);
    const plan = SUBSCRIPTION_PLANS[recommendedPlan];

    const getFeatureDisplayName = (featureName) => {
        const featureNames = {
            aiRecommendations: 'ИИ-рекомендации',
            analytics: 'Детальная аналитика',
            nutritionistConsultation: 'Консультации нутрициолога',
            workoutPlans: 'Планы тренировок',
            dataExport: 'Экспорт данных',
            unlimitedMealPlans: 'Безлимитные планы питания',
            prioritySupport: 'Приоритетная поддержка'
        };
        return featureNames[featureName] || featureName;
    };

    const handleUpgrade = () => {
        navigate('/subscription');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card sx={{
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)',
                border: '2px solid rgba(255, 152, 0, 0.3)',
                borderRadius: 3,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Декоративный фон */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
                    zIndex: 0
                }} />

                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                    {/* Иконка блокировки */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, #ff9800, #ff6b35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                            boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)'
                        }}>
                            <LockIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                    </motion.div>

                    {/* Заголовок */}
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 'bold',
                            color: 'white',
                            mb: 1
                        }}
                    >
                        Премиум функция
                    </Typography>

                    {/* Описание функции */}
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'rgba(255,255,255,0.8)',
                            mb: 2
                        }}
                    >
                        {customMessage || `Для доступа к &ldquo;${getFeatureDisplayName(feature)}&rdquo; необходима подписка`}
                    </Typography>

                    {/* Рекомендуемый план */}
                    {plan && (
                        <Box sx={{
                            p: 2,
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(255, 152, 0, 0.3)',
                            mb: 3
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                <StarIcon sx={{ color: '#ff9800', mr: 1 }} />
                                <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                                    {plan.name}
                                </Typography>
                            </Box>

                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                                {plan.description}
                            </Typography>

                            <Chip
                                label={`${plan.price} ₽/месяц`}
                                sx={{
                                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                    color: '#ff9800',
                                    fontWeight: 'bold'
                                }}
                            />
                        </Box>
                    )}

                    {/* Текущий план */}
                    {isActive && (
                        <Alert
                            severity="info"
                            sx={{
                                mb: 3,
                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                border: '1px solid rgba(33, 150, 243, 0.3)',
                                '& .MuiAlert-message': { color: '#2196f3' }
                            }}
                        >
                            У вас активен план "{planInfo.name}". Для доступа к этой функции требуется план "{plan?.name}".
                        </Alert>
                    )}

                    {/* Кнопки действий */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={<UpgradeIcon />}
                            onClick={handleUpgrade}
                            sx={{
                                background: 'linear-gradient(45deg, #ff9800, #ff6b35)',
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #f57c00, #e55a2b)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4)'
                                }
                            }}
                        >
                            {isActive ? 'Обновить план' : 'Получить доступ'}
                        </Button>
                    </Box>

                    {/* Дополнительная информация */}
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255,255,255,0.5)',
                            mt: 2,
                            display: 'block'
                        }}
                    >
                        💡 Отмена подписки в любое время • Возврат средств в течение 14 дней
                    </Typography>
                </CardContent>
            </Card>
        </motion.div>
    );
};

FeatureGate.propTypes = {
    feature: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
    showUpgrade: PropTypes.bool,
    customMessage: PropTypes.string
};

export default FeatureGate;
