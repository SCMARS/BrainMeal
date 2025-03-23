import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import "./styles/Mealplan.css";
import { useLocation, useNavigate } from "react-router-dom";
import { generateMealPlan } from './services/llmService.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    CircularProgress,
    Tabs,
    Tab,
    Paper,
    MenuItem,
    useTheme
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';
import { useMealPlan } from '../context/MealPlanContext';

function MealPlanningApp() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const theme = useTheme();

    const {
        meals,
        loading,
        error,
        addMeal,
        updateMeal,
        deleteMeal,
        getMealsByDate,
        getNutritionSummary
    } = useMealPlan();

    const [userData, setUserData] = useState(null);
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
    const [isLoadingDaily, setIsLoadingDaily] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [openDialog, setOpenDialog] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'breakfast',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        notes: ''
    });

    // Theme and language state
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return location.state?.darkMode || false;
    });

    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) {
            return savedLanguage;
        }
        return location.state?.language || 'en';
    });

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    // Load user data on mount
    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                setUserData(JSON.parse(storedUserData));
            } catch (err) {
                console.error("Error parsing user data:", err);
                setError(t.errorLoadingProfile);
            }
        } else {
            setError(t.userDataNotFound);
        }
    }, [t]);

    // FIX: Modified useEffect to use the returned value from calculateNutritionStats
    useEffect(() => {
        if (weeklyPlan && selectedDate && weeklyPlan[selectedDate.toISOString().split('T')[0]]) {
            const stats = calculateNutritionStats(weeklyPlan[selectedDate.toISOString().split('T')[0]]);
            setNutritionStats(stats);
        } else if (dailyPlan) {
            const stats = calculateNutritionStats(dailyPlan);
            setNutritionStats(stats);
        }
    }, [weeklyPlan, dailyPlan, selectedDate]);

    const backHandler = () => {
        navigate("/profile");
    };


    // FIX: Modified function to return the calculated stats instead of setting state directly
    const calculateNutritionStats = (plan) => {
        let totalCalories = 0;

        if (plan.breakfast_calories !== undefined) {
            // Weekly plan format
            totalCalories =
                (parseInt(plan.breakfast_calories) || 0) +
                (parseInt(plan.lunch_calories) || 0) +
                (parseInt(plan.dinner_calories) || 0);
        } else if (plan.breakfast?.calories !== undefined) {
            // Daily plan format
            totalCalories =
                (parseInt(plan.breakfast?.calories) || 0) +
                (parseInt(plan.lunch?.calories) || 0) +
                (parseInt(plan.dinner?.calories) || 0) +
                (parseInt(plan.snack?.calories) || 0);
        }

        // Default macronutrient distribution
        let proteinPercentage = 0.25;
        let fatPercentage = 0.3;
        let carbsPercentage = 0.45;

        // Adjust based on diet type
        if (userData && userData.dietType) {
            switch(userData.dietType) {
                case "protein":
                case "muscle_gain":
                    proteinPercentage = 0.35;
                    fatPercentage = 0.25;
                    carbsPercentage = 0.4;
                    break;
                case "weight_loss":
                    proteinPercentage = 0.3;
                    fatPercentage = 0.35;
                    carbsPercentage = 0.35;
                    break;
                case "gentle":
                    proteinPercentage = 0.2;
                    fatPercentage = 0.3;
                    carbsPercentage = 0.5;
                    break;
                default:
                    break;
            }
        }

        // Calculate macros in grams
        const protein = Math.round(totalCalories * proteinPercentage / 4);
        const fat = Math.round(totalCalories * fatPercentage / 9);
        const carbs = Math.round(totalCalories * carbsPercentage / 4);

        // Return the stats instead of setting state
        return {
            calories: Math.round(totalCalories),
            macros: [
                { name: t.proteins, value: protein, grams: protein, color: '#8884d8' },
                { name: t.fats, value: fat, grams: fat, color: '#82ca9d' },
                { name: t.carbs, value: carbs, grams: carbs, color: '#ffc658' }
            ]
        };
    };

    const handleGenerateWeeklyPlan = async () => {
        if (!userData) {
            setError(t.userDataNotFound);
            return;
        }
        setIsLoadingWeekly(true);
        setError(null);
        try {
            const generatedPlan = await generateMealPlan({
                ...userData,
                isWeekly: true
            });
            setWeeklyPlan(generatedPlan);
            setSelectedDate(new Date());
            setDailyPlan(null);
        } catch (err) {
            console.error(err);
            setError(t.weeklyPlanGenerationError || "Failed to generate weekly plan. Please try again later.");
        } finally {
            setIsLoadingWeekly(false);
        }
    };

    const handleGenerateDailyPlan = async () => {
        if (!userData) {
            setError(t.userDataNotFound);
            return;
        }
        setIsLoadingDaily(true);
        setError(null);
        try {
            const generatedPlan = await generateMealPlan({
                ...userData,
                isWeekly: false
            });
            setDailyPlan(generatedPlan);
            setWeeklyPlan(null);
        } catch (err) {
            console.error(err);
            setError(t.dailyPlanGenerationError || "Failed to generate daily plan. Please try again later.");
        } finally {
            setIsLoadingDaily(false);
        }
    };

    const handleOpenDialog = (meal = null) => {
        if (meal) {
            setEditingMeal(meal);
            setFormData(meal);
        } else {
            setEditingMeal(null);
            setFormData({
                name: '',
                type: 'breakfast',
                calories: '',
                protein: '',
                carbs: '',
                fat: '',
                notes: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingMeal(null);
        setFormData({
            name: '',
            type: 'breakfast',
            calories: '',
            protein: '',
            carbs: '',
            fat: '',
            notes: ''
        });
    };

    const handleSubmit = async () => {
        try {
            const mealData = {
                ...formData,
                date: selectedDate.toISOString(),
                calories: Number(formData.calories),
                protein: Number(formData.protein),
                carbs: Number(formData.carbs),
                fat: Number(formData.fat)
            };

            if (editingMeal) {
                await updateMeal(editingMeal.id, mealData);
            } else {
                await addMeal(mealData);
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving meal:', error);
        }
    };

    const handleDelete = async (mealId) => {
        if (window.confirm(t('Are you sure you want to delete this meal?'))) {
            try {
                await deleteMeal(mealId);
            } catch (error) {
                console.error('Error deleting meal:', error);
            }
        }
    };

    const dailyMeals = getMealsByDate(selectedDate);
    const nutritionSummary = getNutritionSummary(selectedDate);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Typography variant="h6">{t('Loading...')}</Typography>
                </motion.div>
            </Box>
        );
    }

    return (
        <div className={`meal-planning-container ${theme}`}>
            <div className="header">
                <button className="back-button" onClick={backHandler}>← {t.back}</button>
                <div className="title-container">
                    <h1 className="main-title">{t.mainTitle}</h1>
                    <p className="subtitle">{t.subtitle}</p>
                </div>
                <div className="controls">
                    <button onClick={() => setDarkMode(!darkMode)}>
                        {darkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="en">English</option>
                        <option value="uk">Українська</option>
                    </select>
                </div>
                <div className="spacer"></div>
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            {userData && (
                <div className="user-profile-summary">
                    <h3 className="summary-title">{t.profile}</h3>
                    <div className="summary-details">
                        <p>{t.weight}: {userData.weight} кг | {t.height}: {userData.height} см | {t.age}: {userData.age}</p>
                        <p>
                            {t.dietType}: {userData.dietType === 'basic' ? t.basic :
                            userData.dietType === 'gentle' ? t.gentle :
                                userData.dietType === 'protein' ? t.highProtein :
                                    userData.dietType === 'weight_loss' ? t.weightLoss : t.notSpecified}
                        </p>
                        {userData.mealPreferences && <p>{t.mealPreferences}: {userData.mealPreferences}</p>}
                    </div>
                </div>
            )}

            <div className="content-layout">
                <div className="meal-plans-container">
                    <div className="plan-card">
                        <h2 className="plan-title">{t.weeklyPlan}</h2>
                        <button
                            className={`generate-button ${isLoadingWeekly ? 'loading' : ''}`}
                            onClick={handleGenerateWeeklyPlan}
                            disabled={isLoadingWeekly}
                        >
                            {isLoadingWeekly ? t.loading : t.generateWeeklyPlan}
                        </button>
                        {renderWeeklyPlan()}
                    </div>

                    <div className="plan-card">
                        <h2 className="plan-title">{t.dailyPlan}</h2>
                        <button
                            className={`generate-button ${isLoadingDaily ? 'loading' : ''}`}
                            onClick={handleGenerateDailyPlan}
                            disabled={isLoadingDaily}
                        >
                            {isLoadingDaily ? t.loading : t.generateDailyPlan}
                        </button>
                        {renderDailyPlan()}
                    </div>
                </div>

                <div className="nutrition-panel">
                    {renderCalorieStats()}
                    {renderNutritionStats()}
                </div>
            </div>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    {t('mealPlan')}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    {t('addMeal')}
                </Button>
            </Box>

            <Grid container spacing={3}>
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealType) => (
                    <Grid item xs={12} md={6} key={mealType}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {mealType}
                                </Typography>
                                <List>
                                    {meals
                                        .filter((meal) => meal.type === mealType)
                                        .map((meal) => (
                                            <ListItem key={meal.id}>
                                                <ListItemText
                                                    primary={meal.name}
                                                    secondary={`${meal.calories} kcal | ${meal.protein}g protein | ${meal.carbs}g carbs | ${meal.fats}g fats`}
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="delete"
                                                        onClick={() => handleDelete(meal.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {editingMeal ? t('Edit Meal') : t('Add New Meal')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label={t('Meal Name')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            select
                            label={t('Meal Type')}
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="breakfast">{t('Breakfast')}</MenuItem>
                            <MenuItem value="lunch">{t('Lunch')}</MenuItem>
                            <MenuItem value="dinner">{t('Dinner')}</MenuItem>
                            <MenuItem value="snack">{t('Snack')}</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            type="number"
                            label={t('Calories')}
                            value={formData.calories}
                            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label={t('Protein (g)')}
                            value={formData.protein}
                            onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label={t('Carbs (g)')}
                            value={formData.carbs}
                            onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label={t('Fat (g)')}
                            value={formData.fat}
                            onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label={t('Notes')}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>{t('Cancel')}</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editingMeal ? t('Update') : t('Add')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default MealPlanningApp;













