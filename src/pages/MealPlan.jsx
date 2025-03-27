
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';
import { useMealPlan } from '../context/MealPlanContext';
import { useAuth } from '../context/AuthContext';


function MealPlan() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { addMeal, updateMeal, deleteMeal, getMealsByDate, getNutritionSummary } = useMealPlan();

    const [userData, setUserData] = useState(null);
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
    const [isLoadingDaily, setIsLoadingDaily] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [error, setError] = useState('');
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

    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false;
    });
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        if (location.state?.userData) {
            setUserData(location.state.userData);
        } else {
            const storedUserData = localStorage.getItem('userData');
            if (storedUserData) {
                try {
                    setUserData(JSON.parse(storedUserData));
                } catch (err) {
                    console.error("Error parsing user data:", err);
                    setError(t.errorLoadingProfile || "Error loading user data.");
                }
            } else {
                setError(t.userDataNotFound || "User data not found.");
            }
        }
    }, [location.state, t]);

    const handleDateChange = (event) => {
        const newDate = new Date(event.target.value);
        setSelectedDate(newDate);
    };

    const handleGenerateWeeklyPlan = async () => {
        if (!userData) {
            setError(t.userDataNotFound || "User data not found.");
            return;
        }
        setIsLoadingWeekly(true);
        setError(null);
        try {
            const profileForAI = {
                age: userData.age,
                gender: userData.gender,
                weight: userData.weight,
                height: userData.height,
                dietType: userData.dietType,           // используем dietType
                calorieTarget: userData.calorieTarget, // используем calorieTarget
                foodPreferences: userData.mealPreferences || 'нет ограничений',
                allergies: userData.allergies?.join(', ') || 'нет'
            };

            const generatedPlan = await generateMealPlan(profileForAI);
            for (const day of generatedPlan) {
                for (const meal of day.meals) {
                    await addMeal({
                        ...meal,
                        date: day.date,
                        userId: user.uid
                    });
                }
            }
            setWeeklyPlan(generatedPlan);
            setSelectedDate(new Date());
            setDailyPlan(null);
        } catch (err) {
            console.error('Error generating weekly plan:', err);
            setError(t.weeklyPlanGenerationError || "Failed to generate weekly plan. Please try again later.");
        } finally {
            setIsLoadingWeekly(false);
        }
    };

    const handleGenerateDailyPlan = async () => {
        if (!userData) {
            setError(t.userDataNotFound || "User data not found.");
            return;
        }
        setIsLoadingDaily(true);
        setError(null);
        try {
            const profileForAI = {
                age: userData.age,
                gender: userData.gender,
                weight: userData.weight,
                height: userData.height,
                goal: userData.dietType,
                targetCalories: userData.calorieTarget,
                foodPreferences: userData.mealPreferences || 'нет ограничений',
                allergies: userData.allergies?.join(', ') || 'нет'
            };
            const generatedPlan = await generateMealPlan(profileForAI);
            const formattedPlan = generatedPlan.map(meal => ({
                ...meal,
                calories: Number(meal.calories),
                protein: Number(meal.protein),
                carbs: Number(meal.carbs),
                fat: Number(meal.fat),
                date: selectedDate.toISOString(),
                userId: user.uid
            }));
            for (const meal of formattedPlan) {
                await addMeal(meal);
            }
            setDailyPlan(formattedPlan);
            setWeeklyPlan(null);
        } catch (err) {
            console.error('Error generating daily plan:', err);
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
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    const renderNutritionChart = () => (
        <Box className="h-72 bg-gray-100 dark:bg-gray-800 rounded p-4 flex items-center justify-center shadow-lg border border-gray-700 transition-transform duration-300 hover:-translate-y-1">
            <Typography variant="subtitle1" className="text-center">
                {t('Nutrition Chart Placeholder')}
            </Typography>
        </Box>
    );

    const renderWeeklyPlan = () => {
        if (!weeklyPlan) return null;
        return (
            <div className="space-y-4">
                {weeklyPlan.map((day, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded shadow p-4 border border-gray-200 dark:border-gray-600 transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
                        <Typography variant="h6" className="font-bold text-orange-400">
                            {new Date(day.date).toLocaleDateString(language, { weekday: 'long' })}
                        </Typography>
                        <ul className="mt-2 space-y-2">
                            {day.meals.map((meal, mealIndex) => (
                                <li key={mealIndex} className="border-b border-gray-200 dark:border-gray-600 pb-2">
                                    <p className="font-medium">{meal.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {meal.calories} {t('kcal')} | {meal.protein}g {t('protein')} | {meal.carbs}g {t('carbs')} | {meal.fat}g {t('fat')}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    const renderDailyPlan = () => {
        if (!dailyPlan) return null;
        return (
            <div className="space-y-4">
                {mealTypes.map((type) => (
                    <div key={type} className="bg-white dark:bg-gray-800 rounded shadow p-4 border border-gray-200 dark:border-gray-600 transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
                        <Typography variant="h6" className="font-bold text-orange-400">
                            {t(type.charAt(0).toUpperCase() + type.slice(1))}
                        </Typography>
                        <ul className="mt-2 space-y-2">
                            {dailyPlan.filter(meal => meal.type === type).map((meal, index) => (
                                <li key={index} className="border-b border-gray-200 dark:border-gray-600 pb-2">
                                    <p className="font-medium">{meal.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {meal.calories} {t('kcal')} | {meal.protein}g {t('protein')} | {meal.carbs}g {t('carbs')} | {meal.fat}g {t('fat')}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${darkMode
            ? 'from-[#1a1a1a] via-[#2a2a2a] to-[#3a3a3a]'
            : 'from-[#f5f5f5] via-[#ffffff] to-[#f0f0f0]'
        } text-gray-100 dark:text-gray-200 transition-all duration-500`}>
            {/* Header with enhanced styling */}
            <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#FF6B00] to-[#FF4500] shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <button
                        className="text-white text-lg font-semibold hover:text-orange-100 transform hover:scale-105 transition-all duration-300"
                        onClick={() => navigate("/profile")}
                    >
                        ← {t.back}
                    </button>

                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-white tracking-wide animate-pulse">
                            {t.mainTitle}
                        </h1>
                        <p className="text-orange-100 mt-2 text-lg">{t.subtitle}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-800 text-white rounded-full hover:from-orange-700 hover:to-orange-900 transform hover:scale-110 transition-all duration-300 shadow-lg"
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            {darkMode ? "☀️ Light" : "🌙 Dark"}
                        </button>

                        <select
                            className="px-3 py-2 bg-orange-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="en" className="bg-orange-800">English</option>
                            <option value="uk" className="bg-orange-800">Українська</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Main Content with Card-based Layout */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-8">
                {/* User Profile Card */}
                <div className="bg-gradient-to-br from-orange-800/50 to-orange-900/50 backdrop-blur-lg rounded-2xl p-6 shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
                    <h2 className="text-2xl font-bold text-orange-200 mb-4">{t.profile}</h2>
                    <div className="grid grid-cols-2 gap-4 text-orange-100">
                        <p>{t.weight}: {userData?.weight} кг</p>
                        <p>{t.height}: {userData?.height} см</p>
                        <p>{t.age}: {userData?.age}</p>
                        <p>{t.dietType}: {userData?.dietType}</p>
                    </div>
                </div>

                {/* Meal Plan Sections */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Weekly Plan Card */}
                    <div className="bg-gradient-to-br from-orange-900/60 to-orange-700/60 backdrop-blur-lg rounded-2xl p-6 shadow-2xl transform hover:scale-[1.03] transition-all duration-500">
                        <h3 className="text-3xl font-bold text-orange-200 mb-6">{t.weeklyPlan}</h3>
                        <Button
                            variant="contained"
                            className="bg-gradient-to-r from-orange-600 to-orange-800 text-white hover:from-orange-700 hover:to-orange-900 transform hover:scale-105 transition-all duration-300"
                            onClick={handleGenerateWeeklyPlan}
                        >
                            {isLoadingWeekly ? t.loading : t.generateWeeklyPlan}
                        </Button>
                        {/* Existing weekly plan rendering */}
                    </div>

                    {/* Daily Plan Card */}
                    <div className="bg-gradient-to-br from-orange-900/60 to-orange-700/60 backdrop-blur-lg rounded-2xl p-6 shadow-2xl transform hover:scale-[1.03] transition-all duration-500">
                        <h3 className="text-3xl font-bold text-orange-200 mb-6">{t.dailyPlan}</h3>
                        <Button
                            variant="contained"
                            className="bg-gradient-to-r from-orange-600 to-orange-800 text-white hover:from-orange-700 hover:to-orange-900 transform hover:scale-105 transition-all duration-300"
                            onClick={handleGenerateDailyPlan}
                        >
                            {isLoadingDaily ? t.loading : t.generateDailyPlan}
                        </Button>
                        {/* Existing daily plan rendering */}
                    </div>
                </div>
            </main>

            {/* Keep existing dialog and other components */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                PaperProps={{
                    className: "bg-gradient-to-br from-orange-900/80 to-orange-700/80 backdrop-blur-lg rounded-2xl"
                }}
            >
                {/* Existing dialog content */}
            </Dialog>
        </div>
    );
}
















