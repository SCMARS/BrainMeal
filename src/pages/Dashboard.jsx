import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    useTheme,
    useMediaQuery,
    IconButton,
    Tooltip,
    Paper,
    Fade,
    Divider,
    Chip,
    Avatar,
    Badge
} from '@mui/material';
import {
    Restaurant as RestaurantIcon,
    EmojiEvents as EmojiEventsIcon,
    TrendingUp as TrendingUpIcon,
    Add as AddIcon,
    ArrowForward as ArrowForwardIcon,
    LocalFireDepartment as FireIcon,
    WaterDrop as WaterIcon,
    FitnessCenter as FitnessIcon,
    CalendarToday as CalendarIcon,
    BarChart as AnalyticsIcon,
    Notifications as NotificationsIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useMealPlan } from '../context/MealPlanContext';
import { useAuth } from '../context/AuthContext';

const MotionCard = motion(Card);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);

const StatCard = ({ title, value, icon, color, onClick, index }) => {
    const theme = useTheme();
    return (
        <MotionCard 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            sx={{ 
                height: '100%',
                cursor: 'pointer',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${color}, ${theme.palette.primary.main})`,
                }
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box sx={{ 
                            p: 1.5, 
                            borderRadius: 2, 
                            bgcolor: `${color}15`,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {icon}
                        </Box>
                    </motion.div>
                    <MotionTypography 
                        variant="h6" 
                        color="textSecondary"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {title}
                    </MotionTypography>
                </Box>
                <MotionTypography 
                    variant="h4" 
                    component="div" 
                    sx={{ 
                        mb: 1,
                        background: `linear-gradient(45deg, ${color}, ${theme.palette.primary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 'bold'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {value}
                </MotionTypography>
            </CardContent>
        </MotionCard>
    );
};

const QuickAction = ({ icon, title, onClick, index }) => {
    return (
        <MotionButton
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            whileHover={{ x: 10 }}
            whileTap={{ scale: 0.98 }}
            variant="outlined"
            startIcon={icon}
            endIcon={<ArrowForwardIcon />}
            onClick={onClick}
            sx={{
                width: '100%',
                justifyContent: 'space-between',
                py: 2,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.2)',
                }
            }}
        >
            {title}
        </MotionButton>
    );
};

const ProgressBar = ({ value, color, label }) => {
    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                    {label}
                </Typography>
                <Typography variant="body2" color={color}>
                    {value}%
                </Typography>
            </Box>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                <LinearProgress 
                    variant="determinate" 
                    value={value}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            background: `linear-gradient(90deg, ${color}, ${color}80)`,
                        }
                    }}
                />
            </motion.div>
        </Box>
    );
};

const NotificationCard = ({ type, message, time }) => {
    const theme = useTheme();
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon color="success" />;
            case 'warning':
                return <WarningIcon color="warning" />;
            case 'info':
                return <InfoIcon color="info" />;
            default:
                return <InfoIcon />;
        }
    };

    return (
        <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.palette.divider}`,
            }}
        >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getIcon()}
                <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{message}</Typography>
                    <Typography variant="caption" color="textSecondary">{time}</Typography>
                </Box>
            </CardContent>
        </MotionCard>
    );
};

export default function Dashboard() {
    const theme = useTheme();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { mealPlan } = useMealPlan();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([
        { type: 'success', message: 'Вы достигли своей цели по калориям!', time: '10 минут назад' },
        { type: 'warning', message: 'Пора обновить план питания', time: '2 часа назад' },
        { type: 'info', message: 'Новое достижение разблокировано!', time: '5 часов назад' }
    ]);

    const stats = [
        {
            title: t('Meal Plans'),
            value: '5',
            icon: <RestaurantIcon sx={{ color: theme.palette.primary.main }} />,
            color: theme.palette.primary.main,
            onClick: () => navigate('/meal-plan')
        },
        {
            title: t('Achievements'),
            value: '3/10',
            icon: <EmojiEventsIcon sx={{ color: theme.palette.secondary.main }} />,
            color: theme.palette.secondary.main,
            onClick: () => navigate('/achievements')
        },
        {
            title: t('Progress'),
            value: '75%',
            icon: <TrendingUpIcon sx={{ color: theme.palette.success.main }} />,
            color: theme.palette.success.main,
            onClick: () => navigate('/analytics')
        }
    ];

    const quickActions = [
        {
            title: t('Generate New Meal Plan'),
            icon: <AddIcon />,
            onClick: () => navigate('/meal-plan')
        },
        {
            title: t('View Achievements'),
            icon: <EmojiEventsIcon />,
            onClick: () => navigate('/achievements')
        },
        {
            title: t('Check Analytics'),
            icon: <TrendingUpIcon />,
            onClick: () => navigate('/analytics')
        }
    ];

    return (
        <Box sx={{ 
            p: 3,
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
        }}>
            <MotionTypography 
                variant="h4" 
                sx={{ 
                    mb: 4, 
                    fontWeight: 'bold',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {t('Welcome')}, {user?.name || t('User')}!
            </MotionTypography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <StatCard {...stat} index={index} />
                    </Grid>
                ))}
            </Grid>

            {/* Current Meal Plan */}
            {mealPlan && (
                <MotionCard 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    sx={{ 
                        mb: 4,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                >
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                {t('Current Meal Plan')}
                            </Typography>
                            <MotionButton
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                variant="text"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => navigate('/meal-plan')}
                            >
                                {t('View Details')}
                            </MotionButton>
                        </Box>
                        <Grid container spacing={2}>
                            {mealPlan.meals?.slice(0, 3).map((meal, index) => (
                                <Grid item xs={12} sm={4} key={index}>
                                    <MotionCard 
                                        variant="outlined"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 + 0.3 }}
                                        whileHover={{ scale: 1.02 }}
                                        sx={{
                                            background: 'rgba(255,255,255,0.05)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <CardContent>
                                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                                {meal.name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {meal.calories} {t('calories')}
                                            </Typography>
                                        </CardContent>
                                    </MotionCard>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </MotionCard>
            )}

            {/* Quick Actions and Progress */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <MotionCard
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {t('Quick Actions')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {quickActions.map((action, index) => (
                                    <QuickAction key={index} {...action} index={index} />
                                ))}
                            </Box>
                        </CardContent>
                    </MotionCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <MotionCard
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {t('Weekly Progress')}
                            </Typography>
                            <ProgressBar 
                                value={75} 
                                color={theme.palette.primary.main} 
                                label={t('Nutrition Goals')} 
                            />
                            <ProgressBar 
                                value={60} 
                                color={theme.palette.secondary.main} 
                                label={t('Activity Goals')} 
                            />
                        </CardContent>
                    </MotionCard>
                </Grid>
            </Grid>

            {/* Notifications */}
            <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                sx={{
                    mt: 4,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <NotificationsIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">
                            {t('Recent Activity')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {notifications.map((notification, index) => (
                            <NotificationCard key={index} {...notification} />
                        ))}
                    </Box>
                </CardContent>
            </MotionCard>
        </Box>
    );
} 