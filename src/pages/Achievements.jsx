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
    Fab
} from '@mui/material';
import { useMealPlan } from '../context/MealPlanContext';
import { useLanguage } from '../context/LanguageContext';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const AchievementCard = ({ title, description, progress, image, isCompleted, category }) => {
    const { t } = useLanguage();
    const theme = useTheme();
    
    return (
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
            opacity: isCompleted ? 1 : 0.7,
            transition: 'transform 0.3s',
            '&:hover': {
                transform: 'translateY(-5px)'
            }
        }}>
            <CardMedia
                component="img"
                height="140"
                image={image}
                alt={title}
                sx={{ 
                    opacity: isCompleted ? 1 : 0.5,
                    backgroundColor: isCompleted ? theme.palette.primary.light : theme.palette.grey[300],
                    objectFit: 'cover'
                }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="h2">
                        {title}
                    </Typography>
                    {isCompleted ? (
                        <CheckCircleIcon color="success" />
                    ) : (
                        <LockIcon color="disabled" />
                    )}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {description}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    {t(category)}
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: isCompleted ? theme.palette.success.main : theme.palette.primary.main
                            }
                        }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" align="right">
                        {progress}%
                    </Typography>
                </Box>
            </CardContent>
        </Card>
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

        // Простые достижения
        // 1. Первый прием пищи
        if (meals.length > 0) {
            newAchievements.push({
                id: 'first_meal',
                title: t('First Meal'),
                description: t('Add your first meal to the plan'),
                progress: 100,
                image: '/images/achievements/first-meal.jpg',
                isCompleted: true,
                category: 'beginner'
            });
        }

        // 2. Достижение за регулярное питание (базовое)
        const mealCount = weeklyMeals.length;
        newAchievements.push({
            id: 'regular_meals',
            title: t('Regular Meals'),
            description: t('Have at least 3 meals per day for 7 days'),
            progress: Math.min(mealCount / 21, 1) * 100,
            image: '/images/achievements/meal-plan.jpg',
            isCompleted: mealCount >= 21,
            category: 'consistency'
        });

        // 3. Достижение за разнообразие питания (базовое)
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
        // 4. Достижение за сбалансированное питание
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

        // 5. Достижение за здоровые перекусы
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

        // 6. Достижение за соблюдение калорий
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
        // 7. Достижение за месячную последовательность
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

        // 8. Достижение за разнообразие блюд
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

        // 9. Достижение за идеальный баланс
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

        // 10. Достижение за точное соблюдение калорий
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

        // 11. Достижение за раннее питание
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

        // 12. Достижение за позднее питание
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
            achievement.image = `/images/achievements/${achievement.id}.jpg`;
        });

        setAchievements(newAchievements);
    };

    // Проверяем достижения при изменении данных о приемах пищи
    useEffect(() => {
        checkAchievements();
    }, [meals]);

    const stats = {
        totalAchievements: achievements.length,
        completedAchievements: achievements.filter(a => a.isCompleted).length,
        completionRate: Math.round((achievements.filter(a => a.isCompleted).length / achievements.length) * 100) || 0
    };

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
            <Typography variant="h4" gutterBottom>
                {t('achievements')}
            </Typography>

            {/* Статистика достижений */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('totalAchievements')}
                            </Typography>
                            <Typography variant="h3">
                                {stats.totalAchievements}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('completedAchievements')}
                            </Typography>
                            <Typography variant="h3">
                                {stats.completedAchievements}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('completionRate')}
                            </Typography>
                            <Typography variant="h3">
                                {stats.completionRate}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Список достижений */}
            <Grid container spacing={3} ref={achievementsRef}>
                {achievements.map((achievement) => (
                    <Grid item key={achievement.id} xs={12} sm={6} md={4}>
                        <AchievementCard {...achievement} />
                    </Grid>
                ))}
            </Grid>

            {/* Кнопка прокрутки вверх */}
            {showScrollTop && (
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
            )}
        </Box>
    );
};

export default Achievements; 