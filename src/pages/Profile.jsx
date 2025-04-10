import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useMealPlan } from '../context/MealPlanContext';
import { updateProfileData } from '../services/profileService';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

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
    const { user, updateUserProfile } = useAuth();
    const { mealPlan, isLoading: isMealPlanLoading, generateMealPlan } = useMealPlan();
    const location = useLocation();
    const navigate = useNavigate();
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
        dietaryPreferences: [],
        allergies: [],
        healthConditions: [],
        fitnessGoals: [],
        mealPreferences: [],
        favoriteCuisines: [],
        cookingSkillLevel: '',
        timeAvailableForCooking: '',
        budgetForFood: '',
        shoppingFrequency: '',
        kitchenEquipment: [],
        foodStorage: [],
        mealPlanningFrequency: '',
        mealPrepStyle: '',
        portionSizePreference: '',
        snackingHabits: '',
        hydrationGoals: '',
        supplements: [],
        trackingMethod: '',
        socialSharing: false,
        notifications: true,
        language: 'en',
        theme: 'light',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        units: 'metric',
        profilePicture: '',
        bio: '',
        achievements: [],
        challenges: [],
        progress: {},
        settings: {},
        preferences: {},
        history: [],
        favorites: [],
        savedRecipes: [],
        mealPlans: [],
        shoppingLists: [],
        notes: '',
        reminders: [],
        goals: {},
        stats: {},
        socialConnections: [],
        privacySettings: {},
        subscription: {},
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [exportFormat, setExportFormat] = useState('json');
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importError, setImportError] = useState(null);
    const [showThemeDialog, setShowThemeDialog] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('light');
    const [showLanguageDialog, setShowLanguageDialog] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [showUnitsDialog, setShowUnitsDialog] = useState(false);
    const [selectedUnits, setSelectedUnits] = useState('metric');
    const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        email: true,
        push: true,
        mealReminders: true,
        shoppingReminders: true,
        achievementAlerts: true,
        socialUpdates: true
    });
    const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public',
        activityVisibility: 'friends',
        mealPlanVisibility: 'private',
        achievementsVisibility: 'public',
        socialConnectionsVisibility: 'friends'
    });
    const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
    const [subscriptionPlan, setSubscriptionPlan] = useState('free');
    const [showAchievementsDialog, setShowAchievementsDialog] = useState(false);
    const [achievements, setAchievements] = useState([]);
    const [showChallengesDialog, setShowChallengesDialog] = useState(false);
    const [challenges, setChallenges] = useState([]);
    const [showProgressDialog, setShowProgressDialog] = useState(false);
    const [progressData, setProgressData] = useState({});
    const [showStatsDialog, setShowStatsDialog] = useState(false);
    const [statsData, setStatsData] = useState({});
    const [showSocialDialog, setShowSocialDialog] = useState(false);
    const [socialConnections, setSocialConnections] = useState([]);
    const [showNotesDialog, setShowNotesDialog] = useState(false);
    const [notes, setNotes] = useState('');
    const [showRemindersDialog, setShowRemindersDialog] = useState(false);
    const [reminders, setReminders] = useState([]);
    const [showGoalsDialog, setShowGoalsDialog] = useState(false);
    const [goals, setGoals] = useState({});
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [history, setHistory] = useState([]);
    const [showFavoritesDialog, setShowFavoritesDialog] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [showSavedRecipesDialog, setShowSavedRecipesDialog] = useState(false);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [showMealPlansDialog, setShowMealPlansDialog] = useState(false);
    const [mealPlans, setMealPlans] = useState([]);
    const [showShoppingListsDialog, setShowShoppingListsDialog] = useState(false);
    const [shoppingLists, setShoppingLists] = useState([]);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [settings, setSettings] = useState({});
    const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
    const [preferences, setPreferences] = useState({});
    const [mountedRef, setMountedRef] = useState(true);

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
        setMountedRef(true);
        getUserProfile();

        // Store the cleanup function
        const cleanup = navigate((location) => {
            if (!mountedRef) return;
            setIsEditing(false);
            setProfileData(prev => ({ ...prev }));
        });

        return () => {
            setMountedRef(false);
            if (typeof cleanup === 'function') {
                cleanup();
            }
        };
    }, [user, navigate, mountedRef]);

    // Remove the duplicate useEffect for navigation
    useEffect(() => {
        if (!mountedRef) return;

        const handleNavigation = () => {
            if (location.pathname === '/profile') {
                window.scrollTo(0, 0);
                setIsEditing(false);
            }
        };

        handleNavigation();
    }, [location, mountedRef]);

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
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        const requiredFields = ['age', 'gender', 'weight', 'height', 'dietType', 'calorieTarget', 'activityLevel'];
        const missingFields = requiredFields.filter(field => !profileData[field]);
        
        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Validate numeric fields
        const numericFields = ['age', 'weight', 'height', 'calorieTarget'];
        const invalidFields = numericFields.filter(field => 
            profileData[field] && isNaN(Number(profileData[field]))
        );
        
        if (invalidFields.length > 0) {
            alert(`Please enter valid numbers for: ${invalidFields.join(', ')}`);
            return;
        }

        try {
            setIsLoading(true);
            const updatedUserData = await updateProfileData(user, {
                ...profileData,
                age: Number(profileData.age),
                weight: Number(profileData.weight),
                height: Number(profileData.height),
                calorieTarget: Number(profileData.calorieTarget)
            });
            
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
                                            <FormControl fullWidth disabled={!isEditing}>
                                                <InputLabel>{t('Activity Level')}</InputLabel>
                                                <Select
                                                    value={profileData?.activityLevel || ''}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, activityLevel: e.target.value }))}
                                                    disabled={!isEditing}
                                                >
                                                    <MenuItem value="sedentary">Sedentary</MenuItem>
                                                    <MenuItem value="light">Light</MenuItem>
                                                    <MenuItem value="moderate">Moderate</MenuItem>
                                                    <MenuItem value="active">Active</MenuItem>
                                                    <MenuItem value="very_active">Very Active</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth disabled={!isEditing}>
                                                <InputLabel>{t('Diet Type')}</InputLabel>
                                                <Select
                                                    value={profileData?.dietType || ''}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, dietType: e.target.value }))}
                                                    disabled={!isEditing}
                                                >
                                                    <MenuItem value="balanced">Balanced</MenuItem>
                                                    <MenuItem value="keto">Keto</MenuItem>
                                                    <MenuItem value="vegetarian">Vegetarian</MenuItem>
                                                    <MenuItem value="vegan">Vegan</MenuItem>
                                                    <MenuItem value="paleo">Paleo</MenuItem>
                                                    <MenuItem value="mediterranean">Mediterranean</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <InputLabel>{t('Health Goals')}</InputLabel>
                                                <Select
                                                    multiple
                                                    value={profileData?.healthGoals || []}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, healthGoals: e.target.value }))}
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
                                                    onClick={handleSubmit}
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
                                                value={profileData?.age || ''}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>{t('Gender')}</InputLabel>
                                                <Select
                                                    value={profileData?.gender || ''}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
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
                                                value={profileData?.weight || ''}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, weight: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label={t('Height (cm)')}
                                                type="number"
                                                value={profileData?.height || ''}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, height: e.target.value }))}
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
                                                value={profileData?.calorieTarget || ''}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, calorieTarget: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label={t('Protein (g)')}
                                                type="number"
                                                value={profileData?.targetProtein || ''}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, targetProtein: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label={t('Carbs (g)')}
                                                type="number"
                                                value={profileData?.targetCarbs || ''}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, targetCarbs: e.target.value }))}
                                                disabled={!isEditing}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label={t('Fat (g)')}
                                                type="number"
                                                value={profileData?.targetFat || ''}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, targetFat: e.target.value }))}
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
                                                    onClick={handleSubmit}
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
                                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                                {achievement.icon}
                                                            </Box>
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
        </ScrollableContainer>
    );
};

export default Profile;