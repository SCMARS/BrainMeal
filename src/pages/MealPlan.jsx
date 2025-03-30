import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from "react-router-dom";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar
} from 'recharts';
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
    Paper,
    MenuItem,
    Chip,
    Stack
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLanguage } from '../context/LanguageContext';
import { useMealPlan } from '../context/MealPlanContext';
import { useAuth } from '../context/AuthContext';
import {generateMealPlan} from "../services/geminiService.js";

function MealPlanningApp() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { user } = useAuth();

    const {
        meals,
        loading,
        error: mealPlanError,
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

    // Управление темой и языком
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

    // Создаем тему Material‑UI
    const muiTheme = useMemo(() =>
        createTheme({
            palette: {
                mode: darkMode ? 'dark' : 'light',
                primary: {
                    main: '#1976d2'
                },
                secondary: {
                    main: '#ff4081'
                }
            },
        }), [darkMode]);

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    // Загрузка данных пользователя
    useEffect(() => {
        const loadData = () => {
            try {
                // Загружаем данные пользователя
                const storedUserData = localStorage.getItem('userData');
                if (storedUserData) {
                    setUserData(JSON.parse(storedUserData));
                }

                // Загружаем сгенерированный план питания
                const storedMealPlan = localStorage.getItem('generatedMealPlan');
                if (storedMealPlan) {
                    const parsedPlan = JSON.parse(storedMealPlan);
                    if (parsedPlan.isWeekly) {
                        setWeeklyPlan(parsedPlan.plan);
                    } else {
                        setDailyPlan(parsedPlan.plan);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                setError('Failed to load user data and meal plan');
            }
        };

        loadData();
    }, []);

    // Расчет недельной статистики
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
    }, [meals, selectedDate, getMealsByWeek]);

    const backHandler = () => {
        navigate("/profile");
    };

    const handleDateChange = (event) => {
        const newDate = new Date(event.target.value);
        setSelectedDate(newDate);
    };

    const handleGenerateWeeklyPlan = async () => {
        if (!userData) {
            console.error(t.userDataNotFound);
            return;
        }
        setIsLoadingWeekly(true);
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
        } finally {
            setIsLoadingWeekly(false);
        }
    };

    const handleGenerateDailyPlan = async () => {
        if (!userData) {
            console.error(t.userDataNotFound);
            return;
        }
        setIsLoadingDaily(true);
        try {
            const generatedPlan = await generateMealPlan({
                ...userData,
                isWeekly: false
            });
            setDailyPlan(generatedPlan);
            setWeeklyPlan(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingDaily(false);
        }
    };

    const handleOpenDialog = (meal = null) => {
        if (meal) {
            setEditingMeal(meal);
            setFormData({
                name: meal.name || '',
                type: meal.type || 'breakfast',
                calories: meal.calories || '',
                protein: meal.protein || '',
                carbs: meal.carbs || '',
                fat: meal.fat || '',
                notes: meal.notes || ''
            });
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

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateMealPlan = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const mealPlan = await generateMealPlan(formData);
            // Handle success
        } catch (error) {
            setError(error.message);
        } finally {
            setIsGenerating(false);
        }
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
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        );
    };

    const renderWeeklyPlan = () => {
        if (!weeklyPlan) return null;

        return (
            <div className="weekly-plan">
                {weeklyPlan.map((day, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #FE6B8B 0%, #FF8E53 100%)', color: '#fff' }}>
                            <CardContent>
                                <Typography variant="h6">
                                    {new Date(day.date).toLocaleDateString(language, { weekday: 'long' })}
                                </Typography>
                                <List>
                                    {day.meals.map((meal, mealIndex) => (
                                        <ListItem key={mealIndex}>
                                            <ListItemText
                                                primary={meal.name}
                                                secondary={`${meal.calories} ${t('kcal')} | ${meal.protein}g ${t('protein')} | ${meal.carbs}g ${t('carbs')} | ${meal.fat}g ${t('fat')}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        );
    };

    const renderDailyPlan = () => {
        if (!dailyPlan) return null;

        return (
            <div className="daily-plan">
                {mealTypes.map((type) => (
                    <motion.div
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card sx={{ mb: 2, boxShadow: 3 }}>
                            <CardContent>
                                <Typography variant="h6">
                                    {t(type.charAt(0).toUpperCase() + type.slice(1))}
                                </Typography>
                                <List>
                                    {dailyPlan
                                        .filter(meal => meal.type === type)
                                        .map((meal, index) => (
                                            <ListItem key={index}>
                                                <ListItemText
                                                    primary={meal.name}
                                                    secondary={`${meal.calories} ${t('kcal')} | ${meal.protein}g ${t('protein')} | ${meal.carbs}g ${t('carbs')} | ${meal.fat}g ${t('fat')}`}
                                                />
                                            </ListItem>
                                        ))}
                                </List>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
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

    const renderCalorieStats = () => {
        const dailyMeals = getMealsByDate(selectedDate);
        const totalCalories = dailyMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        const targetCalories = userData?.targetCalories || 2000;
        const remainingCalories = targetCalories - totalCalories;

        return (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    {t('calorieStats')}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)', color: '#fff' }}>
                            <Typography variant="subtitle2">{t('targetCalories')}</Typography>
                            <Typography variant="h6">{targetCalories}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #66BB6A 0%, #43A047 100%)', color: '#fff' }}>
                            <Typography variant="subtitle2">{t('consumedCalories')}</Typography>
                            <Typography variant="h6">{totalCalories}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', background: remainingCalories < 0 ? 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)' : 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)', color: '#fff' }}>
                            <Typography variant="subtitle2">{t('remainingCalories')}</Typography>
                            <Typography variant="h6">{remainingCalories}</Typography>
                        </Paper>
                    </Grid>
                </Grid>
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
        <ThemeProvider theme={muiTheme}>
            <Box sx={{ overflowY: 'auto', maxHeight: '100vh' }}>
                <div className={`meal-planning-container ${darkMode ? 'dark' : 'light'}`}>
                    <Box sx={{ p: 2, background: 'linear-gradient(135deg, #FF8E53 0%, #FE6B8B 100%)', color: '#fff', borderRadius: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Button variant="text" onClick={backHandler} sx={{ color: '#fff' }}>
                                ← {t.back}
                            </Button>
                            <Box>
                                <TextField
                                    select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    size="small"
                                    sx={{ mr: 2, backgroundColor: '#fff', borderRadius: 1 }}
                                >
                                    <MenuItem value="en">English</MenuItem>
                                    <MenuItem value="uk">Українська</MenuItem>
                                </TextField>
                                <Button variant="outlined" onClick={() => setDarkMode(!darkMode)} sx={{ color: '#fff', borderColor: '#fff' }}>
                                    {darkMode ? "Light Mode" : "Dark Mode"}
                                </Button>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="h4">{t.mainTitle}</Typography>
                            <Typography variant="subtitle1">{t.subtitle}</Typography>
                        </Box>
                    </Box>

                    {mealPlanError && (
                        <Typography variant="body1" sx={{ color: 'red', textAlign: 'center', mb: 2 }}>{mealPlanError}</Typography>
                    )}

                    {userData && (
                        <Box sx={{ p: 2, mb: 2, borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                            <Typography variant="h6">{t.profile}</Typography>
                            <Typography variant="body2">
                                {t.weight}: {userData.weight} кг | {t.height}: {userData.height} см | {t.age}: {userData.age}
                            </Typography>
                            <Typography variant="body2">
                                {t.dietType}: {userData.dietType === 'basic' ? t.basic :
                                userData.dietType === 'gentle' ? t.gentle :
                                    userData.dietType === 'protein' ? t.highProtein :
                                        userData.dietType === 'weight_loss' ? t.weightLoss : t.notSpecified}
                            </Typography>
                            {userData.mealPreferences && (
                                <Typography variant="body2">
                                    {t.mealPreferences}: {userData.mealPreferences}
                                </Typography>
                            )}
                        </Box>
                    )}

                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                    <Card sx={{ p: 2, mb: 3 }}>
                                        <Typography variant="h5" sx={{ mb: 1 }}>{t.weeklyPlan}</Typography>
                                        <Button
                                            variant="contained"
                                            onClick={handleGenerateWeeklyPlan}
                                            disabled={isLoadingWeekly}
                                            sx={{ mb: 2 }}
                                        >
                                            {isLoadingWeekly ? t.loading : t.generateWeeklyPlan}
                                        </Button>
                                        {renderWeeklyPlan()}
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                                    <Card sx={{ p: 2, mb: 3 }}>
                                        <Typography variant="h5" sx={{ mb: 1 }}>{t.dailyPlan}</Typography>
                                        <Button
                                            variant="contained"
                                            onClick={handleGenerateDailyPlan}
                                            disabled={isLoadingDaily}
                                            sx={{ mb: 2 }}
                                        >
                                            {isLoadingDaily ? t.loading : t.generateDailyPlan}
                                        </Button>
                                        {renderDailyPlan()}
                                    </Card>
                                </motion.div>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Stack spacing={3}>
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                                        <Card sx={{ p: 2 }}>
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
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                                        <Card sx={{ p: 2 }}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    {t('Weekly Progress')}
                                                </Typography>
                                                {renderWeeklyStats()}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 4 }}>
                        <Typography variant="h4">{t('mealPlan')}</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            {t('addMeal')}
                        </Button>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Typography variant="h4">{t('Meal Plan')}</Typography>
                                <TextField
                                    type="date"
                                    value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                                    onChange={handleDateChange}
                                    sx={{ width: 220 }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>
                        </motion.div>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="h6">{t('Daily Meals')}</Typography>
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
                                                        <Card sx={{ mb: 2, boxShadow: 3 }}>
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
                                                                                <Typography variant="subtitle1">{meal.name}</Typography>
                                                                                <Stack direction="row" spacing={1} mt={1}>
                                                                                    <Chip label={`${meal.calories} ${t('kcal')}`} size="small" color="primary" />
                                                                                    <Chip label={`${meal.protein}g ${t('protein')}`} size="small" color="primary" />
                                                                                    <Chip label={`${meal.carbs}g ${t('carbs')}`} size="small" color="primary" />
                                                                                    <Chip label={`${meal.fat}g ${t('fat')}`} size="small" color="primary" />
                                                                                </Stack>
                                                                            </Box>
                                                                            <Box>
                                                                                <IconButton onClick={() => handleOpenDialog(meal)} size="small">
                                                                                    <EditIcon />
                                                                                </IconButton>
                                                                                <IconButton onClick={() => handleDelete(meal.id)} size="small" color="error">
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
                    </Box>

                    <Dialog open={openDialog} onClose={handleCloseDialog}>
                        <DialogTitle>{editingMeal ? t('Edit Meal') : t('Add New Meal')}</DialogTitle>
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
                            <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!formData.name || !formData.calories}>
                                {editingMeal ? t('Update') : t('Add')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </Box>
        </ThemeProvider>
    );
}

export default MealPlanningApp;
















