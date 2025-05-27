import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useMealPlan } from '../context/MealPlanContext';
import { useAchievements } from '../context/AchievementsContext';
import { updateProfileData } from '../services/profileService.jsx';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Snackbar,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Container,
    Switch,
    FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const ScrollableContainer = styled(Box)(({ theme }) => ({
    height: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden',
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
    '&::-webkit-scrollbar-corner': {
        background: 'transparent',
    },
    // Для Firefox
    scrollbarWidth: 'thin',
    scrollbarColor: '#ff6b35 rgba(26, 26, 26, 0.8)',
}));

// Общие стили для полей
const fieldStyles = {
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: { xs: 2, sm: 3 },
        transition: 'all 0.3s ease',
        fontSize: { xs: '0.9rem', sm: '1rem' },
        '& fieldset': {
            borderColor: 'rgba(255, 107, 53, 0.3)',
            borderWidth: { xs: 1.5, sm: 2 }
        },
        '&:hover fieldset': {
            borderColor: '#ff6b35',
            boxShadow: '0 0 10px rgba(255, 107, 53, 0.3)'
        },
        '&.Mui-focused fieldset': {
            borderColor: '#ff8c42',
            boxShadow: '0 0 20px rgba(255, 140, 66, 0.4)'
        }
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: { xs: '0.9rem', sm: '1rem' },
        '&.Mui-focused': {
            color: '#ff8c42'
        },
        '&.MuiInputLabel-shrink': {
            fontSize: { xs: '0.8rem', sm: '0.9rem' }
        }
    },
    '& .MuiOutlinedInput-input': {
        color: 'white',
        fontWeight: 500,
        fontSize: { xs: '0.9rem', sm: '1rem' },
        padding: { xs: '12px 14px', sm: '16.5px 14px' }
    },
    '& .MuiSelect-select': {
        color: 'white',
        fontWeight: 500,
        fontSize: { xs: '0.9rem', sm: '1rem' },
        padding: { xs: '12px 14px', sm: '16.5px 14px' }
    },
    '& .MuiSvgIcon-root': {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: { xs: '1.2rem', sm: '1.5rem' }
    }
};

