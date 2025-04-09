import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useMealPlan } from '../context/MealPlanContext';
import { updateProfileData } from '../services/profileService';
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
    IconButton,
    Snackbar,
    Alert,
    CircularProgress,
    Divider,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ScrollableContainer = styled(Box)(({ theme }) => ({
    height: '100%',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: theme.palette.primary.main,
        borderRadius: '4px',
        '&:hover': {
            background: theme.palette.primary.dark,
        },
    },
}));

const Profile = () => {
    const theme = useTheme();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { mealPlan, isLoading: isMealPlanLoading, generateMealPlan } = useMealPlan();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({
        name: '',
        email: '',
        age: '',
        gender: '',
        weight: '',
        height: '',
        activityLevel: 'moderate',
        dietaryPreferences: [],
        healthGoals: [],
        allergies: [],
        targetCalories: 2000,
        targetProtein: 150,
        targetCarbs: 250,
        targetFat: 70
    });
    const [isLoading, setIsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [achievements, setAchievements] = useState([]);
    const [completedAchievements, setCompletedAchievements] = useState([]);
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [showAchievementDialog, setShowAchievementDialog] = useState(false);
    const profileRef = useRef(null);

    // Handle navigation state
    useEffect(() => {
        // Reset scroll position when navigating to profile
        window.scrollTo(0, 0);
        
        // Reset editing state when navigating away
        return () => {
            setIsEditing(false);
            setEditedProfile({
                name: '',
                email: '',
                age: '',
                gender: '',
                weight: '',
                height: '',
                activityLevel: 'moderate',
                dietaryPreferences: [],
                healthGoals: [],
                allergies: [],
                targetCalories: 2000,
                targetProtein: 150,
                targetCarbs: 250,
                targetFat: 70
            });
        };
    }, [location]);

    // Обработчик скролла
    useEffect(() => {
        const handleScroll = () => {
            if (profileRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = profileRef.current;
                const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
                
                // Анимация при прокрутке
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
    }, []);

    // Инициализация профиля
    useEffect(() => {
        if (user) {
            setEditedProfile({
                name: user.name || '',
                email: user.email || '',
                age: user.age || '',
                gender: user.gender || '',
                weight: user.weight || '',
                height: user.height || '',
                activityLevel: user.activityLevel || 'moderate',
                dietaryPreferences: user.dietaryPreferences || [],
                healthGoals: user.healthGoals || [],
                allergies: user.allergies || [],
                targetCalories: user.targetCalories || 2000,
                targetProtein: user.targetProtein || 150,
                targetCarbs: user.targetCarbs || 250,
                targetFat: user.targetFat || 70
            });
        }
    }, [user]);

    // Инициализация достижений
    useEffect(() => {
        const initialAchievements = [
            {
                id: 'first_meal_plan',
                title: t('First Meal Plan'),
                description: t('Congratulations! You have generated your first meal plan. Keep going!'),
                icon: <RestaurantMenuIcon />,
                completed: false,
                progress: 0,
                total: 1,
                reward: t('Unlocked meal plan customization features'),
                animation: 'tada'
            },
            {
                id: 'profile_complete',
                title: t('Complete Profile'),
                description: t('Fill in all your profile information'),
                icon: <EditIcon />,
                completed: false,
                progress: 0,
                total: 1
            },
            {
                id: 'meal_plans_5',
                title: t('5 Meal Plans'),
                description: t('Generate 5 meal plans'),
                icon: <RestaurantMenuIcon />,
                completed: false,
                progress: 0,
                total: 5
            },
            {
                id: 'weight_goal',
                title: t('Weight Goal'),
                description: t('Reach your target weight'),
                icon: <FitnessCenterIcon />,
                completed: false,
                progress: 0,
                total: 1
            }
        ];
        setAchievements(initialAchievements);
    }, [t]);

    // Проверка достижений
    useEffect(() => {
        if (user) {
            const newAchievements = [...achievements];
            const newCompleted = [];

            // Проверка первого плана питания
            if (mealPlan && mealPlan.length > 0) {
                const firstMealPlan = newAchievements.find(a => a.id === 'first_meal_plan');
                if (firstMealPlan && !firstMealPlan.completed) {
                    firstMealPlan.completed = true;
                    firstMealPlan.progress = 1;
                    newCompleted.push(firstMealPlan);
                    
                    // Показываем специальное уведомление для первого плана
                    setSnackbar({
                        open: true,
                        message: t('Congratulations! You have unlocked your first achievement!'),
                        severity: 'success'
                    });
                }
            }

            // Проверка заполненности профиля
            const profileComplete = newAchievements.find(a => a.id === 'profile_complete');
            if (profileComplete && !profileComplete.completed) {
                const isProfileComplete = user.name && user.email && user.age && user.weight && user.height;
                if (isProfileComplete) {
                    profileComplete.completed = true;
                    profileComplete.progress = 1;
                    newCompleted.push(profileComplete);
                }
            }

            // Проверка 5 планов питания
            const mealPlans5 = newAchievements.find(a => a.id === 'meal_plans_5');
            if (mealPlans5 && !mealPlans5.completed) {
                const planCount = localStorage.getItem('mealPlanCount') || 0;
                mealPlans5.progress = parseInt(planCount);
                if (parseInt(planCount) >= 5) {
                    mealPlans5.completed = true;
                    newCompleted.push(mealPlans5);
                }
            }

            // Проверка достижения целевого веса
            const weightGoal = newAchievements.find(a => a.id === 'weight_goal');
            if (weightGoal && !weightGoal.completed) {
                const targetWeight = user.targetWeight;
                const currentWeight = user.weight;
                if (targetWeight && currentWeight && Math.abs(targetWeight - currentWeight) <= 1) {
                    weightGoal.completed = true;
                    weightGoal.progress = 1;
                    newCompleted.push(weightGoal);
                }
            }

            setAchievements(newAchievements);
            if (newCompleted.length > 0) {
                setCompletedAchievements(newCompleted);
                setSelectedAchievement(newCompleted[0]);
                setShowAchievementDialog(true);
            }
        }
    }, [user, mealPlan, achievements]);

    // Обработка сохранения профиля
    const handleSave = async () => {
        try {
            setIsLoading(true);
            const updatedUserData = await updateProfileData(user, editedProfile);
            
            // Обновляем состояние редактирования
            setIsEditing(false);
            
            // Показываем уведомление об успехе
            setSnackbar({
                open: true,
                message: t('Profile updated successfully'),
                severity: 'success'
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            setSnackbar({
                open: true,
                message: t('Error updating profile'),
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Обработка закрытия диалога достижения
    const handleAchievementDialogClose = () => {
        setShowAchievementDialog(false);
        setSelectedAchievement(null);
    };

    // Анимации
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    };

    return (
        <ScrollableContainer ref={profileRef}>
            <Box sx={{ p: 3 }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h4" gutterBottom>
                        {t('Profile')}
                    </Typography>
                </motion.div>

                <Grid container spacing={3} ref={profileRef}>
                    {/* Основная информация */}
                    <Grid item xs={12} md={4}>
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.5 }}
                        >
                            <Card
                                elevation={3}
                                sx={{
                                    height: '100%',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}15)`,
                                    border: `1px solid ${theme.palette.primary.light}30`,
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)'
                                    }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                bgcolor: theme.palette.primary.main,
                                                fontSize: '2rem',
                                                marginRight: 2
                                            }}
                                        >
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" gutterBottom>
                                                {user?.name || t('User')}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {user?.email || t('No email provided')}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            {t('Member since')}
                                        </Typography>
                                        <Typography variant="body2">
                                            {new Date(user?.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            {t('Last login')}
                                        </Typography>
                                        <Typography variant="body2">
                                            {new Date(user?.lastLogin).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Цели и предпочтения */}
                    <Grid item xs={12} md={8}>
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card
                                elevation={3}
                                sx={{
                                    height: '100%',
                                    background: `linear-gradient(135deg, ${theme.palette.secondary.light}15, ${theme.palette.secondary.main}15)`,
                                    border: `1px solid ${theme.palette.secondary.light}30`,
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)'
                                    }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6">
                                            {t('Goals & Preferences')}
                                        </Typography>
                                        <motion.div
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            <IconButton
                                                onClick={() => setIsEditing(!isEditing)}
                                                color={isEditing ? 'primary' : 'default'}
                                            >
                                                {isEditing ? <SaveIcon /> : <EditIcon />}
                                            </IconButton>
                                        </motion.div>
                                    </Box>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>{t('Activity Level')}</InputLabel>
                                                <Select
                                                    value={editedProfile?.activityLevel || ''}
                                                    onChange={(e) => setEditedProfile(prev => ({ ...prev, activityLevel: e.target.value }))}
                                                    disabled={!isEditing}
                                                >
                                                    <MenuItem value="sedentary">{t('Sedentary')}</MenuItem>
                                                    <MenuItem value="light">{t('Light')}</MenuItem>
                                                    <MenuItem value="moderate">{t('Moderate')}</MenuItem>
                                                    <MenuItem value="active">{t('Active')}</MenuItem>
                                                    <MenuItem value="very_active">{t('Very Active')}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>{t('Dietary Preferences')}</InputLabel>
                                                <Select
                                                    multiple
                                                    value={editedProfile?.dietaryPreferences || []}
                                                    onChange={(e) => setEditedProfile(prev => ({ ...prev, dietaryPreferences: e.target.value }))}
                                                    disabled={!isEditing}
                                                >
                                                    <MenuItem value="vegetarian">{t('Vegetarian')}</MenuItem>
                                                    <MenuItem value="vegan">{t('Vegan')}</MenuItem>
                                                    <MenuItem value="keto">{t('Keto')}</MenuItem>
                                                    <MenuItem value="paleo">{t('Paleo')}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <InputLabel>{t('Health Goals')}</InputLabel>
                                                <Select
                                                    multiple
                                                    value={editedProfile?.healthGoals || []}
                                                    onChange={(e) => setEditedProfile(prev => ({ ...prev, healthGoals: e.target.value }))}
                                                    disabled={!isEditing}
                                                >
                                                    <MenuItem value="weight_loss">{t('Weight Loss')}</MenuItem>
                                                    <MenuItem value="muscle_gain">{t('Muscle Gain')}</MenuItem>
                                                    <MenuItem value="maintenance">{t('Maintenance')}</MenuItem>
                                                    <MenuItem value="energy">{t('Energy')}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    {isEditing && (
                                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                            <motion.div
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                            >
                                                <Button
                                                    variant="contained"
                                                    startIcon={<SaveIcon />}
                                                    onClick={handleSave}
                                                >
                                                    {t('Save Changes')}
                                                </Button>
                                            </motion.div>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Физические параметры */}
                    <Grid item xs={12} md={6}>
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Card
                                elevation={3}
                                sx={{
                                    height: '100%',
                                    background: `linear-gradient(135deg, ${theme.palette.success.light}15, ${theme.palette.success.main}15)`,
                                    border: `1px solid ${theme.palette.success.light}30`,
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)'
                                    }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <FitnessCenterIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                                        <Typography variant="h6">
                                            {t('Physical Parameters')}
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label={t('Age')}
                                                type="number"
                                                value={editedProfile?.age || ''}
                                                onChange={(e) => setEditedProfile(prev => ({ ...prev, age: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>{t('Gender')}</InputLabel>
                                                <Select
                                                    value={editedProfile?.gender || ''}
                                                    onChange={(e) => setEditedProfile(prev => ({ ...prev, gender: e.target.value }))}
                                                    disabled={!isEditing}
                                                >
                                                    <MenuItem value="male">{t('Male')}</MenuItem>
                                                    <MenuItem value="female">{t('Female')}</MenuItem>
                                                    <MenuItem value="other">{t('Other')}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label={t('Weight (kg)')}
                                                type="number"
                                                value={editedProfile?.weight || ''}
                                                onChange={(e) => setEditedProfile(prev => ({ ...prev, weight: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label={t('Height (cm)')}
                                                type="number"
                                                value={editedProfile?.height || ''}
                                                onChange={(e) => setEditedProfile(prev => ({ ...prev, height: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Целевые показатели питания */}
                    <Grid item xs={12} md={6}>
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Card
                                elevation={3}
                                sx={{
                                    height: '100%',
                                    background: `linear-gradient(135deg, ${theme.palette.info.light}15, ${theme.palette.info.main}15)`,
                                    border: `1px solid ${theme.palette.info.light}30`,
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)'
                                    }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <RestaurantIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                                        <Typography variant="h6">
                                            {t('Nutrition Targets')}
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label={t('Target Calories')}
                                                type="number"
                                                value={editedProfile?.targetCalories || ''}
                                                onChange={(e) => setEditedProfile(prev => ({ ...prev, targetCalories: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label={t('Protein (g)')}
                                                type="number"
                                                value={editedProfile?.targetProtein || ''}
                                                onChange={(e) => setEditedProfile(prev => ({ ...prev, targetProtein: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label={t('Carbs (g)')}
                                                type="number"
                                                value={editedProfile?.targetCarbs || ''}
                                                onChange={(e) => setEditedProfile(prev => ({ ...prev, targetCarbs: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label={t('Fat (g)')}
                                                type="number"
                                                value={editedProfile?.targetFat || ''}
                                                onChange={(e) => setEditedProfile(prev => ({ ...prev, targetFat: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>
                                    </Grid>

                                    {isEditing && (
                                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                            <motion.div
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                            >
                                                <Button
                                                    variant="contained"
                                                    startIcon={<SaveIcon />}
                                                    onClick={handleSave}
                                                >
                                                    {t('Save Changes')}
                                                </Button>
                                            </motion.div>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Кнопка генерации плана питания */}
                    <Grid item xs={12}>
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <Card
                                elevation={3}
                                sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.warning.light}15, ${theme.palette.warning.main}15)`,
                                    border: `1px solid ${theme.palette.warning.light}30`,
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)'
                                    }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <RestaurantMenuIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                                        <Typography variant="h6">
                                            {t('Generate Meal Plan')}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <motion.div
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                startIcon={isMealPlanLoading ? <CircularProgress size={20} /> : <RestaurantMenuIcon />}
                                                onClick={generateMealPlan}
                                                disabled={isMealPlanLoading}
                                            >
                                                {isMealPlanLoading ? t('Generating...') : t('Generate New Plan')}
                                            </Button>
                                        </motion.div>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Достижения */}
                    <Grid item xs={12}>
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <Card
                                elevation={3}
                                sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}15)`,
                                    border: `1px solid ${theme.palette.primary.light}30`,
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)'
                                    }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <EmojiEventsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                                        <Typography variant="h6">
                                            {t('Achievements')}
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={2}>
                                        {achievements.map((achievement) => (
                                            <Grid item xs={12} sm={6} md={3} key={achievement.id}>
                                                <Tooltip title={achievement.description}>
                                                    <Card
                                                        sx={{
                                                            height: '100%',
                                                            background: achievement.completed
                                                                ? `linear-gradient(135deg, ${theme.palette.success.light}15, ${theme.palette.success.main}15)`
                                                                : `linear-gradient(135deg, ${theme.palette.grey[300]}15, ${theme.palette.grey[400]}15)`,
                                                            border: `1px solid ${achievement.completed ? theme.palette.success.light : theme.palette.grey[300]}30`,
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        <CardContent>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                {achievement.icon}
                                                                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                                                    {achievement.title}
                                                                </Typography>
                                                            </Box>
                                                            {achievement.completed ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                                                                    <CheckCircleIcon sx={{ mr: 1 }} />
                                                                    <Typography variant="body2">
                                                                        {t('Completed')}
                                                                    </Typography>
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Typography variant="body2">
                                                                        {t('Progress')}: {achievement.progress}/{achievement.total}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Tooltip>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>

            {/* Диалог достижения */}
            <Dialog
                open={showAchievementDialog}
                onClose={handleAchievementDialogClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: `linear-gradient(135deg, ${theme.palette.success.light}15, ${theme.palette.success.main}15)`,
                        border: `2px solid ${theme.palette.success.main}`,
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <EmojiEventsIcon sx={{ mr: 1, color: 'success.main', fontSize: 40 }} />
                        <Typography variant="h5" sx={{ color: 'success.main' }}>
                            {t('Achievement Unlocked!')}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedAchievement && (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.5, repeat: 2 }}
                            >
                                <Box sx={{ fontSize: 80, color: 'success.main', mb: 2 }}>
                                    {selectedAchievement.icon}
                                </Box>
                            </motion.div>
                            <Typography variant="h4" gutterBottom>
                                {selectedAchievement.title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {selectedAchievement.description}
                            </Typography>
                            {selectedAchievement.reward && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                                    <Typography variant="subtitle1" color="success.main">
                                        {t('Reward')}:
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedAchievement.reward}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleAchievementDialogClose}
                        sx={{ minWidth: 120 }}
                    >
                        {t('Awesome!')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Уведомления */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </ScrollableContainer>
    );
};

export default Profile;