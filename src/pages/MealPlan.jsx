import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    useTheme,
    Chip,
    Stack,
    Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';
import { useMealPlan } from '../context/MealPlanContext';
import { useAuth } from '../context/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function MealPlanningApp() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const theme = useTheme();
    const { user } = useAuth();

    const {
        meals,
        loading,
        error,
        addMeal,
        updateMeal,
        deleteMeal,
        getMealsByDate,
        getMealsByWeek,
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
    const [activeTab, setActiveTab] = useState(0);
    const [weeklyStats, setWeeklyStats] = useState(null);
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

    // Calculate weekly statistics
    useEffect(() => {
        const startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        const weekMeals = getMealsByWeek(startDate);
        
        const stats = weekMeals.reduce((acc, meal) => {
            const day = new Date(meal.date).toLocaleDateString('en-US', { weekday: 'short' });
            if (!acc[day]) {
                acc[day] = {
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    meals: 0
                };
            }
            acc[day].calories += meal.calories || 0;
            acc[day].protein += meal.protein || 0;
            acc[day].carbs += meal.carbs || 0;
            acc[day].fat += meal.fat || 0;
            acc[day].meals += 1;
            return acc;
        }, {});

        setWeeklyStats(stats);
    }, [meals, selectedDate]);

    const backHandler = () => {
        navigate("/profile");
    };

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
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
                fat: Number(formData.fat),
                userId: user.uid
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

    const COLORS = ['#FF7849', '#FF9F7E', '#FFB39E', '#FFD1C2'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    const renderNutritionChart = () => {
        const data = [
            { name: t('Protein'), value: nutritionSummary.protein },
            { name: t('Carbs'), value: nutritionSummary.carbs },
            { name: t('Fat'), value: nutritionSummary.fat }
        ];

        return (
            <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        );
    };

    const renderWeeklyStats = () => {
        if (!weeklyStats) return null;

        const data = Object.entries(weeklyStats).map(([day, stats]) => ({
            day,
            ...stats
        }));

        return (
            <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="calories" fill="#FF7849" name={t('Calories')} />
                        <Bar dataKey="protein" fill="#FF9F7E" name={t('Protein')} />
                        <Bar dataKey="carbs" fill="#FFB39E" name={t('Carbs')} />
                        <Bar dataKey="fat" fill="#FFD1C2" name={t('Fat')} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        );
    };

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
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">
                                    {t('Daily Meals')}
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenDialog()}
                                >
                                    {t('Add Meal')}
                                </Button>
                            </Box>

                            <AnimatePresence>
                                {mealTypes.map((type) => {
                                    const typeMeals = dailyMeals.filter(meal => meal.type === type);
                                    return (
                                        <motion.div
                                            key={type}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Card sx={{ mb: 2, bgcolor: 'background.default' }}>
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom>
                                                        {t(type.charAt(0).toUpperCase() + type.slice(1))}
                                                    </Typography>
                                                    {typeMeals.length === 0 ? (
                                                        <Typography color="text.secondary">
                                                            {t('No meals added')}
                                                        </Typography>
                                                    ) : (
                                                        typeMeals.map((meal) => (
                                                            <Box
                                                                key={meal.id}
                                                                sx={{
                                                                    p: 2,
                                                                    mb: 1,
                                                                    bgcolor: 'background.paper',
                                                                    borderRadius: 1,
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <Box>
                                                                    <Typography variant="subtitle1">
                                                                        {meal.name}
                                                                    </Typography>
                                                                    <Stack direction="row" spacing={1} mt={1}>
                                                                        <Chip
                                                                            label={`${meal.calories} ${t('kcal')}`}
                                                                            size="small"
                                                                            color="primary"
                                                                        />
                                                                        <Chip
                                                                            label={`${meal.protein}g ${t('protein')}`}
                                                                            size="small"
                                                                        />
                                                                        <Chip
                                                                            label={`${meal.carbs}g ${t('carbs')}`}
                                                                            size="small"
                                                                        />
                                                                        <Chip
                                                                            label={`${meal.fat}g ${t('fat')}`}
                                                                            size="small"
                                                                        />
                                                                    </Stack>
                                                                </Box>
                                                                <Box>
                                                                    <IconButton
                                                                        onClick={() => handleOpenDialog(meal)}
                                                                        size="small"
                                                                    >
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        onClick={() => handleDelete(meal.id)}
                                                                        size="small"
                                                                        color="error"
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </Box>
                                                            </Box>
                                                        ))
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('Daily Summary')}
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h4" color="primary">
                                        {nutritionSummary.calories}
                                        <Typography component="span" variant="h6" color="text.secondary">
                                            {' '}{t('kcal')}
                                        </Typography>
                                    </Typography>
                                </Box>
                                {renderNutritionChart()}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('Weekly Progress')}
                                </Typography>
                                {renderWeeklyStats()}
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
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
                            {mealTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {t(type.charAt(0).toUpperCase() + type.slice(1))}
                                </MenuItem>
                            ))}
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
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!formData.name || !formData.calories}
                    >
                        {editingMeal ? t('Update') : t('Add')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default MealPlanningApp;













