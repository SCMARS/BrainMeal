import { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';

function MealPlanningApp() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();

    const [userData, setUserData] = useState(null);
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
    const [isLoadingDaily, setIsLoadingDaily] = useState(false);
    const [error, setError] = useState(null);
    const [nutritionStats, setNutritionStats] = useState(null);
    const [selectedDay, setSelectedDay] = useState('monday');
    const [isEditing, setIsEditing] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [editingDay, setEditingDay] = useState(null);
    const [editMealName, setEditMealName] = useState('');
    const [editCalories, setEditCalories] = useState('');
    const [open, setOpen] = useState(false);
    const [meals, setMeals] = useState([]);
    const [newMeal, setNewMeal] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        time: '',
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

    const theme = darkMode ? 'dark-theme' : 'light-theme';

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
        if (weeklyPlan && selectedDay && weeklyPlan[selectedDay]) {
            const stats = calculateNutritionStats(weeklyPlan[selectedDay]);
            setNutritionStats(stats);
        } else if (dailyPlan) {
            const stats = calculateNutritionStats(dailyPlan);
            setNutritionStats(stats);
        }
    }, [weeklyPlan, dailyPlan, selectedDay]);

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
            setSelectedDay('monday');
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

    const handleDayClick = (day) => {
        setSelectedDay(day);
    };

    const startEditingWeeklyMeal = (day, meal) => {
        setIsEditing(true);
        setEditingDay(day);
        setEditingMeal(meal);
        setEditMealName(weeklyPlan[day][meal] || '');
        setEditCalories(weeklyPlan[day][`${meal}_calories`] || 0);
    };

    const startEditingDailyMeal = (meal) => {
        setIsEditing(true);
        setEditingDay(null);
        setEditingMeal(meal);
        setEditMealName(dailyPlan[meal]?.meal || '');
        setEditCalories(dailyPlan[meal]?.calories || 0);
    };

    const saveEditedMeal = () => {
        if (editingDay) {
            // Editing weekly plan
            const updatedWeeklyPlan = { ...weeklyPlan };
            if (!updatedWeeklyPlan[editingDay]) {
                updatedWeeklyPlan[editingDay] = {};
            }
            updatedWeeklyPlan[editingDay] = { ...updatedWeeklyPlan[editingDay] };
            updatedWeeklyPlan[editingDay][editingMeal] = editMealName;
            updatedWeeklyPlan[editingDay][`${editingMeal}_calories`] = parseInt(editCalories) || 0;
            setWeeklyPlan(updatedWeeklyPlan);
            // Fix: Use the returned value to set nutrition stats
            const stats = calculateNutritionStats(updatedWeeklyPlan[editingDay]);
            setNutritionStats(stats);
        } else {
            // Editing daily plan
            const updatedDailyPlan = { ...dailyPlan };
            if (!updatedDailyPlan[editingMeal]) {
                updatedDailyPlan[editingMeal] = {};
            }
            updatedDailyPlan[editingMeal] = {
                ...updatedDailyPlan[editingMeal],
                meal: editMealName,
                calories: parseInt(editCalories) || 0
            };
            setDailyPlan(updatedDailyPlan);
            // Fix: Use the returned value to set nutrition stats
            const stats = calculateNutritionStats(updatedDailyPlan);
            setNutritionStats(stats);
        }
        setIsEditing(false);
        setEditingMeal(null);
        setEditingDay(null);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditingMeal(null);
        setEditingDay(null);
    };

    // Edit modal
    const renderEditModal = () => {
        if (!isEditing) return null;
        return (
            <div className="modal">
                <div className="modal-content">
                    <h3>{t.mealEditing}</h3>
                    {editingDay && <p>{t.day}: {t[editingDay]}</p>}
                    <p>{t.meal}: {t[editingMeal]}</p>
                    <div className="form-group">
                        <label htmlFor="meal-name">{t.mealName}:</label>
                        <input
                            id="meal-name"
                            type="text"
                            value={editMealName}
                            onChange={(e) => setEditMealName(e.target.value)}
                            placeholder={t.enterMealName}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="calories">{t.caloriesCount}:</label>
                        <input
                            id="calories"
                            type="number"
                            value={editCalories}
                            onChange={(e) => setEditCalories(e.target.value)}
                            placeholder={t.enterCalories}
                        />
                    </div>
                    <div className="button-group">
                        <button className="save-button" onClick={saveEditedMeal}>{t.save}</button>
                        <button className="cancel-button" onClick={cancelEditing}>{t.cancel}</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderCalorieStats = () => {
        let mealCalories = [];
        let total = 0;

        if (weeklyPlan && selectedDay && weeklyPlan[selectedDay]) {
            const dayPlan = weeklyPlan[selectedDay];
            mealCalories = [
                { name: t.breakfast, calories: Number(dayPlan.breakfast_calories) || 0 },
                { name: t.lunch, calories: Number(dayPlan.lunch_calories) || 0 },
                { name: t.dinner, calories: Number(dayPlan.dinner_calories) || 0 },
            ];
            total = mealCalories.reduce((acc, meal) => acc + meal.calories, 0);
        } else if (dailyPlan) {
            mealCalories = [
                { name: t.breakfast, calories: Number(dailyPlan.breakfast?.calories) || 0 },
                { name: t.lunch, calories: Number(dailyPlan.lunch?.calories) || 0 },
                { name: t.dinner, calories: Number(dailyPlan.dinner?.calories) || 0 },
                { name: t.snack, calories: Number(dailyPlan.snack?.calories) || 0 },
            ];
            total = mealCalories.reduce((acc, meal) => acc + meal.calories, 0);
        }

        if (mealCalories.length === 0) return null;

        return (
            <div className="calorie-stats">
                <h3>{t.calorieStats}</h3>
                {mealCalories.map((meal) => {
                    const percentage = total ? Math.round((meal.calories / total) * 100) : 0;
                    return (
                        <div key={meal.name} className="meal-calorie-item">
                            <span className="meal-name">{meal.name}:</span>
                            <span className="meal-calories">{meal.calories} {t.calories} ({percentage}%)</span>
                        </div>
                    );
                })}
                <div className="total-calories">
                    <strong>{t.totalCaloriesIntake} {total} {t.calories}</strong>
                </div>
            </div>
        );
    };

    const renderNutritionStats = () => {
        if (!nutritionStats) {
            return (
                <div className="nutrition-placeholder">
                    <h3>{t.nutritionInfo}</h3>
                    <p>{t.generateMealPlan}</p>
                </div>
            );
        }

        const getDietRecommendations = () => {
            if (!userData || !userData.dietType) {
                return [
                    t.hydrationTip,
                    t.mealTimingTip,
                    t.balancedDietTip
                ];
            }
            switch (userData.dietType) {
                case 'protein':
                case 'muscle_gain':
                    return [
                        t.proteinDietTip,
                        t.muscleGainTip,
                        t.complexCarbsTip
                    ];
                case 'weight_loss':
                    return [
                        t.eatSlowlyTip,
                        t.weightLossTip,
                        t.moreVegetablesTip
                    ];
                case 'gentle':
                    return [
                        t.gentleDietTip,
                        t.preferBoiledTip,
                        t.warmWaterTip
                    ];
                default:
                    return [
                        t.hydrationTip,
                        t.mealTimingTip,
                        t.balancedDietTip
                    ];
            }
        };

        const recommendations = getDietRecommendations();

        return (
            <div className="nutrition-stats">
                <h3>{t.totalMacros}</h3>
                <div className="nutrition-summary">
                    <div className="total-calories">
                        <h4>{t.totalCalories}</h4>
                        <p className="calories-value">{nutritionStats.calories} {t.calories}</p>
                    </div>
                    <div className="macros-list">
                        {nutritionStats.macros.map((macro) => (
                            <div key={macro.name} className="macro-item">
                                <div className="color-indicator" style={{ backgroundColor: macro.color }}></div>
                                <span className="macro-name">{macro.name}:</span>
                                <span className="macro-value">{macro.grams} г</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={nutritionStats.macros}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, grams }) => `${name}: ${grams}г`}
                            >
                                {nutritionStats.macros.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} г`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="calorie-distribution">
                    <h4>{t.calorieDistribution}</h4>
                    <div className="distribution-items">
                        {nutritionStats.macros.map((macro) => {
                            const calories = (macro.name === t.proteins || macro.name === t.carbs)
                                ? macro.grams * 4
                                : macro.grams * 9;
                            const percentage = nutritionStats.calories > 0
                                ? Math.round((calories / nutritionStats.calories) * 100)
                                : 0;
                            return (
                                <div key={`cal-${macro.name}`} className="distribution-item">
                                    <span className="macro-name">{macro.name}:</span>
                                    <span className="macro-calories">{calories} {t.calories} ({percentage}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="diet-recommendations">
                    <h4>{t.recommendations}</h4>
                    <ul>
                        {recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    const renderWeeklyPlan = () => {
        if (isLoadingWeekly) {
            return <div className="loading">{t.loading}</div>;
        }
        if (!weeklyPlan) {
            return <div className="no-data">{t.noMealData}</div>;
        }
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return (
            <div className="weekly-plan">
                <div className="day-selector">
                    {days.map(day => (
                        <button
                            key={day}
                            className={`day-button ${selectedDay === day ? 'selected' : ''}`}
                            onClick={() => handleDayClick(day)}
                        >
                            {t[day]}
                        </button>
                    ))}
                </div>
                {selectedDay && weeklyPlan[selectedDay] ? (
                    <div className="day-meals">
                        <div className="meal-item">
                            <div className="meal-header">
                                <h4>{t.breakfast}</h4>
                                <button className="edit-button" onClick={() => startEditingWeeklyMeal(selectedDay, 'breakfast')}>
                                    {t.edit}
                                </button>
                            </div>
                            <p>{weeklyPlan[selectedDay].breakfast || t.noMealData}</p>
                            <p className="meal-calories">{weeklyPlan[selectedDay].breakfast_calories} {t.calories}</p>
                        </div>
                        <div className="meal-item">
                            <div className="meal-header">
                                <h4>{t.lunch}</h4>
                                <button className="edit-button" onClick={() => startEditingWeeklyMeal(selectedDay, 'lunch')}>
                                    {t.edit}
                                </button>
                            </div>
                            <p>{weeklyPlan[selectedDay].lunch || t.noMealData}</p>
                            <p className="meal-calories">{weeklyPlan[selectedDay].lunch_calories} {t.calories}</p>
                        </div>
                        <div className="meal-item">
                            <div className="meal-header">
                                <h4>{t.dinner}</h4>
                                <button className="edit-button" onClick={() => startEditingWeeklyMeal(selectedDay, 'dinner')}>
                                    {t.edit}
                                </button>
                            </div>
                            <p>{weeklyPlan[selectedDay].dinner || t.noMealData}</p>
                            <p className="meal-calories">{weeklyPlan[selectedDay].dinner_calories} {t.calories}</p>
                        </div>
                    </div>
                ) : (
                    <div className="no-data">{t.noDataForDay}</div>
                )}
            </div>
        );
    };

    const renderDailyPlan = () => {
        if (isLoadingDaily) {
            return <div className="loading">{t.loading}</div>;
        }
        if (!dailyPlan) {
            return <div className="no-data">{t.noMealData}</div>;
        }
        return (
            <div className="daily-plan">
                <div className="meal-item">
                    <div className="meal-header">
                        <h4>{t.breakfast}</h4>
                        <button className="edit-button" onClick={() => startEditingDailyMeal('breakfast')}>
                            {t.edit}
                        </button>
                    </div>
                    <p>{dailyPlan.breakfast?.meal || t.noMealData}</p>
                    <p className="meal-calories">{dailyPlan.breakfast?.calories} {t.calories}</p>
                </div>
                <div className="meal-item">
                    <div className="meal-header">
                        <h4>{t.lunch}</h4>
                        <button className="edit-button" onClick={() => startEditingDailyMeal('lunch')}>
                            {t.edit}
                        </button>
                    </div>
                    <p>{dailyPlan.lunch?.meal || t.noMealData}</p>
                    <p className="meal-calories">{dailyPlan.lunch?.calories} {t.calories}</p>
                </div>
                <div className="meal-item">
                    <div className="meal-header">
                        <h4>{t.dinner}</h4>
                        <button className="edit-button" onClick={() => startEditingDailyMeal('dinner')}>
                            {t.edit}
                        </button>
                    </div>
                    <p>{dailyPlan.dinner?.meal || t.noMealData}</p>
                    <p className="meal-calories">{dailyPlan.dinner?.calories} {t.calories}</p>
                </div>
                <div className="meal-item">
                    <div className="meal-header">
                        <h4>{t.snack}</h4>
                        <button className="edit-button" onClick={() => startEditingDailyMeal('snack')}>
                            {t.edit}
                        </button>
                    </div>
                    <p>{dailyPlan.snack?.meal || t.noMealData}</p>
                    <p className="meal-calories">{dailyPlan.snack?.calories} {t.calories}</p>
                </div>
            </div>
        );
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAddMeal = () => {
        if (newMeal.name) {
            setMeals([...meals, { ...newMeal, id: Date.now() }]);
            setNewMeal({
                name: '',
                calories: '',
                protein: '',
                carbs: '',
                fats: '',
                time: '',
            });
            handleClose();
        }
    };

    const handleDeleteMeal = (id) => {
        setMeals(meals.filter((meal) => meal.id !== id));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewMeal((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

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

            {renderEditModal()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    {t('mealPlan')}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
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
                                                        onClick={() => handleDeleteMeal(meal.id)}
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

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{t('addMeal')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label={t('mealName')}
                            name="name"
                            value={newMeal.name}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('calories')}
                            name="calories"
                            type="number"
                            value={newMeal.calories}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('protein')}
                            name="protein"
                            type="number"
                            value={newMeal.protein}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('carbs')}
                            name="carbs"
                            type="number"
                            value={newMeal.carbs}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('fats')}
                            name="fats"
                            type="number"
                            value={newMeal.fats}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('time')}
                            name="time"
                            type="time"
                            value={newMeal.time}
                            onChange={handleChange}
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('cancel')}</Button>
                    <Button onClick={handleAddMeal} variant="contained" color="primary">
                        {t('save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default MealPlanningApp;













