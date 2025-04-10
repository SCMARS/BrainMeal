import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    LinearProgress,
    Chip,
    useTheme,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    Fab,
    Tabs,
    Tab,
    Fade,
    Zoom,
    Grow
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMealPlan } from '../context/MealPlanContext';
import { useLanguage } from '../context/LanguageContext';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ScheduleIcon from '@mui/icons-material/Schedule';

const AchievementCard = ({ title, description, progress, image, isCompleted, category, onCardClick }) => {
    const { t } = useLanguage();
    const theme = useTheme();
    
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card 
                onClick={onCardClick}
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    background: isCompleted 
                        ? `linear-gradient(135deg, ${theme.palette.success.light}15, ${theme.palette.success.main}15)`
                        : `linear-gradient(135deg, ${theme.palette.grey[300]}15, ${theme.palette.grey[400]}15)`,
                    border: `1px solid ${isCompleted ? theme.palette.success.light : theme.palette.grey[300]}30`,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    '&:hover': {
                        boxShadow: theme.shadows[8],
                        '& .achievement-icon': {
                            transform: 'scale(1.1)',
                        }
                    }
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        height="160"
                        image={image}
                        alt={title}
                        sx={{ 
                            opacity: isCompleted ? 1 : 0.5,
                            transition: 'all 0.3s ease',
                            objectFit: 'cover'
                        }}
                    />
                    <Box
                        className="achievement-icon"
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            transition: 'all 0.3s ease',
                            color: isCompleted ? theme.palette.success.main : theme.palette.grey[400],
                            fontSize: '3rem',
                            opacity: 0.8
                        }}
                    >
                        {isCompleted ? <EmojiEventsIcon fontSize="inherit" /> : <LockIcon fontSize="inherit" />}
                    </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                            {title}
                        </Typography>
                        <Chip 
                            label={isCompleted ? t('completed') : t('inProgress')} 
                            color={isCompleted ? 'success' : 'primary'} 
                            size="small"
                            sx={{ 
                                fontWeight: 'bold',
                                boxShadow: theme.shadows[1]
                            }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {description}
                    </Typography>
                    <Chip 
                        label={t(category)} 
                        size="small" 
                        sx={{ 
                            mt: 1,
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.primary.dark
                        }}
                    />
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                backgroundColor: theme.palette.grey[200],
                                '& .MuiLinearProgress-bar': {
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    borderRadius: 4
                                }
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block" align="right">
                            {progress}%
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const StatCard = ({ title, value, icon, color }) => {
    const theme = useTheme();
    
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette[color].light}15, ${theme.palette[color].main}15)`,
                border: `1px solid ${theme.palette[color].light}30`
            }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {icon}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            {title}
                        </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ color: theme.palette[color].main }}>
                        {value}
                    </Typography>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const Achievements = () => {
    const theme = useTheme();
    const { t } = useLanguage();
    const { meals } = useMealPlan();
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [achievements, setAchievements] = useState([]);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const achievementsRef = useRef(null);

    // Обработчик скролла
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setShowScrollTop(scrollTop > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Функция прокрутки вверх
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Функция проверки достижений
    const checkAchievements = () => {
        const newAchievements = [];
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Получаем данные о приемах пищи
        const weeklyMeals = meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= weekAgo && mealDate <= today;
        });

        const monthlyMeals = meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= monthAgo && mealDate <= today;
        });

        // Достижения для начинающих
        // 1. Первый план питания
        const hasMealPlan = meals.length > 0;
        newAchievements.push({
            id: 'first_meal_plan',
            title: t('First Meal Plan'),
            description: t('Generate your first meal plan'),
            progress: hasMealPlan ? 100 : 0,
            image: '/images/achievements/first-meal-plan.jpg',
            isCompleted: hasMealPlan,
            category: 'beginner',
            icon: <RestaurantMenuIcon />,
            reward: t('Unlocked meal plan customization features')
        });

        // 2. Первый прием пищи
        if (meals.length > 0) {
            newAchievements.push({
                id: 'first_meal',
                title: t('First Meal'),
                description: t('Add your first meal to the plan'),
                progress: 100,
                image: '/images/achievements/first-meal.jpg',
                isCompleted: true,
                category: 'beginner',
                icon: <RestaurantIcon />
            });
        }

        // 3. Достижение за регулярное питание (базовое)
        const mealCount = weeklyMeals.length;
        newAchievements.push({
            id: 'regular_meals',
            title: t('Regular Meals'),
            description: t('Have at least 3 meals per day for 7 days'),
            progress: Math.min(mealCount / 21, 1) * 100,
            image: '/images/achievements/meal-plan.jpg',
            isCompleted: mealCount >= 21,
            category: 'consistency',
            icon: <ScheduleIcon />
        });

        // 4. Достижение за разнообразие питания (базовое)
        const uniqueMeals = new Set(weeklyMeals.map(meal => meal.name));
        newAchievements.push({
            id: 'meal_variety',
            title: t('Meal Variety'),
            description: t('Try at least 10 different meals in a week'),
            progress: Math.min(uniqueMeals.size / 10, 1) * 100,
            image: '/images/achievements/streak.jpg',
            isCompleted: uniqueMeals.size >= 10,
            category: 'cooking'
        });

        // Средние достижения
        // 5. Достижение за сбалансированное питание
        const balancedMeals = weeklyMeals.filter(meal => {
            const protein = parseInt(meal.protein) || 0;
            const carbs = parseInt(meal.carbs) || 0;
            const fat = parseInt(meal.fat) || 0;
            return protein > 0 && carbs > 0 && fat > 0;
        });
        newAchievements.push({
            id: 'balanced_nutrition',
            title: t('Balanced Nutrition'),
            description: t('Have balanced meals (protein, carbs, fat) for 5 days'),
            progress: Math.min(balancedMeals.length / 15, 1) * 100,
            image: '/images/achievements/nutrition.jpg',
            isCompleted: balancedMeals.length >= 15,
            category: 'nutrition'
        });

        // 6. Достижение за здоровые перекусы
        const healthySnacks = weeklyMeals.filter(meal => 
            meal.type === 'snack' && parseInt(meal.calories) < 200
        );
        newAchievements.push({
            id: 'healthy_snacks',
            title: t('Healthy Snacks'),
            description: t('Have healthy snacks (under 200 calories) 5 times'),
            progress: Math.min(healthySnacks.length / 5, 1) * 100,
            image: '/images/achievements/snacks.jpg',
            isCompleted: healthySnacks.length >= 5,
            category: 'health'
        });

        // 7. Достижение за соблюдение калорий
        const calorieTarget = 2000;
        const daysWithinCalories = weeklyMeals.reduce((acc, meal) => {
            const date = new Date(meal.date).toISOString().split('T')[0];
            if (!acc[date]) acc[date] = 0;
            acc[date] += parseInt(meal.calories) || 0;
            return acc;
        }, {});
        const daysAchieved = Object.values(daysWithinCalories).filter(calories => 
            Math.abs(calories - calorieTarget) <= 200
        ).length;
        newAchievements.push({
            id: 'calorie_control',
            title: t('Calorie Control'),
            description: t('Stay within 200 calories of your target for 5 days'),
            progress: Math.min(daysAchieved / 5, 1) * 100,
            image: '/images/achievements/goals.jpg',
            isCompleted: daysAchieved >= 5,
            category: 'control'
        });

        // Сложные достижения
        // 8. Достижение за месячную последовательность
        const monthlyStreak = monthlyMeals.length;
        newAchievements.push({
            id: 'monthly_streak',
            title: t('Monthly Master'),
            description: t('Plan meals for 30 consecutive days'),
            progress: Math.min(monthlyStreak / 90, 1) * 100,
            image: '/images/achievements/monthly-streak.jpg',
            isCompleted: monthlyStreak >= 90,
            category: 'mastery'
        });

        // 9. Достижение за разнообразие блюд
        const allUniqueMeals = new Set(meals.map(meal => meal.name));
        newAchievements.push({
            id: 'meal_master',
            title: t('Meal Master'),
            description: t('Try 50 different meals'),
            progress: Math.min(allUniqueMeals.size / 50, 1) * 100,
            image: '/images/achievements/meal-master.jpg',
            isCompleted: allUniqueMeals.size >= 50,
            category: 'mastery'
        });

        // 10. Достижение за идеальный баланс
        const perfectBalance = weeklyMeals.filter(meal => {
            const protein = parseInt(meal.protein) || 0;
            const carbs = parseInt(meal.carbs) || 0;
            const fat = parseInt(meal.fat) || 0;
            const total = protein + carbs + fat;
            return protein > 0 && carbs > 0 && fat > 0 && 
                   Math.abs(protein/total - 0.3) < 0.1 &&
                   Math.abs(carbs/total - 0.4) < 0.1 &&
                   Math.abs(fat/total - 0.3) < 0.1;
        });
        newAchievements.push({
            id: 'perfect_balance',
            title: t('Perfect Balance'),
            description: t('Have perfectly balanced meals (30/40/30 split) for 3 days'),
            progress: Math.min(perfectBalance.length / 9, 1) * 100,
            image: '/images/achievements/perfect-balance.jpg',
            isCompleted: perfectBalance.length >= 9,
            category: 'mastery'
        });

        // 11. Достижение за точное соблюдение калорий
        const perfectCalories = Object.values(daysWithinCalories).filter(calories => 
            Math.abs(calories - calorieTarget) <= 50
        ).length;
        newAchievements.push({
            id: 'calorie_perfection',
            title: t('Calorie Perfection'),
            description: t('Stay within 50 calories of your target for 3 days'),
            progress: Math.min(perfectCalories / 3, 1) * 100,
            image: '/images/achievements/calorie-perfection.jpg',
            isCompleted: perfectCalories >= 3,
            category: 'mastery'
        });

        // 12. Достижение за раннее питание
        const earlyMeals = weeklyMeals.filter(meal => {
            const mealTime = new Date(meal.date).getHours();
            return mealTime >= 6 && mealTime <= 9;
        });
        newAchievements.push({
            id: 'early_bird',
            title: t('Early Bird'),
            description: t('Have breakfast between 6-9 AM for 5 days'),
            progress: Math.min(earlyMeals.length / 5, 1) * 100,
            image: '/images/achievements/early-bird.jpg',
            isCompleted: earlyMeals.length >= 5,
            category: 'lifestyle'
        });

        // 13. Достижение за позднее питание
        const lateMeals = weeklyMeals.filter(meal => {
            const mealTime = new Date(meal.date).getHours();
            return mealTime >= 18 && mealTime <= 21;
        });
        newAchievements.push({
            id: 'night_owl',
            title: t('Night Owl'),
            description: t('Have dinner between 6-9 PM for 5 days'),
            progress: Math.min(lateMeals.length / 5, 1) * 100,
            image: '/images/achievements/night-owl.jpg',
            isCompleted: lateMeals.length >= 5,
            category: 'lifestyle'
        });

        // Обновляем пути к изображениям
        newAchievements.forEach(achievement => {
            if (!achievement.image) {
                achievement.image = `/images/achievements/${achievement.id}.jpg`;
            }
        });

        setAchievements(newAchievements);
    };

    // Проверяем достижения при изменении данных о приемах пищи
    useEffect(() => {
        checkAchievements();
    }, [meals, t]);

    // Показываем диалог при получении нового достижения
    useEffect(() => {
        const newlyCompleted = achievements.filter(a => a.isCompleted && !a.wasShown);
        if (newlyCompleted.length > 0) {
            const latestAchievement = newlyCompleted[newlyCompleted.length - 1];
            setSelectedAchievement(latestAchievement);
            setOpenDialog(true);
            
            // Помечаем достижение как показанное
            setAchievements(prev => prev.map(a => 
                a.id === latestAchievement.id ? { ...a, wasShown: true } : a
            ));
        }
    }, [achievements]);

    const stats = {
        totalAchievements: achievements.length,
        completedAchievements: achievements.filter(a => a.isCompleted).length,
        completionRate: Math.round((achievements.filter(a => a.isCompleted).length / achievements.length) * 100) || 0
    };

    const handleCategoryChange = (event, newValue) => {
        setSelectedCategory(newValue);
    };

    const filteredAchievements = selectedCategory === 'all' 
        ? achievements 
        : achievements.filter(a => a.category === selectedCategory);

    const categories = [
        { value: 'all', label: t('allCategories') },
        { value: 'beginner', label: t('beginner') },
        { value: 'consistency', label: t('consistency') },
        { value: 'cooking', label: t('cooking') },
        { value: 'nutrition', label: t('nutrition') },
        { value: 'health', label: t('health') },
        { value: 'control', label: t('control') },
        { value: 'mastery', label: t('mastery') },
        { value: 'lifestyle', label: t('lifestyle') }
    ];

    return (
        <Box sx={{ 
            p: 3,
            height: '100vh',
            overflowY: 'auto',
            position: 'relative',
            '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
            },
            '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                    background: '#555',
                },
            },
            '&::-webkit-scrollbar-corner': {
                background: '#f1f1f1',
            }
        }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {t('achievements')}
                </Typography>
            </motion.div>

            {/* Статистика достижений */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title={t('totalAchievements')}
                        value={stats.totalAchievements}
                        icon={<EmojiEventsIcon sx={{ color: theme.palette.primary.main }} />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title={t('completedAchievements')}
                        value={stats.completedAchievements}
                        icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title={t('completionRate')}
                        value={`${stats.completionRate}%`}
                        icon={<TrendingUpIcon sx={{ color: theme.palette.info.main }} />}
                        color="info"
                    />
                </Grid>
            </Grid>

            {/* Категории */}
            <Box sx={{ mb: 4 }}>
                <Tabs
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': {
                            minWidth: 'auto',
                            px: 2,
                            py: 1,
                            mx: 0.5,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.primary.main,
                            },
                            '&.Mui-selected': {
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                            }
                        }
                    }}
                >
                    {categories.map((category) => (
                        <Tab
                            key={category.value}
                            value={category.value}
                            label={category.label}
                        />
                    ))}
                </Tabs>
            </Box>

            {/* Список достижений */}
            <Grid container spacing={3} ref={achievementsRef}>
                <AnimatePresence>
                    {filteredAchievements.map((achievement) => (
                        <Grid item key={achievement.id} xs={12} sm={6} md={4}>
                            <AchievementCard
                                {...achievement}
                                onCardClick={() => {
                                    setSelectedAchievement(achievement);
                                    setOpenDialog(true);
                                }}
                            />
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>

            {/* Диалог достижения */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}15)`,
                        border: `2px solid ${theme.palette.primary.main}`,
                        borderRadius: 2
                    }
                }}
            >
                {selectedAchievement && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <EmojiEventsIcon sx={{ mr: 1, color: 'primary.main', fontSize: 40 }} />
                                </motion.div>
                                <Typography variant="h5" sx={{ color: 'primary.main' }}>
                                    {selectedAchievement.title}
                                </Typography>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5, repeat: 2 }}
                                >
                                    <Box sx={{ fontSize: 80, color: 'primary.main', mb: 2 }}>
                                        {selectedAchievement.icon}
                                    </Box>
                                </motion.div>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    {selectedAchievement.description}
                                </Typography>
                                {selectedAchievement.reward && (
                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                                        <Typography variant="subtitle1" color="primary.main">
                                            {t('Reward')}:
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedAchievement.reward}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>

            {/* Кнопка прокрутки вверх */}
            {showScrollTop && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                >
                    <Fab
                        color="primary"
                        aria-label="scroll to top"
                        onClick={scrollToTop}
                        sx={{
                            position: 'fixed',
                            bottom: 16,
                            right: 16,
                            zIndex: 1000
                        }}
                    >
                        <KeyboardArrowUpIcon />
                    </Fab>
                </motion.div>
            )}
        </Box>
    );
};

export default Achievements; 