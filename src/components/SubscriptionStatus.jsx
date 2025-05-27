import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    LinearProgress,
    Alert
} from '@mui/material';
import {
    Star as StarIcon,
    Warning as WarningIcon,
    Upgrade as UpgradeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../services/stripeService';

const SubscriptionStatus = ({ compact = false, showUpgrade = true }) => {
    const {
        isActive,
        planInfo,
        timeRemaining,
        expiringSoon,
        features,
        loading
    } = useSubscription();
    const navigate = useNavigate();
    const { t } = useLanguage();

    if (loading) {
        return (
            <Card sx={{
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)',
                border: '1px solid rgba(255, 107, 53, 0.3)',
                borderRadius: 2
            }}>
                <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress sx={{ flexGrow: 1, height: 6, borderRadius: 3 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {t('loading')}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = () => {
        if (!isActive) return '#ff9800';
        if (expiringSoon) return '#ff5722';
        return '#4caf50';
    };

    const getStatusIcon = () => {
        if (!isActive) return <UpgradeIcon sx={{ color: getStatusColor() }} />;
        if (expiringSoon) return <WarningIcon sx={{ color: getStatusColor() }} />;
        return <StarIcon sx={{ color: getStatusColor() }} />;
    };

    const getStatusText = () => {
        if (!isActive) return t('freeAccount');
        if (expiringSoon) return `${t('expiringSoon')} ${timeRemaining}`;
        return `${t('validUntil')} ${timeRemaining}`;
    };

    if (compact) {
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <Card sx={{
                    background: `linear-gradient(135deg, ${getStatusColor()}20 0%, ${getStatusColor()}10 100%)`,
                    border: `1px solid ${getStatusColor()}50`,
                    borderRadius: 2,
                    cursor: showUpgrade ? 'pointer' : 'default'
                }}
                onClick={showUpgrade ? () => navigate('/subscription') : undefined}
                >
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getStatusIcon()}
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {planInfo.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                        {getStatusText()}
                                    </Typography>
                                </Box>
                            </Box>

                            {showUpgrade && !isActive && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    sx={{
                                        background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                                        minWidth: 'auto',
                                        px: 2,
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #e55a2b, #e8851a)'
                                        }
                                    }}
                                >
                                    {t('upgrade')}
                                </Button>
                            )}
                        </Box>
                    </CardContent>
                </Card>
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
                border: `2px solid ${getStatusColor()}50`,
                borderRadius: 3,
                mb: 3
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {getStatusIcon()}
                            <Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {planInfo.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {planInfo.description}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                            {isActive ? (
                                <Chip
                                    label={t('active')}
                                    sx={{
                                        backgroundColor: `${getStatusColor()}20`,
                                        color: getStatusColor(),
                                        fontWeight: 'bold'
                                    }}
                                />
                            ) : (
                                <Typography variant="h6" sx={{ color: getStatusColor(), fontWeight: 'bold' }}>
                                    {t('free')}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {isActive && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                                {getStatusText()}
                            </Typography>
                            {expiringSoon && (
                                <Alert
                                    severity="warning"
                                    sx={{
                                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                        border: '1px solid rgba(255, 152, 0, 0.3)',
                                        '& .MuiAlert-message': { color: '#ff9800' }
                                    }}
                                >
                                    Ваша подписка скоро истечет. Продлите её, чтобы не потерять доступ к премиум-функциям.
                                </Alert>
                            )}
                        </Box>
                    )}

                    {/* Лимиты и функции */}
                    {features && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1, fontWeight: 'bold' }}>
                                Доступные возможности:
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    Планы питания: {features.maxMealPlans === -1 ? '∞' : features.maxMealPlans}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    Рецепты: {features.maxRecipes === -1 ? '∞' : features.maxRecipes}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    ИИ-рекомендации: {features.aiRecommendations ? '✓' : '✗'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    Аналитика: {features.analytics ? '✓' : '✗'}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Кнопки действий */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        {!isActive && showUpgrade && (
                            <Button
                                variant="contained"
                                startIcon={<UpgradeIcon />}
                                onClick={() => navigate('/subscription')}
                                sx={{
                                    background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #e55a2b, #e8851a)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
                                    }
                                }}
                            >
                                Обновить план
                            </Button>
                        )}

                        {isActive && (
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/subscription')}
                                sx={{
                                    borderColor: getStatusColor(),
                                    color: getStatusColor(),
                                    '&:hover': {
                                        borderColor: getStatusColor(),
                                        backgroundColor: `${getStatusColor()}10`
                                    }
                                }}
                            >
                                Управление подпиской
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

SubscriptionStatus.propTypes = {
    compact: PropTypes.bool,
    showUpgrade: PropTypes.bool
};

export default SubscriptionStatus;
