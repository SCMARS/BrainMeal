import React, { useEffect, useState, useMemo } from 'react';
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
    Badge,
    CircularProgress,
    Fab
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
    Info as InfoIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useMealPlan } from '../context/MealPlanContext';
import { useAuth } from '../context/AuthContext';

const MotionCard = motion(Card);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);

const StatCard = ({ title, value, icon, color, onClick, index, subtitle, loading = false, t }) => {
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
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 50%, rgba(74, 44, 23, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                boxShadow: `
                    0 20px 40px rgba(0,0,0,0.3),
                    0 0 0 1px rgba(255, 107, 53, 0.2),
                    inset 0 1px 0 rgba(255, 140, 66, 0.1)
                `,
                border: '2px solid rgba(255, 107, 53, 0.3)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${color}, #ff8c42)`,
                    animation: 'glow 2s ease-in-out infinite alternate'
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.1), transparent)',
                    animation: 'shimmer 3s infinite',
                    zIndex: 1
                },
                '@keyframes glow': {
                    '0%': { boxShadow: '0 0 5px rgba(255, 107, 53, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(255, 140, 66, 0.8)' }
                },
                '@keyframes shimmer': {
                    '0%': { left: '-100%' },
                    '100%': { left: '100%' }
                }
            }}
            onClick={onClick}
        >
            <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${color}20, ${color}40)`,
                            border: `1px solid ${color}50`,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 15px ${color}30`
                        }}>
                            {React.cloneElement(icon, { sx: { color: color, fontSize: '1.8rem' } })}
                        </Box>
                    </motion.div>
                    <Box sx={{ flex: 1 }}>
                        <MotionTypography
                            variant="h6"
                            sx={{
                                color: 'rgba(255,255,255,0.9)',
                                fontWeight: 'bold'
                            }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {title}
                        </MotionTypography>
                        {subtitle && (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={24} sx={{ color: color }} />
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {t('loading')}
                        </Typography>
                    </Box>
                ) : (
                    <MotionTypography
                        variant="h3"
                        component="div"
                        sx={{
                            mb: 1,
                            background: `linear-gradient(45deg, ${color}, #ff8c42)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold',
                            textShadow: `0 0 20px ${color}50`
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {value}
                    </MotionTypography>
                )}
            </CardContent>
        </MotionCard>
    );
};

const QuickAction = ({ icon, title, onClick, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            whileHover={{ x: 10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Button
                variant="outlined"
                startIcon={React.cloneElement(icon, { sx: { color: '#ff8c42' } })}
                endIcon={<ArrowForwardIcon sx={{ color: '#ff6b35' }} />}
                onClick={onClick}
                sx={{
                    width: '100%',
                    justifyContent: 'space-between',
                    py: 2,
                    px: 3,
                    borderRadius: 3,
                    textTransform: 'none',
                    border: '2px solid rgba(255, 107, 53, 0.3)',
                    background: 'rgba(255, 107, 53, 0.1)',
                    backdropFilter: 'blur(10px)',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 'bold',
                    '&:hover': {
                        background: 'rgba(255, 107, 53, 0.2)',
                        borderColor: 'rgba(255, 107, 53, 0.5)',
                        boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)',
                        transform: 'translateX(5px)'
                    }
                }}
            >
                {title}
            </Button>
        </motion.div>
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
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '1.5rem' }} />;
            case 'warning':
                return <WarningIcon sx={{ color: '#ff9800', fontSize: '1.5rem' }} />;
            case 'info':
                return <InfoIcon sx={{ color: '#2196f3', fontSize: '1.5rem' }} />;
            default:
                return <InfoIcon sx={{ color: '#ff8c42', fontSize: '1.5rem' }} />;
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return '#4caf50';
            case 'warning': return '#ff9800';
            case 'info': return '#2196f3';
            default: return '#ff8c42';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02, x: 5 }}
        >
            <Card sx={{
                background: `rgba(${type === 'success' ? '76, 175, 80' :
                                  type === 'warning' ? '255, 152, 0' :
                                  type === 'info' ? '33, 150, 243' : '255, 140, 66'}, 0.1)`,
                border: `1px solid rgba(${type === 'success' ? '76, 175, 80' :
                                         type === 'warning' ? '255, 152, 0' :
                                         type === 'info' ? '33, 150, 243' : '255, 140, 66'}, 0.3)`,
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
            }}>
                <CardContent sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 2
                }}>
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 4
                        }}
                    >
                        {getIcon()}
                    </motion.div>
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.9)',
                                fontWeight: 500
                            }}
                        >
                            {message}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '0.75rem'
                            }}
                        >
                            {time}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default function Dashboard() {
    const theme = useTheme();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { meals } = useMealPlan();
    const { user, userProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Расчет реальной статистики с улучшенной аналитикой
    const dashboardStats = useMemo(() => {
        if (!meals || meals.length === 0) {
            return {
                totalMeals: 0,
                todayCalories: 0,
                weeklyCalories: 0,
                weeklyProgress: 0,
                achievements: 0,
                todayProtein: 0,
                todayCarbs: 0,
                todayFat: 0,
                weeklyProtein: 0,
                weeklyCarbs: 0,
                weeklyFat: 0,
                uniqueIngredients: 0,
                accuracyScore: 0,
                weeklyAccuracy: 0,
                streak: 0,
                avgCaloriesPerDay: 0,
                mealBalance: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
            };
        }

        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Фильтрация блюд по периодам
        const todayMeals = meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate.toDateString() === today.toDateString();
        });

        const weekMeals = meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= weekAgo && mealDate <= today;
        });

        // Расчет сегодняшних макронутриентов
        const todayNutrition = todayMeals.reduce((total, meal) => ({
            calories: total.calories + (Number(meal.calories) || 0),
            protein: total.protein + (Number(meal.protein) || 0),
            carbs: total.carbs + (Number(meal.carbs) || 0),
            fat: total.fat + (Number(meal.fat) || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        // Расчет недельных макронутриентов
        const weekNutrition = weekMeals.reduce((total, meal) => ({
            calories: total.calories + (Number(meal.calories) || 0),
            protein: total.protein + (Number(meal.protein) || 0),
            carbs: total.carbs + (Number(meal.carbs) || 0),
            fat: total.fat + (Number(meal.fat) || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        // Баланс типов блюд
        const mealBalance = todayMeals.reduce((balance, meal) => {
            const type = meal.type || 'snack';
            balance[type] = (balance[type] || 0) + 1;
            return balance;
        }, { breakfast: 0, lunch: 0, dinner: 0, snack: 0 });

        // Подсчет уникальных ингредиентов
        const allIngredients = new Set();
        meals.forEach(meal => {
            if (meal.ingredients && Array.isArray(meal.ingredients)) {
                meal.ingredients.forEach(ingredient => allIngredients.add(ingredient));
            }
        });

        // Расчет стрика (дней подряд с достижением цели)
        let streak = 0;
        const targetCalories = userProfile?.calorieTarget || 2000;
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dayMeals = meals.filter(meal => {
                const mealDate = new Date(meal.date);
                return mealDate.toDateString() === checkDate.toDateString();
            });
            const dayCalories = dayMeals.reduce((total, meal) => total + (Number(meal.calories) || 0), 0);

            if (dayCalories >= targetCalories * 0.8 && dayCalories <= targetCalories * 1.2) {
                streak++;
            } else {
                break;
            }
        }

        // Средние калории в день за неделю
        const avgCaloriesPerDay = weekMeals.length > 0 ? Math.round(weekNutrition.calories / 7) : 0;

        // Прогресс по калориям
        const dailyProgress = Math.min((todayNutrition.calories / targetCalories) * 100, 100);
        const weeklyProgress = Math.min((avgCaloriesPerDay / targetCalories) * 100, 100);

        // Расчет точности попадания в цели (сегодня)
        let accuracyScore = 0;
        if (userProfile && userProfile.calorieTarget && todayNutrition.calories > 0) {
            const deviation = Math.abs(todayNutrition.calories - userProfile.calorieTarget);
            const maxDeviation = userProfile.calorieTarget * 0.2; // 20% отклонение
            accuracyScore = Math.max(0, Math.round(100 - (deviation / maxDeviation) * 100));
        }

        // Недельная точность
        let weeklyAccuracy = 0;
        if (userProfile && userProfile.calorieTarget && avgCaloriesPerDay > 0) {
            const weekDeviation = Math.abs(avgCaloriesPerDay - userProfile.calorieTarget);
            const maxDeviation = userProfile.calorieTarget * 0.15; // 15% отклонение для недели
            weeklyAccuracy = Math.max(0, Math.round(100 - (weekDeviation / maxDeviation) * 100));
        }

        // Подсчет достижений (улучшенная логика)
        let achievements = 0;
        if (meals.length >= 10) achievements++; // Первые 10 блюд
        if (meals.length >= 50) achievements++; // 50 блюд
        if (meals.length >= 100) achievements++; // 100 блюд
        if (todayNutrition.calories >= targetCalories * 0.8 && todayNutrition.calories <= targetCalories * 1.2) achievements++; // Цель дня
        if (allIngredients.size >= 20) achievements++; // Разнообразие ингредиентов
        if (allIngredients.size >= 50) achievements++; // Большое разнообразие
        if (accuracyScore >= 90) achievements++; // Высокая точность
        if (streak >= 3) achievements++; // Стрик 3 дня
        if (streak >= 7) achievements++; // Стрик неделя
        if (weeklyAccuracy >= 85) achievements++; // Недельная точность

        return {
            totalMeals: meals.length,
            todayCalories: Math.round(todayNutrition.calories),
            weeklyCalories: Math.round(weekNutrition.calories),
            todayProtein: Math.round(todayNutrition.protein),
            todayCarbs: Math.round(todayNutrition.carbs),
            todayFat: Math.round(todayNutrition.fat),
            weeklyProtein: Math.round(weekNutrition.protein),
            weeklyCarbs: Math.round(weekNutrition.carbs),
            weeklyFat: Math.round(weekNutrition.fat),
            weeklyProgress: Math.round(weeklyProgress),
            achievements,
            uniqueIngredients: allIngredients.size,
            accuracyScore: Math.round(accuracyScore),
            weeklyAccuracy: Math.round(weeklyAccuracy),
            streak,
            avgCaloriesPerDay,
            mealBalance
        };
    }, [meals, userProfile]);

    // Генерация уведомлений на основе данных
    useEffect(() => {
        const generateNotifications = () => {
            const newNotifications = [];
            const {
                todayCalories,
                weeklyProgress,
                accuracyScore,
                streak,
                achievements,
                uniqueIngredients,
                weeklyAccuracy
            } = dashboardStats;
            const targetCalories = userProfile?.calorieTarget || 2000;

            // Уведомления о достижении целей
            if (todayCalories >= targetCalories * 0.8 && todayCalories <= targetCalories * 1.2) {
                newNotifications.push({
                    type: 'success',
                    message: `🎉 ${t('excellentWork')} (${todayCalories}/${targetCalories})`,
                    time: t('today') || 'Today'
                });
            } else if (todayCalories < targetCalories * 0.5) {
                newNotifications.push({
                    type: 'warning',
                    message: `⚠️ ${t('addMoreMeals')} ${Math.round((todayCalories/targetCalories)*100)}% ${t('ofTarget')}`,
                    time: t('today') || 'Today'
                });
            } else if (todayCalories > targetCalories * 1.3) {
                newNotifications.push({
                    type: 'info',
                    message: `📊 ${t('exceedsTarget')} ${Math.round(((todayCalories-targetCalories)/targetCalories)*100)}% ${t('watchPortions')}`,
                    time: t('today') || 'Today'
                });
            }

            // Уведомления о стрике
            if (streak >= 7) {
                newNotifications.push({
                    type: 'success',
                    message: `🔥 ${t('incredibleStreak')} ${streak} ${t('daysInRow')}`,
                    time: t('today') || 'Today'
                });
            } else if (streak >= 3) {
                newNotifications.push({
                    type: 'success',
                    message: `🔥 ${t('greatStreak')} ${streak} ${t('days')}`,
                    time: t('today') || 'Today'
                });
            }

            // Уведомления о точности
            if (accuracyScore >= 95) {
                newNotifications.push({
                    type: 'success',
                    message: `🎯 ${t('perfectAccuracy')} ${accuracyScore}%! ${t('masterOfPlanning')}`,
                    time: t('today') || 'Today'
                });
            } else if (accuracyScore >= 85) {
                newNotifications.push({
                    type: 'success',
                    message: `🎯 ${t('excellentAccuracy')} ${accuracyScore}%! ${t('almostPerfect')}`,
                    time: t('today') || 'Today'
                });
            }

            // Уведомления о достижениях
            if (achievements >= 8) {
                newNotifications.push({
                    type: 'success',
                    message: `🏆 ${t('congratulations')} ${achievements}/10 ${t('achievements')}`,
                    time: t('today') || 'Today'
                });
            }

            // Уведомления о разнообразии
            if (uniqueIngredients >= 30) {
                newNotifications.push({
                    type: 'success',
                    message: `🌟 ${t('excellentVariety')} ${uniqueIngredients} ${t('uniqueIngredients')}`,
                    time: t('today') || 'Today'
                });
            }

            // Уведомления для новых пользователей
            if (meals && meals.length === 0) {
                newNotifications.push({
                    type: 'info',
                    message: `💡 ${t('welcome')}`,
                    time: t('now') || 'Now'
                });
            } else if (meals && meals.length === 1) {
                newNotifications.push({
                    type: 'info',
                    message: `🎯 ${t('greatStart')}`,
                    time: t('today') || 'Today'
                });
            }

            // Недельная аналитика
            if (weeklyAccuracy >= 90) {
                newNotifications.push({
                    type: 'success',
                    message: `📅 ${t('amazingWeeklyAccuracy')} ${weeklyAccuracy}%! ${t('youAreProfessional')}`,
                    time: t('thisWeek') || 'This week'
                });
            }

            setNotifications(newNotifications.slice(0, 4)); // Ограничиваем до 4 уведомлений
        };

        generateNotifications();
        setLoading(false);
    }, [dashboardStats, meals, userProfile, t]);

    // Обработчик скролла для кнопки "Наверх"
    useEffect(() => {
        const handleScroll = (e) => {
            const scrollTop = e.target.scrollTop || document.documentElement.scrollTop;
            setShowScrollTop(scrollTop > 300);
        };

        // Добавляем обработчик на главный контейнер с скроллом
        const scrollContainer = document.querySelector('[data-dashboard-scroll]');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        } else {
            // Fallback на window scroll
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    // Функция прокрутки наверх
    const scrollToTop = () => {
        const scrollContainer = document.querySelector('[data-dashboard-scroll]');
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const stats = [
        {
            title: t('totalMeals'),
            subtitle: `📈 ${t('weeklyProgress')}: ${dashboardStats.weeklyProgress}%`,
            value: dashboardStats.totalMeals,
            icon: <RestaurantIcon />,
            color: '#ff6b35',
            onClick: () => navigate('/meal-plan'),
            loading: loading
        },
        {
            title: t('todaysCalories'),
            subtitle: `🎯 ${t('target')}: ${userProfile?.calorieTarget || 2000} | 📊 ${t('weekly')}: ${dashboardStats.avgCaloriesPerDay}`,
            value: `${dashboardStats.todayCalories}`,
            icon: <FireIcon />,
            color: '#ff8c42',
            onClick: () => navigate('/meal-plan'),
            loading: loading
        },
        {
            title: `💪 ${t('protein')} (${t('today')})`,
            subtitle: `🍞 ${dashboardStats.todayCarbs}г ${t('carbs')} | 🥑 ${dashboardStats.todayFat}г ${t('fat')}`,
            value: `${dashboardStats.todayProtein}г`,
            icon: <TrendingUpIcon />,
            color: '#4caf50',
            onClick: () => navigate('/analytics'),
            loading: loading
        },
        {
            title: `🎯 ${t('accuracy')} (${t('today')})`,
            subtitle: `📅 ${t('weekly')}: ${dashboardStats.weeklyAccuracy}% | 🔥 ${t('streak')}: ${dashboardStats.streak} ${t('days')}`,
            value: `${dashboardStats.accuracyScore}%`,
            icon: <AnalyticsIcon />,
            color: dashboardStats.accuracyScore >= 90 ? '#4caf50' : dashboardStats.accuracyScore >= 70 ? '#ff9800' : '#f44336',
            onClick: () => navigate('/analytics'),
            loading: loading
        },
        {
            title: `🌟 ${t('ingredients')}`,
            subtitle: `🍽️ ${t('breakfast')}: ${dashboardStats.mealBalance.breakfast} | 🥗 ${t('lunch')}: ${dashboardStats.mealBalance.lunch} | 🍽️ ${t('dinner')}: ${dashboardStats.mealBalance.dinner}`,
            value: dashboardStats.uniqueIngredients,
            icon: <EmojiEventsIcon />,
            color: '#9c27b0',
            onClick: () => navigate('/analytics'),
            loading: loading
        },
        {
            title: `🏆 ${t('achievements')}`,
            subtitle: `✨ ${t('unlocked')} ${dashboardStats.achievements} ${t('of')} 10`,
            value: `${dashboardStats.achievements}/10`,
            icon: <EmojiEventsIcon />,
            color: dashboardStats.achievements >= 8 ? '#ffd700' : dashboardStats.achievements >= 5 ? '#ff8c42' : '#ff6b35',
            onClick: () => navigate('/achievements'),
            loading: loading
        }
    ];

    const quickActions = [
        {
            title: `🍽️ ${t('generatePlan')}`,
            icon: <AddIcon />,
            onClick: () => navigate('/meal-plan')
        },
        {
            title: `🏆 ${t('viewAll')} ${t('achievements')}`,
            icon: <EmojiEventsIcon />,
            onClick: () => navigate('/achievements')
        },
        {
            title: `📊 ${t('analytics')}`,
            icon: <AnalyticsIcon />,
            onClick: () => navigate('/analytics')
        },
        {
            title: `👤 ${t('edit')} ${t('profile')}`,
            icon: <CalendarIcon />,
            onClick: () => navigate('/profile')
        },
        {
            title: `🎯 ${t('Detailed Meal Planner')}`,
            icon: <AddIcon />,
            onClick: () => navigate('/detailed-meal-planner')
        }
    ];

    return (
        <Box
            data-dashboard-scroll
            sx={{
                height: '100vh',
                overflow: 'auto',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1810 25%, #4a2c17 50%, #ff6b35 75%, #ff8c42 100%)',
                position: 'relative',
                '&::-webkit-scrollbar': {
                    width: '14px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'rgba(26, 26, 26, 0.8)',
                    borderRadius: '8px',
                    margin: '4px',
                    border: '1px solid rgba(255, 107, 53, 0.2)',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                    borderRadius: '8px',
                    border: '2px solid rgba(26, 26, 26, 0.8)',
                    boxShadow: '0 0 10px rgba(255, 107, 53, 0.3)',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #e55a2b, #e8851a)',
                        boxShadow: '0 0 15px rgba(255, 107, 53, 0.5)',
                    },
                },
                // Для Firefox
                scrollbarWidth: 'thin',
                scrollbarColor: '#ff6b35 rgba(26, 26, 26, 0.8)',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(circle at 20% 80%, rgba(255, 107, 53, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 140, 66, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(255, 107, 53, 0.2) 0%, transparent 50%)
                `,
                animation: 'float 6s ease-in-out infinite',
                zIndex: 0
            },
            '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                '50%': { transform: 'translateY(-20px) rotate(180deg)' }
            }
        }}>
            <Container
                maxWidth="xl"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    py: { xs: 2, sm: 3, md: 4 },
                    px: { xs: 1, sm: 2 },
                    minHeight: '200vh', // Увеличиваем минимальную высоту для демонстрации скролла
                }}
            >
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <MotionTypography
                            variant="h3"
                            sx={{
                                mb: 2,
                                background: 'linear-gradient(45deg, #ff6b35, #ff8c42, #ffa726)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 900,
                                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                            }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            🔥 {t('welcome')}, {user?.displayName || user?.email?.split('@')[0] || t('user') || 'User'}!
                        </MotionTypography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255,255,255,0.9)',
                                fontWeight: 400
                            }}
                        >
                            📊 {t('nutritionOverview')}
                        </Typography>
                    </Box>
                </motion.div>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <StatCard {...stat} index={index} t={t} />
                    </Grid>
                ))}
            </Grid>

                {/* Сегодняшние блюда */}
                {meals && meals.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <Card sx={{
                            mb: 4,
                            background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 50%, rgba(74, 44, 23, 0.95) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 4,
                            boxShadow: `
                                0 20px 40px rgba(0,0,0,0.3),
                                0 0 0 1px rgba(255, 107, 53, 0.2)
                            `,
                            border: '2px solid rgba(255, 107, 53, 0.3)',
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        🍽️ {t('todaysMeals')}
                                    </Typography>
                                    <MotionButton
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        variant="contained"
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={() => navigate('/meal-plan')}
                                        sx={{
                                            background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #e55a2b, #e57a35)',
                                            }
                                        }}
                                    >
                                        {t('viewAll')}
                                    </MotionButton>
                                </Box>
                                <Grid container spacing={2}>
                                    {meals.filter(meal => {
                                        const today = new Date();
                                        const mealDate = new Date(meal.date);
                                        return mealDate.toDateString() === today.toDateString();
                                    }).slice(0, 3).map((meal, index) => (
                                        <Grid item xs={12} sm={4} key={index}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 + 0.5 }}
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <Card sx={{
                                                    background: 'rgba(255, 107, 53, 0.1)',
                                                    border: '1px solid rgba(255, 107, 53, 0.3)',
                                                    borderRadius: 3
                                                }}>
                                                    <CardContent>
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{
                                                                mb: 1,
                                                                color: '#ff8c42',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            {meal.name}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: 'rgba(255,255,255,0.8)' }}
                                                        >
                                                            🔥 {meal.calories} {t('calories')}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{ color: 'rgba(255,255,255,0.6)' }}
                                                        >
                                                            {meal.type === 'breakfast' ? `🌅 ${t('breakfast')}` :
                                                             meal.type === 'lunch' ? `☀️ ${t('lunch')}` :
                                                             meal.type === 'dinner' ? `🌙 ${t('dinner')}` : `🍎 ${t('snack')}`}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

            {/* Quick Actions and Progress */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        <Card sx={{
                            background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 50%, rgba(74, 44, 23, 0.95) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 4,
                            boxShadow: `
                                0 20px 40px rgba(0,0,0,0.3),
                                0 0 0 1px rgba(255, 107, 53, 0.2)
                            `,
                            border: '2px solid rgba(255, 107, 53, 0.3)',
                        }}>
                            <CardContent>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        mb: 3,
                                        background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ⚡ {t('quickStats')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {quickActions.map((action, index) => (
                                        <QuickAction key={index} {...action} index={index} />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>

                <Grid item xs={12} md={6}>
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                    >
                        <Card sx={{
                            background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 50%, rgba(74, 44, 23, 0.95) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 4,
                            boxShadow: `
                                0 20px 40px rgba(0,0,0,0.3),
                                0 0 0 1px rgba(255, 107, 53, 0.2)
                            `,
                            border: '2px solid rgba(255, 107, 53, 0.3)',
                        }}>
                            <CardContent>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        mb: 3,
                                        background: 'linear-gradient(45deg, #ff8c42, #ffa726)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    📈 {t('analytics')} & {t('progress')}
                                </Typography>

                                {/* Недельный прогресс калорий */}
                                <ProgressBar
                                    value={dashboardStats.weeklyProgress}
                                    color="#ff6b35"
                                    label={`📅 ${t('weekly')} ${t('calories')} (${dashboardStats.avgCaloriesPerDay}/${userProfile?.calorieTarget || 2000})`}
                                />

                                {/* Точность попадания в цели */}
                                <ProgressBar
                                    value={dashboardStats.accuracyScore}
                                    color={dashboardStats.accuracyScore >= 90 ? "#4caf50" : dashboardStats.accuracyScore >= 70 ? "#ff9800" : "#f44336"}
                                    label={`🎯 ${t('accuracy')} ${t('today')} (${dashboardStats.accuracyScore}%)`}
                                />

                                {/* Стрик дней */}
                                <ProgressBar
                                    value={Math.min((dashboardStats.streak / 7) * 100, 100)}
                                    color="#2196f3"
                                    label={`🔥 ${t('streak')}: ${dashboardStats.streak} ${t('days')} (${t('target')}: 7)`}
                                />

                                {/* Разнообразие ингредиентов */}
                                <ProgressBar
                                    value={Math.min((dashboardStats.uniqueIngredients / 50) * 100, 100)}
                                    color="#9c27b0"
                                    label={`🌟 ${t('ingredients')}: ${dashboardStats.uniqueIngredients}/50`}
                                />

                                {/* Достижения */}
                                <ProgressBar
                                    value={(dashboardStats.achievements / 10) * 100}
                                    color={dashboardStats.achievements >= 8 ? "#ffd700" : "#ff8c42"}
                                    label={`🏆 ${t('achievements')}: ${dashboardStats.achievements}/10`}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>

                {/* Уведомления */}
                {notifications.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                    >
                        <Card sx={{
                            mt: 4,
                            background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 50%, rgba(74, 44, 23, 0.95) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 4,
                            boxShadow: `
                                0 20px 40px rgba(0,0,0,0.3),
                                0 0 0 1px rgba(255, 107, 53, 0.2)
                            `,
                            border: '2px solid rgba(255, 107, 53, 0.3)',
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 10, -10, 0]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 3
                                        }}
                                    >
                                        <NotificationsIcon sx={{
                                            mr: 2,
                                            color: '#ff8c42',
                                            fontSize: '2rem'
                                        }} />
                                    </motion.div>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            background: 'linear-gradient(45deg, #ffa726, #ffb74d)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        🔔 {t('recentActivity')}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {notifications.map((notification, index) => (
                                        <NotificationCard key={index} {...notification} />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </Container>

            {/* Кнопка "Наверх" */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'fixed',
                            bottom: '24px',
                            right: '24px',
                            zIndex: 1000
                        }}
                    >
                        <Fab
                            color="primary"
                            onClick={scrollToTop}
                            sx={{
                                background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #e55a2b, #e8851a)',
                                    transform: 'scale(1.1)',
                                },
                                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <KeyboardArrowUpIcon />
                        </Fab>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
}

