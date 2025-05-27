import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
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
import { useLanguage } from '../context/LanguageContext';

const SubscriptionLimit = ({
    feature,
    title,
    description,
    showProgress = false,
    compact = false
}) => {
    const {
        isActive,
        mealPlanCount,
        totalGenerations,
        weeklyPlansCount,
        remainingMealPlans,
        getRemainingWeeklyPlans,
        getRemainingGenerations,
        features,
        canCreateMealPlan
    } = useSubscription();
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Если у пользователя есть активная подписка, не показываем ограничения
    if (isActive) {
        return null;
    }

    // Проверяем доступность функции
    const hasAccess = features?.[feature];
    if (hasAccess) {
        return null;
    }

    const handleUpgrade = () => {
        navigate('/subscription');
    };

    const getProgressValue = () => {
        if (feature === 'maxWeeklyPlans') {
            if (!features?.maxWeeklyPlans) return 0;
            return (weeklyPlansCount / features.maxWeeklyPlans) * 100;
        }
        if (feature === 'maxGenerations' || feature === 'maxMealPlans') {
            if (!features?.maxGenerations) return 0;
            return (totalGenerations / features.maxGenerations) * 100;
        }
        return 0;
    };

    const getProgressColor = () => {
        const progress = getProgressValue();
        if (progress >= 100) return 'error';
        if (progress >= 80) return 'warning';
        return 'primary';
    };

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Alert
                    severity="warning"
                    icon={<LockIcon />}
                    action={
                        <Button
                            size="small"
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #e55a2b, #e8851a)',
                                }
                            }}
                            onClick={handleUpgrade}
                        >
                            {t('upgrade')}
                        </Button>
                    }
                    sx={{
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        border: '1px solid rgba(255, 152, 0, 0.3)',
                        '& .MuiAlert-message': { color: '#ff9800' }
                    }}
                >
                    {t('subscriptionRequired')}
                </Alert>
            </motion.div>
        );
    }

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
                {/* Фоновый эффект */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at center, rgba(255, 107, 53, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                    {/* Иконка блокировки */}
                    <Box sx={{ mb: 3 }}>
                        <LockIcon sx={{
                            fontSize: 64,
                            color: '#ff9800',
                            filter: 'drop-shadow(0 0 10px rgba(255, 152, 0, 0.3))'
                        }} />
                    </Box>

                    {/* Заголовок */}
                    <Typography variant="h5" sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        mb: 2
                    }}>
                        {title || t('premiumFeature')}
                    </Typography>

                    {/* Описание */}
                    <Typography variant="body1" sx={{
                        color: 'rgba(255,255,255,0.8)',
                        mb: 3,
                        lineHeight: 1.6
                    }}>
                        {description || t('subscriptionRequiredDescription')}
                    </Typography>

                    {/* Прогресс для недельных планов */}
                    {showProgress && feature === 'maxWeeklyPlans' && (
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {t('weeklyPlansUsed')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                                    {weeklyPlansCount}/{features?.maxWeeklyPlans || 5}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={getProgressValue()}
                                color={getProgressColor()}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        background: getProgressValue() >= 100
                                            ? 'linear-gradient(45deg, #f44336, #ff5722)'
                                            : 'linear-gradient(45deg, #ff9800, #ffa726)'
                                    }
                                }}
                            />
                            {getRemainingWeeklyPlans() > 0 && (
                                <Typography variant="caption" sx={{
                                    color: 'rgba(255,255,255,0.6)',
                                    mt: 1,
                                    display: 'block'
                                }}>
                                    {t('remainingWeeklyPlans')}: {getRemainingWeeklyPlans()}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Прогресс для генераций */}
                    {showProgress && (feature === 'maxMealPlans' || feature === 'maxGenerations') && (
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {t('generationsUsed')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                                    {totalGenerations}/{features?.maxGenerations || 5}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={getProgressValue()}
                                color={getProgressColor()}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        background: getProgressValue() >= 100
                                            ? 'linear-gradient(45deg, #f44336, #ff5722)'
                                            : 'linear-gradient(45deg, #ff9800, #ffa726)'
                                    }
                                }}
                            />
                            {getRemainingGenerations() > 0 && (
                                <Typography variant="caption" sx={{
                                    color: 'rgba(255,255,255,0.6)',
                                    mt: 1,
                                    display: 'block'
                                }}>
                                    {t('remainingGenerations')}: {getRemainingGenerations()}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Преимущества премиум */}
                    <Box sx={{ mb: 3 }}>
                        <Chip
                            icon={<StarIcon />}
                            label={t('premiumBenefits')}
                            sx={{
                                background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                color: 'white',
                                fontWeight: 'bold',
                                mb: 2
                            }}
                        />
                        <Typography variant="body2" sx={{
                            color: 'rgba(255,255,255,0.7)',
                            fontStyle: 'italic'
                        }}>
                            {t('unlimitedAccess')}
                        </Typography>
                    </Box>

                    {/* Кнопка обновления */}
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<UpgradeIcon />}
                        onClick={handleUpgrade}
                        sx={{
                            background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                            color: 'white',
                            fontWeight: 'bold',
                            py: 1.5,
                            px: 4,
                            borderRadius: 3,
                            boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #e55a2b, #e8851a)',
                                boxShadow: '0 12px 35px rgba(255, 107, 53, 0.4)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {t('upgradeToPremium')}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

SubscriptionLimit.propTypes = {
    feature: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    showProgress: PropTypes.bool,
    compact: PropTypes.bool
};

export default SubscriptionLimit;
