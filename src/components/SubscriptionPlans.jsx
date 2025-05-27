import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Check as CheckIcon,
    Star as StarIcon,
    Rocket as RocketIcon,
    Diamond as DiamondIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { SUBSCRIPTION_PLANS, formatPrice, initiatePayment } from '../services/stripeService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const SubscriptionPlans = ({ onPlanSelect, currentPlan = null }) => {
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handlePlanSelect = async (planId) => {
        if (!user) {
            setError('Необходимо войти в систему');
            return;
        }

        try {
            setLoading(planId);
            setError(null);

            if (onPlanSelect) {
                await onPlanSelect(planId);
            } else {
                await initiatePayment(user.uid, planId, user.email);
            }
        } catch (err) {
            console.error('Error selecting plan:', err);
            setError(err.message || 'Ошибка при выборе плана');
        } finally {
            setLoading(null);
        }
    };

    const getPlanIcon = (planId) => {
        switch (planId) {
            case 'monthly':
                return <StarIcon sx={{ fontSize: 40, color: '#4caf50' }} />;
            case 'quarterly':
                return <RocketIcon sx={{ fontSize: 40, color: '#ff9800' }} />;
            case 'yearly':
                return <DiamondIcon sx={{ fontSize: 40, color: '#9c27b0' }} />;
            default:
                return <StarIcon sx={{ fontSize: 40, color: '#4caf50' }} />;
        }
    };

    const getPlanColor = (planId) => {
        switch (planId) {
            case 'monthly':
                return {
                    primary: '#4caf50',
                    secondary: '#4caf5020',
                    gradient: 'linear-gradient(135deg, #4caf50, #66bb6a)'
                };
            case 'quarterly':
                return {
                    primary: '#ff9800',
                    secondary: '#ff980020',
                    gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)'
                };
            case 'yearly':
                return {
                    primary: '#9c27b0',
                    secondary: '#9c27b020',
                    gradient: 'linear-gradient(135deg, #9c27b0, #ba68c8)'
                };
            default:
                return {
                    primary: '#4caf50',
                    secondary: '#4caf5020',
                    gradient: 'linear-gradient(135deg, #4caf50, #66bb6a)'
                };
        }
    };

    const isCurrentPlan = (planId) => currentPlan === planId;
    const isPopular = (planId) => SUBSCRIPTION_PLANS[planId]?.popular;
    const isBestValue = (planId) => SUBSCRIPTION_PLANS[planId]?.bestValue;

    return (
        <Box sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2
                    }}
                >
                    {t('chooseSubscriptionPlan')}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        color: 'rgba(255,255,255,0.8)',
                        maxWidth: 600,
                        mx: 'auto'
                    }}
                >
                    {t('getAccessToPersonalized')}
                </Typography>
            </Box>

            {error && (
                <Box sx={{
                    mb: 3,
                    p: 2,
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    borderRadius: 2,
                    textAlign: 'center'
                }}>
                    <Typography sx={{ color: '#f44336' }}>
                        {error}
                    </Typography>
                </Box>
            )}

            <Grid container spacing={3} justifyContent="center">
                {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => {
                    const colors = getPlanColor(planId);
                    const isSelected = isCurrentPlan(planId);
                    const popular = isPopular(planId);

                    return (
                        <Grid item xs={12} md={4} key={planId}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Object.keys(SUBSCRIPTION_PLANS).indexOf(planId) * 0.1 }}
                            >
                                <Card
                                    sx={{
                                        height: '100%',
                                        background: isSelected
                                            ? colors.gradient
                                            : 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)',
                                        border: `2px solid ${isSelected ? colors.primary : 'rgba(255, 107, 53, 0.3)'}`,
                                        borderRadius: 3,
                                        position: 'relative',
                                        overflow: 'visible',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {(popular || isBestValue(planId) || plan.badgeKey) && (
                                        <Chip
                                            label={plan.badgeKey ? t(plan.badgeKey) : (popular ? t('mostPopular') : t('bestPrice'))}
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: colors.gradient,
                                                color: 'white',
                                                fontWeight: 'bold',
                                                zIndex: 1
                                            }}
                                        />
                                    )}

                                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                        <Box sx={{ mb: 2 }}>
                                            {getPlanIcon(planId)}
                                        </Box>

                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: isSelected ? 'white' : colors.primary,
                                                mb: 1
                                            }}
                                        >
                                            {t(plan.nameKey)}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
                                                mb: 3,
                                                minHeight: 40
                                            }}
                                        >
                                            {t(plan.descriptionKey)}
                                        </Typography>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography
                                                variant="h3"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: isSelected ? 'white' : colors.primary
                                                }}
                                            >
                                                {formatPrice(plan.price, plan.currency)}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)'
                                                }}
                                            >
                                                {language === 'ru' ? 'за' : 'per'} {t(plan.durationKey)}
                                            </Typography>

                                            {plan.savings && (
                                                <Chip
                                                    label={`${t('savings')} ${plan.savings}`}
                                                    size="small"
                                                    sx={{
                                                        mt: 1,
                                                        backgroundColor: '#4caf5020',
                                                        color: '#4caf50',
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            )}

                                            {plan.trialDays && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: 'block',
                                                        color: '#4caf50',
                                                        fontWeight: 'bold',
                                                        mt: 1
                                                    }}
                                                >
                                                    🎁 {plan.trialDays} {t('freeDays')}
                                                </Typography>
                                            )}
                                        </Box>

                                        <List sx={{ mb: 3 }}>
                                            {plan.featureKeys.map((featureKey, index) => (
                                                <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                                        <CheckIcon
                                                            sx={{
                                                                fontSize: 20,
                                                                color: isSelected ? 'white' : colors.primary
                                                            }}
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={t(featureKey)}
                                                        primaryTypographyProps={{
                                                            variant: 'body2',
                                                            sx: {
                                                                color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.8)',
                                                                fontSize: '0.9rem'
                                                            }
                                                        }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>

                                        <Button
                                            variant={isSelected ? "outlined" : "contained"}
                                            fullWidth
                                            disabled={loading === planId || isSelected}
                                            onClick={() => handlePlanSelect(planId)}
                                            sx={{
                                                py: 1.5,
                                                borderRadius: 2,
                                                fontWeight: 'bold',
                                                background: isSelected
                                                    ? 'transparent'
                                                    : colors.gradient,
                                                borderColor: isSelected ? 'white' : 'transparent',
                                                color: isSelected ? 'white' : 'white',
                                                '&:hover': {
                                                    background: isSelected
                                                        ? 'rgba(255,255,255,0.1)'
                                                        : colors.gradient,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 8px 25px ${colors.secondary}`
                                                },
                                                '&:disabled': {
                                                    background: isSelected
                                                        ? 'transparent'
                                                        : 'rgba(255,255,255,0.1)',
                                                    color: 'rgba(255,255,255,0.5)'
                                                }
                                            }}
                                        >
                                            {loading === planId ? (
                                                <CircularProgress size={24} sx={{ color: 'white' }} />
                                            ) : isSelected ? (
                                                t('currentPlan')
                                            ) : (
                                                t('selectPlan')
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    );
                })}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'rgba(255,255,255,0.6)',
                        mb: 1
                    }}
                >
                    🔒 {t('securePayment')}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'rgba(255,255,255,0.5)'
                    }}
                >
                    {t('cancelAnytime')}
                </Typography>
            </Box>
        </Box>
    );
};

SubscriptionPlans.propTypes = {
    onPlanSelect: PropTypes.func,
    currentPlan: PropTypes.string
};

export default SubscriptionPlans;