const Profile = () => {
    const theme = useTheme();
    const { t } = useLanguage();
    const { user, updateUserProfile } = useAuth();
    const { mealPlan } = useMealPlan();
    const { achievements, stats, loading: achievementsLoading } = useAchievements();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);
    const profileRef = useRef(null);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        age: '',
        gender: '',
        weight: '',
        height: '',
        dietType: '',
        calorieTarget: '',
        activityLevel: '',
        updatedAt: new Date().toISOString()
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mountedRef, setMountedRef] = useState(true);

    // Snackbar состояние
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const getUserProfile = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setProfileData(userDoc.data());
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.uid) {
            getUserProfile();
        }
    }, [user?.uid]); // Зависимость только от user.uid

    useEffect(() => {
        if (location.pathname === '/profile') {
            window.scrollTo(0, 0);
            setIsEditing(false);
        }
    }, [location.pathname]); // Зависимость только от pathname

    // Handle scroll
    useEffect(() => {
        if (!mountedRef) return;

        const handleScroll = () => {
            if (profileRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = profileRef.current;
                const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

                if (scrollPercentage > 20) {
                    profileRef.current.style.transform = `translateY(${scrollPercentage * 0.1}px)`;
                }
            }
        };

        const currentRef = profileRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [mountedRef]);

    // Достижения теперь управляются через AchievementsContext

    // Функция расчета макронутриентов для всех диет
    const calculateDietMacros = (dietType, weight, calories = 2000) => {
        const baseProtein = weight * 1.8; // Базовое количество белка

        switch (dietType) {
            case 'cutting': // Сушка
                return {
                    targetProtein: weight * 2, // 2г на кг веса
                    targetFat: weight * 1, // 1г на кг веса
                    targetCarbs: weight * 1.5 // 1.5г на кг веса
                };

            case 'bulking': // Массонабор
                return {
                    targetProtein: weight * 2.2, // 2.2г на кг веса для роста мышц
                    targetFat: weight * 1.2, // 1.2г на кг веса для гормонального баланса
                    targetCarbs: weight * 6 // 6г на кг веса для энергии и восстановления
                };

            case 'keto': // Кето диета
                return {
                    targetProtein: Math.round(baseProtein), // 1.8г на кг веса
                    targetFat: Math.round(calories * 0.75 / 9), // 75% калорий из жиров
                    targetCarbs: 20 // Максимум 20г углеводов в день
                };

            case 'paleo': // Палео диета
                return {
                    targetProtein: Math.round(baseProtein), // 1.8г на кг веса
                    targetFat: Math.round(calories * 0.35 / 9), // 35% калорий из жиров
                    targetCarbs: Math.round(calories * 0.35 / 4) // 35% калорий из углеводов
                };

            case 'lowCarb': // Низкоуглеводная
                return {
                    targetProtein: Math.round(baseProtein), // 1.8г на кг веса
                    targetFat: Math.round(calories * 0.45 / 9), // 45% калорий из жиров
                    targetCarbs: Math.round(calories * 0.25 / 4) // 25% калорий из углеводов
                };

            case 'mediterranean': // Средиземноморская
                return {
                    targetProtein: Math.round(baseProtein), // 1.8г на кг веса
                    targetFat: Math.round(calories * 0.35 / 9), // 35% калорий из жиров
                    targetCarbs: Math.round(calories * 0.45 / 4) // 45% калорий из углеводов
                };

            case 'vegetarian': // Вегетарианская
                return {
                    targetProtein: Math.round(baseProtein * 1.1), // 2г на кг веса
                    targetFat: Math.round(calories * 0.30 / 9), // 30% калорий из жиров
                    targetCarbs: Math.round(calories * 0.50 / 4) // 50% калорий из углеводов
                };

            case 'vegan': // Веганская
                return {
                    targetProtein: Math.round(baseProtein * 1.2), // 2.2г на кг веса
                    targetFat: Math.round(calories * 0.30 / 9), // 30% калорий из жиров
                    targetCarbs: Math.round(calories * 0.50 / 4) // 50% калорий из углеводов
                };

            case 'balanced': // Сбалансированная
            default:
                return {
                    targetProtein: Math.round(baseProtein), // 1.8г на кг веса
                    targetFat: Math.round(calories * 0.30 / 9), // 30% калорий из жиров
                    targetCarbs: Math.round(calories * 0.50 / 4) // 50% калорий из углеводов
                };
        }
    };

    // Обработчик изменения типа диеты
    const handleDietTypeChange = (e) => {
        const newDietType = e.target.value;
        const updatedData = { ...profileData, dietType: newDietType };

        // Автоматически рассчитываем макронутриенты для любой диеты, если есть вес
        if (profileData.weight) {
            const calories = profileData.calorieTarget || 2000;
            const macros = calculateDietMacros(newDietType, Number(profileData.weight), Number(calories));
            updatedData.targetProtein = macros.targetProtein;
            updatedData.targetFat = macros.targetFat;
            updatedData.targetCarbs = macros.targetCarbs;
        }

        setProfileData(updatedData);
    };

    const validateProfile = (data) => {
        const errors = {};

        // Проверяем обязательные поля для плана питания
        const requiredFields = ['age', 'weight', 'height', 'calorieTarget', 'gender', 'activityLevel', 'dietType'];
        requiredFields.forEach(field => {
            if (!data[field]) {
                errors[field] = t('This field is required');
            }
        });

        // Проверяем числовые поля
        const numericFields = ['age', 'weight', 'height', 'calorieTarget'];
        numericFields.forEach(field => {
            if (data[field] && isNaN(Number(data[field]))) {
                errors[field] = t('This field must be a number');
            }
        });

        // Дополнительные проверки
        if (data.age && (Number(data.age) < 16 || Number(data.age) > 100)) {
            errors.age = t('Age must be between 16 and 100');
        }

        if (data.weight && (Number(data.weight) < 30 || Number(data.weight) > 300)) {
            errors.weight = t('Weight must be between 30 and 300 kg');
        }

        if (data.height && (Number(data.height) < 100 || Number(data.height) > 250)) {
            errors.height = t('Height must be between 100 and 250 cm');
        }

        return Object.keys(errors).length > 0 ? errors : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Проверяем валидность данных
        const validationErrors = validateProfile(profileData);
        if (validationErrors) {
            setError('Пожалуйста, исправьте ошибки в форме');
            setValidationErrors(validationErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            setValidationErrors({});

            // Подготавливаем данные для сохранения
            const dataToSave = {
                ...profileData,
                age: Number(profileData.age),
                weight: Number(profileData.weight),
                height: Number(profileData.height),
                calorieTarget: Number(profileData.calorieTarget),
                targetProtein: Number(profileData.targetProtein) || 0,
                targetCarbs: Number(profileData.targetCarbs) || 0,
                targetFat: Number(profileData.targetFat) || 0,
                updatedAt: new Date().toISOString()
            };

            // Сохраняем данные
            await updateProfileData(user.uid, dataToSave);
            const updatedProfile = dataToSave;

            // Обновляем локальное состояние
            setProfileData(updatedProfile);

            // Обновляем контекст пользователя
            if (updateUserProfile) {
                await updateUserProfile(updatedProfile);
            }

            setIsEditing(false);
            setSuccess(true);

            // Показываем уведомление об успехе
            setSnackbar({
                open: true,
                message: t('Profile updated successfully'),
                severity: 'success'
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message || t('Error updating profile'));
            setSnackbar({
                open: true,
                message: t('Error updating profile'),
                severity: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollableContainer ref={profileRef}>
            <Box
                className="scroll-container"
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1810 25%, #4a2c17 50%, #ff6b35 75%, #ff8c42 100%)',
                    position: 'relative',
                    py: { xs: 1, sm: 3, md: 4 },
                    px: { xs: 1, sm: 2 },
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
                    maxWidth="md"
                    sx={{
                        px: { xs: 1, sm: 2, md: 3 },
                        width: '100%',
                        minHeight: '150vh', // Увеличиваем минимальную высоту для демонстрации скролла
                        pb: 4 // Добавляем отступ снизу
                    }}
                >
                    {/* Header */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            duration: 0.6,
                            ease: "easeOut"
                        }}
                    >
                        <Box sx={{
                            textAlign: 'center',
                            mb: { xs: 3, sm: 4, md: 6 },
                            position: 'relative',
                            zIndex: 1,
                            px: { xs: 1, sm: 2 }
                        }}>
                            <motion.div
                                animate={{
                                    textShadow: [
                                        '0 0 20px rgba(255, 107, 53, 0.5)',
                                        '0 0 30px rgba(255, 140, 66, 0.6)',
                                        '0 0 20px rgba(255, 107, 53, 0.5)'
                                    ]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    repeatType: "reverse"
                                }}
                            >
                                <Typography
                                    variant="h2"
                                    sx={{
                                        background: 'linear-gradient(45deg, #ff6b35, #ff8c42, #ffa726)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 900,
                                        mb: 2,
                                        textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                        fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem', lg: '3.5rem' },
                                        lineHeight: { xs: 1.2, md: 1.1 }
                                    }}
                                >
                                    🔥 {t('Nutrition Profile')}
                                </Typography>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.95)',
                                        fontWeight: 400,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                        fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.3rem', lg: '1.5rem' },
                                        px: { xs: 2, sm: 0 },
                                        lineHeight: { xs: 1.4, md: 1.3 }
                                    }}
                                >
                                    ✨ {t('Tell us about yourself to create the perfect meal plan')}
                                </Typography>
                            </motion.div>
                        </Box>
                    </motion.div>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: 'white' }} size={60} />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                    ) : (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                duration: 0.6,
                                delay: 0.2,
                                ease: "easeOut"
                            }}
                        >
                            <Card sx={{
                                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 50%, rgba(74, 44, 23, 0.95) 100%)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: 6,
                                boxShadow: `
                                    0 25px 50px rgba(0,0,0,0.3),
                                    0 0 0 1px rgba(255, 107, 53, 0.2),
                                    inset 0 1px 0 rgba(255, 140, 66, 0.1)
                                `,
                                border: '2px solid rgba(255, 107, 53, 0.3)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
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
                                '@keyframes shimmer': {
                                    '0%': { left: '-100%' },
                                    '100%': { left: '100%' }
                                }
                            }}>
                                <CardContent sx={{
                                    p: { xs: 2, sm: 3, md: 4 },
                                    '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } }
                                }}>
                                    <form onSubmit={handleSubmit}>
                                        {/* Основные параметры */}
                                        <Box sx={{ mb: 4 }}>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4, duration: 0.4 }}
                                            >
                                                <Typography
                                                    variant="h4"
                                                    sx={{
                                                        mb: { xs: 2, sm: 3, md: 4 },
                                                        fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' },
                                                        background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        fontWeight: 800,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        position: 'relative',
                                                        zIndex: 2,
                                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                        '&::after': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            bottom: -8,
                                                            left: 0,
                                                            width: '60px',
                                                            height: '4px',
                                                            background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                                            borderRadius: '2px',
                                                            animation: 'glow 2s ease-in-out infinite alternate'
                                                        },
                                                        '@keyframes glow': {
                                                            '0%': { boxShadow: '0 0 5px rgba(255, 107, 53, 0.5)' },
                                                            '100%': { boxShadow: '0 0 20px rgba(255, 140, 66, 0.8)' }
                                                        }
                                                    }}
                                                >
                                                    📊 {t('basicInformation')}
                                                </Typography>
                                            </motion.div>
                                            <Grid container spacing={{ xs: 2, sm: 3 }}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        label={t('age')}
                                                        value={profileData.age}
                                                        onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                                                        fullWidth
                                                        disabled={!isEditing}
                                                        error={!!validationErrors.age}
                                                        helperText={validationErrors.age}
                                                        InputProps={{
                                                            startAdornment: <Typography sx={{ mr: 1 }}>🎂</Typography>,
                                                            sx: { borderRadius: 2 }
                                                        }}
                                                        sx={fieldStyles}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        label={t('weight')}
                                                        value={profileData.weight}
                                                        onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                                                        fullWidth
                                                        disabled={!isEditing}
                                                        error={!!validationErrors.weight}
                                                        helperText={validationErrors.weight}
                                                        InputProps={{
                                                            startAdornment: <Typography sx={{ mr: 1 }}>⚖️</Typography>,
                                                            sx: { borderRadius: 2 }
                                                        }}
                                                        sx={fieldStyles}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        label={t('height')}
                                                        value={profileData.height}
                                                        onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                                                        fullWidth
                                                        disabled={!isEditing}
                                                        error={!!validationErrors.height}
                                                        helperText={validationErrors.height}
                                                        InputProps={{
                                                            startAdornment: <Typography sx={{ mr: 1 }}>📏</Typography>,
                                                            sx: { borderRadius: 2 }
                                                        }}
                                                        sx={fieldStyles}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        label={t('dailyCalorieTarget')}
                                                        value={profileData.calorieTarget}
                                                        onChange={(e) => setProfileData({ ...profileData, calorieTarget: e.target.value })}
                                                        fullWidth
                                                        disabled={!isEditing}
                                                        error={!!validationErrors.calorieTarget}
                                                        helperText={validationErrors.calorieTarget}
                                                        InputProps={{
                                                            startAdornment: <Typography sx={{ mr: 1 }}>🔥</Typography>,
                                                            sx: { borderRadius: 2 }
                                                        }}
                                                        sx={fieldStyles}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Предпочтения */}
                                        <Box sx={{ mb: 4 }}>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.6, duration: 0.4 }}
                                            >
                                                <Typography
                                                    variant="h4"
                                                    sx={{
                                                        mb: { xs: 2, sm: 3, md: 4 },
                                                        fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' },
                                                        background: 'linear-gradient(45deg, #ff8c42, #ffa726)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        fontWeight: 800,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        position: 'relative',
                                                        zIndex: 2,
                                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                        '&::after': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            bottom: -8,
                                                            left: 0,
                                                            width: '80px',
                                                            height: '4px',
                                                            background: 'linear-gradient(45deg, #ff8c42, #ffa726)',
                                                            borderRadius: '2px',
                                                            animation: 'pulse 2s ease-in-out infinite'
                                                        },
                                                        '@keyframes pulse': {
                                                            '0%, 100%': { opacity: 0.7 },
                                                            '50%': { opacity: 1 }
                                                        }
                                                    }}
                                                >
                                                    🎯 {t('preferences')}
                                                </Typography>
                                            </motion.div>
                                            <Grid container spacing={{ xs: 2, sm: 3 }}>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl
                                                        fullWidth
                                                        disabled={!isEditing}
                                                        error={!!validationErrors.gender}
                                                        sx={fieldStyles}
                                                    >
                                                        <InputLabel>👤 {t('gender')}</InputLabel>
                                                        <Select
                                                            value={profileData.gender || ''}
                                                            onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                                            label={`👤 ${t('gender')}`}
                                                        >
                                                            <MenuItem value="male">👨 {t('male')}</MenuItem>
                                                            <MenuItem value="female">👩 {t('female')}</MenuItem>
                                                            <MenuItem value="other">🧑 {t('other')}</MenuItem>
                                                        </Select>
                                                        {validationErrors.gender && (
                                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                                {validationErrors.gender}
                                                            </Typography>
                                                        )}
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl
                                                        fullWidth
                                                        disabled={!isEditing}
                                                        error={!!validationErrors.activityLevel}
                                                        sx={fieldStyles}
                                                    >
                                                        <InputLabel>🏃 {t('Activity Level')}</InputLabel>
                                                        <Select
                                                            value={profileData.activityLevel || ''}
                                                            onChange={(e) => setProfileData({ ...profileData, activityLevel: e.target.value })}
                                                            label={`🏃 ${t('Activity Level')}`}
                                                        >
                                                            <MenuItem value="sedentary">🛋️ {t('Sedentary')}</MenuItem>
                                                            <MenuItem value="light">🚶 {t('Light Activity')}</MenuItem>
                                                            <MenuItem value="moderate">🏃 {t('Moderate Activity')}</MenuItem>
                                                            <MenuItem value="active">💪 {t('Active')}</MenuItem>
                                                            <MenuItem value="veryActive">🔥 {t('Very Active')}</MenuItem>
                                                        </Select>
                                                        {validationErrors.activityLevel && (
                                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                                {validationErrors.activityLevel}
                                                            </Typography>
                                                        )}
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <FormControl
                                                        fullWidth
                                                        disabled={!isEditing}
                                                        error={!!validationErrors.dietType}
                                                        sx={fieldStyles}
                                                    >
                                                        <InputLabel>🥗 {t('Diet Type')}</InputLabel>
                                                        <Select
                                                            value={profileData.dietType || ''}
                                                            onChange={handleDietTypeChange}
                                                            label={`🥗 ${t('Diet Type')}`}
                                                        >
                                                            <MenuItem value="balanced">⚖️ {t('Balanced')}</MenuItem>
                                                            <MenuItem value="vegetarian">🥬 {t('Vegetarian')}</MenuItem>
                                                            <MenuItem value="vegan">🌱 {t('Vegan')}</MenuItem>
                                                            <MenuItem value="keto">🥑 {t('Keto')}</MenuItem>
                                                            <MenuItem value="paleo">🥩 {t('Paleo')}</MenuItem>
                                                            <MenuItem value="mediterranean">🫒 {t('Mediterranean')}</MenuItem>
                                                            <MenuItem value="lowCarb">🥦 {t('Low Carb')}</MenuItem>
                                                            <MenuItem value="cutting">🔥 {t('Cutting')}</MenuItem>
                                                            <MenuItem value="bulking">💪 {t('Bulking')}</MenuItem>
                                                            <MenuItem value="lowFat">🐟 {t('Low Fat')}</MenuItem>
                                                        </Select>
                                                        {validationErrors.dietType && (
                                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                                {validationErrors.dietType}
                                                            </Typography>
                                                        )}
                                                    </FormControl>
                                                </Grid>
                                            </Grid>

                                            {/* Показываем макронутриенты для любой выбранной диеты */}
                                            {profileData.dietType && profileData.weight && (
                                                <Box sx={{ mt: 3, p: 3, borderRadius: 2, background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(255, 140, 66, 0.1))', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
                                                    <Typography variant="h6" sx={{ mb: 2, color: '#ff6b35', fontWeight: 'bold' }}>
                                                        {profileData.dietType === 'cutting' ? '🔥' :
                                                         profileData.dietType === 'bulking' ? '💪' :
                                                         profileData.dietType === 'keto' ? '🥑' :
                                                         profileData.dietType === 'paleo' ? '🥩' :
                                                         profileData.dietType === 'vegetarian' ? '🥬' :
                                                         profileData.dietType === 'vegan' ? '🌱' :
                                                         profileData.dietType === 'mediterranean' ? '🫒' :
                                                         profileData.dietType === 'lowCarb' ? '🥦' : '⚖️'} {t(profileData.dietType.charAt(0).toUpperCase() + profileData.dietType.slice(1))} - {t('Macronutrients')}
                                                    </Typography>

                                                    {/* Информация о диете массонабора */}
                                                    {profileData.dietType === 'bulking' && (
                                                        <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                                                                <strong>💪 Массонабор - научно обоснованные формулы:</strong>
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mb: 0.5 }}>
                                                                • <strong>Белки:</strong> 2.2г на кг веса - оптимально для синтеза мышечного белка
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mb: 0.5 }}>
                                                                • <strong>Жиры:</strong> 1.2г на кг веса - для гормонального баланса (тестостерон, IGF-1)
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                                                                • <strong>Углеводы:</strong> 6г на кг веса - для энергии тренировок и восстановления
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {/* Переключатель между автоматическим и ручным расчетом */}
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={profileData.useCustomMacros || false}
                                                                onChange={(e) => setProfileData({ ...profileData, useCustomMacros: e.target.checked })}
                                                                sx={{
                                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                                        color: '#ff6b35',
                                                                    },
                                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                        backgroundColor: '#ff6b35',
                                                                    },
                                                                }}
                                                            />
                                                        }
                                                        label={t('Custom KBJU')}
                                                        sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}
                                                    />

                                                    {profileData.useCustomMacros ? (
                                                        // Ручной ввод КБЖУ
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={3}>
                                                                <TextField
                                                                    fullWidth
                                                                    type="number"
                                                                    label={`🔥 ${t('Calories')}`}
                                                                    value={profileData.customCalories || ''}
                                                                    onChange={(e) => setProfileData({ ...profileData, customCalories: e.target.value })}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            '& fieldset': { borderColor: 'rgba(255, 107, 53, 0.3)' },
                                                                            '&:hover fieldset': { borderColor: '#ff6b35' },
                                                                            '&.Mui-focused fieldset': { borderColor: '#ff6b35' },
                                                                        },
                                                                        '& .MuiInputLabel-root.Mui-focused': { color: '#ff6b35' },
                                                                    }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={3}>
                                                                <TextField
                                                                    fullWidth
                                                                    type="number"
                                                                    label={`💪 ${t('Protein')} (г)`}
                                                                    value={profileData.customProtein || ''}
                                                                    onChange={(e) => setProfileData({ ...profileData, customProtein: e.target.value })}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            '& fieldset': { borderColor: 'rgba(255, 107, 53, 0.3)' },
                                                                            '&:hover fieldset': { borderColor: '#ff6b35' },
                                                                            '&.Mui-focused fieldset': { borderColor: '#ff6b35' },
                                                                        },
                                                                        '& .MuiInputLabel-root.Mui-focused': { color: '#ff6b35' },
                                                                    }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={3}>
                                                                <TextField
                                                                    fullWidth
                                                                    type="number"
                                                                    label={`🥑 ${t('Fat')} (г)`}
                                                                    value={profileData.customFat || ''}
                                                                    onChange={(e) => setProfileData({ ...profileData, customFat: e.target.value })}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            '& fieldset': { borderColor: 'rgba(255, 107, 53, 0.3)' },
                                                                            '&:hover fieldset': { borderColor: '#ff6b35' },
                                                                            '&.Mui-focused fieldset': { borderColor: '#ff6b35' },
                                                                        },
                                                                        '& .MuiInputLabel-root.Mui-focused': { color: '#ff6b35' },
                                                                    }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={3}>
                                                                <TextField
                                                                    fullWidth
                                                                    type="number"
                                                                    label={`🍞 ${t('Carbs')} (г)`}
                                                                    value={profileData.customCarbs || ''}
                                                                    onChange={(e) => setProfileData({ ...profileData, customCarbs: e.target.value })}
                                                                    sx={{
                                                                        '& .MuiOutlinedInput-root': {
                                                                            '& fieldset': { borderColor: 'rgba(255, 107, 53, 0.3)' },
                                                                            '&:hover fieldset': { borderColor: '#ff6b35' },
                                                                            '&.Mui-focused fieldset': { borderColor: '#ff6b35' },
                                                                        },
                                                                        '& .MuiInputLabel-root.Mui-focused': { color: '#ff6b35' },
                                                                    }}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    ) : (
                                                        // Автоматический расчет
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={4}>
                                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                                    💪 {t('Protein')}: <strong>{profileData.targetProtein || calculateDietMacros(profileData.dietType, Number(profileData.weight), Number(profileData.calorieTarget || 2000)).targetProtein}г</strong>
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                                                    {profileData.dietType === 'cutting' ? '(2г на кг веса)' :
                                                                     profileData.dietType === 'bulking' ? '(2.2г на кг веса)' :
                                                                     profileData.dietType === 'vegan' ? '(2.2г на кг веса)' :
                                                                     profileData.dietType === 'vegetarian' ? '(2г на кг веса)' :
                                                                     '(1.8г на кг веса)'}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12} sm={4}>
                                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                                    🥑 {t('Fat')}: <strong>{profileData.targetFat || calculateDietMacros(profileData.dietType, Number(profileData.weight), Number(profileData.calorieTarget || 2000)).targetFat}г</strong>
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                                                    {profileData.dietType === 'keto' ? '(75% калорий)' :
                                                                     profileData.dietType === 'lowCarb' ? '(45% калорий)' :
                                                                     profileData.dietType === 'cutting' ? '(1г на кг веса)' :
                                                                     profileData.dietType === 'bulking' ? '(1.2г на кг веса)' :
                                                                     '(30-35% калорий)'}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12} sm={4}>
                                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                                    🍞 {t('Carbs')}: <strong>{profileData.targetCarbs || calculateDietMacros(profileData.dietType, Number(profileData.weight), Number(profileData.calorieTarget || 2000)).targetCarbs}г</strong>
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                                                    {profileData.dietType === 'keto' ? '(макс. 20г в день)' :
                                                                     profileData.dietType === 'lowCarb' ? '(25% калорий)' :
                                                                     profileData.dietType === 'cutting' ? '(1.5г на кг веса)' :
                                                                     profileData.dietType === 'bulking' ? '(6г на кг веса)' :
                                                                     '(35-50% калорий)'}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                        {/* Кнопки действий */}
                                        <Box sx={{
                                            display: 'flex',
                                            gap: { xs: 1.5, sm: 2 },
                                            justifyContent: 'center',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            alignItems: 'center',
                                            mt: { xs: 3, sm: 4 },
                                            px: { xs: 1, sm: 0 }
                                        }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                disabled={isSubmitting}
                                                sx={{
                                                    background: 'linear-gradient(45deg, #ff6b35 30%, #ff8c42 90%)',
                                                    borderRadius: { xs: 3, sm: 4 },
                                                    px: { xs: 3, sm: 4, md: 5 },
                                                    py: { xs: 1.5, sm: 2 },
                                                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                                    width: { xs: '100%', sm: 'auto' },
                                                    minWidth: { xs: 'auto', sm: '160px' },
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 10px 25px rgba(255, 107, 53, 0.4)',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: '-100%',
                                                        width: '100%',
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                                        transition: 'left 0.5s'
                                                    },
                                                    '&:hover': {
                                                        background: 'linear-gradient(45deg, #e55a2b 30%, #e57a35 90%)',
                                                        transform: { xs: 'translateY(-2px)', sm: 'translateY(-3px) scale(1.05)' },
                                                        boxShadow: '0 15px 35px rgba(255, 107, 53, 0.6)',
                                                        '&::before': {
                                                            left: '100%'
                                                        }
                                                    },
                                                    '&:disabled': {
                                                        background: 'rgba(255, 107, 53, 0.3)',
                                                        transform: 'none',
                                                        boxShadow: 'none'
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                {isSubmitting ? '💾 Saving...' : `💾 ${t('Save Profile')}`}
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                startIcon={<EditIcon />}
                                                onClick={() => setIsEditing(!isEditing)}
                                                sx={{
                                                    borderColor: '#ff6b35',
                                                    color: '#ff6b35',
                                                    borderRadius: { xs: 3, sm: 4 },
                                                    px: { xs: 3, sm: 4, md: 5 },
                                                    py: { xs: 1.5, sm: 2 },
                                                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                                    width: { xs: '100%', sm: 'auto' },
                                                    minWidth: { xs: 'auto', sm: '160px' },
                                                    fontWeight: 'bold',
                                                    borderWidth: 2,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                                        opacity: 0,
                                                        transition: 'opacity 0.3s ease',
                                                        zIndex: -1
                                                    },
                                                    '&:hover': {
                                                        borderColor: '#ff8c42',
                                                        color: 'white',
                                                        transform: { xs: 'translateY(-2px)', sm: 'translateY(-3px) scale(1.05)' },
                                                        boxShadow: '0 10px 25px rgba(255, 107, 53, 0.3)',
                                                        borderWidth: 2,
                                                        '&::before': {
                                                            opacity: 1
                                                        }
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                {isEditing ? `❌ ${t('Cancel')}` : `✏️ ${t('Edit')}`}
                                            </Button>
                                        </Box>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </Container>

                {/* Snackbars */}
                <Snackbar
                    open={success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSuccess(false)}
                        severity="success"
                        sx={{
                            borderRadius: 2,
                            fontWeight: 'bold'
                        }}
                    >
                        ✅ {t('Profile updated successfully')}
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 'bold'
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </ScrollableContainer>
    );
};

export default Profile;
