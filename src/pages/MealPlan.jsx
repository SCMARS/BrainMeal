import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    Stack,
    CardHeader,
    ListItemAvatar,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    useTheme,
    Snackbar,
    Alert,
    CircularProgress,
    Divider,
    Fab,
    GlobalStyles,
    useMediaQuery
} from '@mui/material';
import { 
    Add as AddIcon, 
    Delete as DeleteIcon, 
    Edit as EditIcon,
    Restaurant as RestaurantIcon,
    LocalDining as LocalDiningIcon,
    EmojiFoodBeverage as EmojiFoodBeverageIcon,
    Cake as CakeIcon,
    AccessTime as AccessTimeIcon,
    FitnessCenter as FitnessCenterIcon,
    LocalFireDepartment as LocalFireDepartmentIcon,
    WaterDrop as WaterDropIcon,
    FiberManualRecord as FiberManualRecordIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLanguage } from '../context/LanguageContext';
import { useMealPlan } from '../context/MealPlanContext';
import { useAuth } from '../context/AuthContext';
import { generateMealPlan } from "../services/geminiService.js";
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

const ScrollableContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    height: '100vh',
    overflowY: 'auto',
    position: 'relative',
    '&::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: theme.palette.background.paper,
    },
    '&::-webkit-scrollbar-thumb': {
        background: theme.palette.primary.main,
        borderRadius: '4px',
        '&:hover': {
            background: theme.palette.primary.dark,
        },
    },
    '&::-webkit-scrollbar-corner': {
        background: theme.palette.background.paper,
    }
}));

const StyledCard = styled(motion.create(Card))(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
    },
}));

const StyledDialog = styled(motion.create(Dialog))(({ theme }) => ({
    '& .MuiDialog-paper': {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    },
}));

const StyledTextField = styled(motion.create(TextField))(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
        color: theme.palette.text.primary,
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
        '&.Mui-focused': {
            color: theme.palette.primary.main,
        },
    },
}));

const MotionCard = motion.create(StyledCard);
const MotionDiv = motion.create('div');
const MotionBox = motion.create(Box);

const COLORS = ['#FF7849', '#FF9F7E', '#FFB39E', '#FFD1C2'];
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

const WeekViewContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(3),
    overflowX: 'auto',
    padding: theme.spacing(1),
    '&::-webkit-scrollbar': {
        height: '6px',
    },
    '&::-webkit-scrollbar-track': {
        background: theme.palette.background.paper,
    },
    '&::-webkit-scrollbar-thumb': {
        background: theme.palette.primary.main,
        borderRadius: '3px',
    },
}));

const DayCard = styled(Card)(({ theme, selected }) => ({
    minWidth: '120px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
}));

function MealPlan() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { user, userProfile } = useAuth();
    const { meals, generateMealPlan, updateMealPlan } = useMealPlan();
    
    // Основные состояния
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [userData, setUserData] = useState(null);
    
    // Состояния для диалога
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [mealName, setMealName] = useState('');
    const [mealTime, setMealTime] = useState('');
    const [mealType, setMealType] = useState('breakfast');
    
    // Состояния для плана питания
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
    const [isLoadingDaily, setIsLoadingDaily] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [weeklyStats, setWeeklyStats] = useState(null);
    const [groupedMeals, setGroupedMeals] = useState({
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
    });
    
    // Состояния для формы
    const [formData, setFormData] = useState({
        name: '',
        type: 'breakfast',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        notes: ''
    });

    const [selectedDay, setSelectedDay] = useState(new Date());
    const [weekDays, setWeekDays] = useState([]);

    // Обновляем сгруппированные блюда при изменении meals
    useEffect(() => {
        if (meals) {
            const newGroupedMeals = {
                breakfast: [],
                lunch: [],
                dinner: [],
                snack: []
            };
            
            meals.forEach(meal => {
                if (newGroupedMeals[meal.type]) {
                    newGroupedMeals[meal.type].push(meal);
                }
            });
            
            setGroupedMeals(newGroupedMeals);
        }
    }, [meals]);

    // Сохраняем план питания в localStorage при изменении groupedMeals
    useEffect(() => {
        if (groupedMeals) {
            const allMeals = Object.values(groupedMeals).flat();
            const mealPlan = {
                meals: allMeals,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        }
    }, [groupedMeals]);

    // Мемоизированные значения
    const dailyMeals = useMemo(() => {
        if (!meals) return [];
        return meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate.toDateString() === selectedDate.toDateString();
        });
    }, [meals, selectedDate]);

    const nutritionSummary = useMemo(() => {
        return dailyMeals.reduce((acc, meal) => ({
            calories: acc.calories + (Number(meal.calories) || 0),
            protein: acc.protein + (Number(meal.protein) || 0),
            carbs: acc.carbs + (Number(meal.carbs) || 0),
            fat: acc.fat + (Number(meal.fat) || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [dailyMeals]);

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
                    main: '#FF5722', // Темно-оранжевый
                    light: '#FF8A50',
                    dark: '#C41E3A'
                },
                secondary: {
                    main: '#FFA726', // Оранжевый
                    light: '#FFD95B',
                    dark: '#C77800'
                },
                background: {
                    default: darkMode ? '#1A1A1A' : '#FFF3E0',
                    paper: darkMode ? '#2D2D2D' : '#FFFFFF'
                }
            },
        }), [darkMode]);

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                
                // Загружаем данные пользователя
                const storedUserData = localStorage.getItem('userData');
                if (storedUserData) {
                    const parsedUserData = JSON.parse(storedUserData);
                    setUserData(parsedUserData);
                }

                // Загружаем план питания
                const storedMealPlan = localStorage.getItem('mealPlan');
                if (storedMealPlan) {
                    const parsedPlan = JSON.parse(storedMealPlan);
                    if (parsedPlan.meals && parsedPlan.meals.length > 0) {
                        const newGroupedMeals = {
                            breakfast: [],
                            lunch: [],
                            dinner: [],
                            snack: []
                        };

                        parsedPlan.meals.forEach(meal => {
                            if (meal.type && newGroupedMeals[meal.type]) {
                                newGroupedMeals[meal.type].push(meal);
                            }
                        });

                        setGroupedMeals(newGroupedMeals);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                setError(t('Failed to load meal plan'));
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [t]);

    // Обновляем useEffect для расчета недельной статистики
    useEffect(() => {
        const calculateWeeklyStats = async () => {
            try {
                const startDate = new Date(selectedDate);
                startDate.setDate(startDate.getDate() - startDate.getDay());
                const weekMeals = getMealsByWeek(startDate);

                const stats = weekMeals.reduce((acc, meal) => {
                    const day = new Date(meal.date).toLocaleDateString(language, { weekday: 'short' });
                    if (!acc[day]) {
                        acc[day] = {
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0,
                            meals: 0
                        };
                    }
                    acc[day].calories += Number(meal.calories) || 0;
                    acc[day].protein += Number(meal.protein) || 0;
                    acc[day].carbs += Number(meal.carbs) || 0;
                    acc[day].fat += Number(meal.fat) || 0;
                    acc[day].meals += 1;
                    return acc;
                }, {});

                setWeeklyStats(stats);
            } catch (error) {
                console.error('Error calculating weekly stats:', error);
            }
        };

        calculateWeeklyStats();
    }, [meals, selectedDate, language]);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const getMealTypeColor = (type) => {
        switch (type) {
            case 'breakfast':
                return '#FFB74D';
            case 'lunch':
                return '#4CAF50';
            case 'dinner':
                return '#2196F3';
            case 'snack':
                return '#9C27B0';
            default:
                return '#757575';
        }
    };

    const getMealTypeIcon = (type) => {
        switch (type) {
            case 'breakfast':
                return <EmojiFoodBeverageIcon />;
            case 'lunch':
                return <LocalDiningIcon />;
            case 'dinner':
                return <RestaurantIcon />;
            case 'snack':
                return <CakeIcon />;
            default:
                return <RestaurantIcon />;
        }
    };

    // Обновляем функцию renderNutritionChart
    const renderNutritionChart = () => {
        const data = [
            { name: t('Protein'), value: nutritionSummary.protein || 0 },
            { name: t('Carbs'), value: nutritionSummary.carbs || 0 },
            { name: t('Fat'), value: nutritionSummary.fat || 0 }
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
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value) => [`${value}g`, t('Amount')]}
                            contentStyle={{
                                background: muiTheme.palette.background.paper,
                                border: `1px solid ${muiTheme.palette.primary.main}30`,
                                borderRadius: '8px'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        );
    };

    // Обновляем функцию renderWeeklyStats
    const renderWeeklyStats = () => {
        if (!weeklyStats) return null;

        const data = Object.entries(weeklyStats).map(([day, stats]) => ({
            day,
            calories: stats.calories || 0,
            protein: stats.protein || 0,
            carbs: stats.carbs || 0,
            fat: stats.fat || 0
        }));

        return (
            <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={muiTheme.palette.primary.main + '20'} />
                        <XAxis 
                            dataKey="day" 
                            stroke={muiTheme.palette.primary.main}
                            tick={{ fill: muiTheme.palette.primary.main }}
                        />
                        <YAxis 
                            stroke={muiTheme.palette.primary.main}
                            tick={{ fill: muiTheme.palette.primary.main }}
                        />
                        <Tooltip 
                            contentStyle={{
                                background: muiTheme.palette.background.paper,
                                border: `1px solid ${muiTheme.palette.primary.main}30`,
                                borderRadius: '8px'
                            }}
                            formatter={(value, name) => [`${value}g`, t(name)]}
                        />
                        <Legend 
                            wrapperStyle={{
                                paddingTop: '20px',
                                color: muiTheme.palette.primary.main
                            }}
                        />
                        <Bar 
                            dataKey="calories" 
                            fill={COLORS[0]} 
                            name={t('Calories')}
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                            dataKey="protein" 
                            fill={COLORS[1]} 
                            name={t('Protein')}
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                            dataKey="carbs" 
                            fill={COLORS[2]} 
                            name={t('Carbs')}
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                            dataKey="fat" 
                            fill={COLORS[3]} 
                            name={t('Fat')}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        );
    };

    const getMealsByWeek = (startDate) => {
        if (!meals) return [];
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        return meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= startDate && mealDate <= endDate;
        });
    };

    const backHandler = () => {
        navigate("/profile");
    };

    const handleDateChange = (event) => {
        const newDate = new Date(event.target.value);
        setSelectedDate(newDate);
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

    const handleGeneratePlan = async () => {
        if (!userProfile) {
            setError('Пожалуйста, заполните профиль пользователя');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const generatedPlan = await generateMealPlan(userProfile, meals);
            updateMealPlan(generatedPlan.plan);
            
            // Обновляем дни недели после генерации плана
            setWeekDays(getWeekDays(selectedDay));
        } catch (err) {
            console.error('Error generating meal plan:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateWeeklyPlan = async () => {
        if (!userData) {
            console.error(t.userDataNotFound);
            return;
        }
        setIsLoadingWeekly(true);
        try {
            // Получаем все существующие приемы пищи
            const existingMeals = meals || [];
            const generatedPlan = await generateMealPlan({
                ...userData,
                isWeekly: true
            }, existingMeals);
            
            // Устанавливаем план питания
            setWeeklyPlan(generatedPlan.plan);
            setSelectedDate(new Date());
            setDailyPlan(null);
            
            // Сохраняем сгенерированный план
            localStorage.setItem('generatedMealPlan', JSON.stringify(generatedPlan));
        } catch (err) {
            console.error(err);
            setError(err.message);
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
            // Получаем приемы пищи за выбранный день
            const existingMeals = getMealsByDate(selectedDate) || [];
            const generatedPlan = await generateMealPlan({
                ...userData,
                isWeekly: false
            }, existingMeals);
            setDailyPlan(generatedPlan);
            setWeeklyPlan(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingDaily(false);
        }
    };

    const handleAddMeal = () => {
        setSelectedMeal(null);
        setMealName('');
        setMealTime('');
        setMealType('breakfast');
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            
            const newMeal = {
                ...formData,
                date: selectedDate.toISOString(),
                userId: user?.uid
            };

            if (editingMeal) {
                // Обновляем существующий прием пищи
                const updatedMeals = groupedMeals[editingMeal.type].map(meal => 
                    meal.id === editingMeal.id ? { ...meal, ...newMeal } : meal
                );
                setGroupedMeals(prev => ({
                    ...prev,
                    [editingMeal.type]: updatedMeals
                }));
            } else {
                // Добавляем новый прием пищи
                const newMealWithId = {
                    ...newMeal,
                    id: Date.now()
                };
                setGroupedMeals(prev => ({
                    ...prev,
                    [newMeal.type]: [...prev[newMeal.type], newMealWithId]
                }));
            }

            setSuccess(t('Meal saved successfully'));
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving meal:', error);
            setError(t('Failed to save meal'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMeal = (meal) => {
        const updatedMeals = { ...groupedMeals };
        updatedMeals[meal.type] = updatedMeals[meal.type].filter(m => m.id !== meal.id);
        setGroupedMeals(updatedMeals);
        setSuccess('Meal deleted successfully');
    };

    // Функция для получения дней недели
    const getWeekDays = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });
    };

    // Обновляем дни недели при изменении выбранной даты
    useEffect(() => {
        setWeekDays(getWeekDays(selectedDay));
    }, [selectedDay]);

    // Получаем блюда для выбранного дня
    const getMealsForDay = (date) => {
        if (!meals) return [];
        return meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate.toDateString() === date.toDateString();
        });
    };

    if (isLoading) {
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
            <ScrollableContainer>
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        height: '100vh',
                        overflowY: 'auto',
                        background: `linear-gradient(135deg, ${muiTheme.palette.background.default} 0%, ${muiTheme.palette.background.paper} 100%)`,
                        padding: '20px',
                        position: 'relative'
                    }}
                >
                    {/* Header Section */}
                    <MotionDiv
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mb: 4,
                            background: `linear-gradient(90deg, ${muiTheme.palette.primary.dark}20, transparent)`,
                            p: 3,
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold',
                                background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {t('Meal Plan')}
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                sx={{
                                    background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                                    color: 'white',
                                    '&:hover': {
                                        background: `linear-gradient(45deg, ${muiTheme.palette.primary.dark}, ${muiTheme.palette.secondary.dark})`,
                                        transform: 'scale(1.05)',
                                        transition: 'all 0.3s'
                                    }
                                }}
                            >
                                {t('Add Meal')}
                            </Button>
                        </Box>
                    </MotionDiv>

                    {/* Stats Section */}
                    <MotionDiv
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ 
                                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}20, ${muiTheme.palette.secondary.main}20)`,
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                                    }
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" color="primary" gutterBottom>
                                            {t('Daily Calories')}
                                        </Typography>
                                        <Typography variant="h3" sx={{ 
                                            fontWeight: 'bold',
                                            background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            {nutritionSummary.calories}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ 
                                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}20, ${muiTheme.palette.secondary.main}20)`,
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                                    }
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" color="primary" gutterBottom>
                                            {t('Protein')}
                                        </Typography>
                                        <Typography variant="h3" sx={{ 
                                            fontWeight: 'bold',
                                            background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            {nutritionSummary.protein}g
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ 
                                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}20, ${muiTheme.palette.secondary.main}20)`,
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                                    }
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" color="primary" gutterBottom>
                                            {t('Carbs')}
                                        </Typography>
                                        <Typography variant="h3" sx={{ 
                                            fontWeight: 'bold',
                                            background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            {nutritionSummary.carbs}g
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </MotionDiv>

                    {/* Charts Section */}
                    <MotionDiv
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ 
                                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}20, ${muiTheme.palette.secondary.main}20)`,
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                                    }
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" color="primary" gutterBottom>
                                            {t('Nutrition Distribution')}
                                        </Typography>
                                        {renderNutritionChart()}
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ 
                                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}20, ${muiTheme.palette.secondary.main}20)`,
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                                    }
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" color="primary" gutterBottom>
                                            {t('Weekly Progress')}
                                        </Typography>
                                        {renderWeeklyStats()}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </MotionDiv>

                    {/* Выбор недели */}
                    <Box sx={{ mb: 3 }}>
                        <DatePicker
                            label="Выберите неделю"
                            value={selectedDay}
                            onChange={(newValue) => setSelectedDay(newValue)}
                            views={['year', 'month', 'day']}
                            format="dd.MM.yyyy"
                        />
                    </Box>

                    {/* Дни недели */}
                    <WeekViewContainer>
                        {weekDays.map((day) => {
                            const dayMeals = getMealsForDay(day);
                            const isSelected = day.toDateString() === selectedDay.toDateString();
                            
                            return (
                                <DayCard
                                    key={day.toISOString()}
                                    selected={isSelected}
                                    onClick={() => setSelectedDay(day)}
                                >
                                    <CardContent>
                                        <Typography variant="subtitle1" align="center">
                                            {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                                        </Typography>
                                        <Typography variant="h6" align="center">
                                            {day.getDate()}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" align="center">
                                            {dayMeals.length} блюд
                                        </Typography>
                                    </CardContent>
                                </DayCard>
                            );
                        })}
                    </WeekViewContainer>

                    {/* Отображение блюд для выбранного дня */}
                    <Grid container spacing={3}>
                        {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                            const dayMeals = getMealsForDay(selectedDay);
                            const typeMeals = dayMeals.filter(meal => meal.type === type);
                            
                            return (
                                <Grid item xs={12} md={6} key={type}>
                                    <MotionCard>
                                        <CardHeader
                                            avatar={
                                                <Avatar sx={{ bgcolor: getMealTypeColor(type) }}>
                                                    {getMealTypeIcon(type)}
                                                </Avatar>
                                            }
                                            title={type.charAt(0).toUpperCase() + type.slice(1)}
                                            action={
                                                <IconButton onClick={() => handleAddMeal(type)}>
                                                    <AddIcon />
                                                </IconButton>
                                            }
                                        />
                                        <CardContent>
                                            <List>
                                                {typeMeals.map((meal) => (
                                                    <ListItem
                                                        key={meal.id}
                                                        secondaryAction={
                                                            <Box>
                                                                <IconButton
                                                                    edge="end"
                                                                    onClick={() => handleEditMeal(meal)}
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                                <IconButton
                                                                    edge="end"
                                                                    onClick={() => handleDeleteMeal(meal)}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Box>
                                                        }
                                                    >
                                                        <ListItemText
                                                            primary={meal.name}
                                                            secondary={
                                                                <Typography variant="body2" color="textSecondary">
                                                                    {meal.calories} ккал | 
                                                                    Б: {meal.protein}г | 
                                                                    У: {meal.carbs}г | 
                                                                    Ж: {meal.fat}г
                                                                </Typography>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                                {typeMeals.length === 0 && (
                                                    <ListItem>
                                                        <ListItemText
                                                            primary="Нет блюд"
                                                            secondary="Нажмите + чтобы добавить"
                                                        />
                                                    </ListItem>
                                                )}
                                            </List>
                                        </CardContent>
                                    </MotionCard>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Dialog */}
                    <StyledDialog
                        open={openDialog}
                        onClose={handleCloseDialog}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle sx={{
                            background: `linear-gradient(90deg, ${muiTheme.palette.primary.main}20, transparent)`,
                            borderBottom: `1px solid ${muiTheme.palette.primary.light}30`
                        }}>
                            {editingMeal ? t('Edit Meal') : t('Add New Meal')}
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ pt: 2 }}>
                                <StyledTextField
                                    fullWidth
                                    label={t('Meal Name')}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <StyledTextField
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
                                </StyledTextField>
                                <StyledTextField
                                    fullWidth
                                    type="number"
                                    label={t('Calories')}
                                    value={formData.calories}
                                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <StyledTextField
                                    fullWidth
                                    type="number"
                                    label={t('Protein (g)')}
                                    value={formData.protein}
                                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <StyledTextField
                                    fullWidth
                                    type="number"
                                    label={t('Carbs (g)')}
                                    value={formData.carbs}
                                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <StyledTextField
                                    fullWidth
                                    type="number"
                                    label={t('Fat (g)')}
                                    value={formData.fat}
                                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <StyledTextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label={t('Notes')}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={handleCloseDialog} color="inherit">
                                {t('Cancel')}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                sx={{
                                    background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                                    color: 'white',
                                    '&:hover': {
                                        background: `linear-gradient(45deg, ${muiTheme.palette.primary.dark}, ${muiTheme.palette.secondary.dark})`,
                                        transform: 'scale(1.05)',
                                        transition: 'all 0.3s'
                                    }
                                }}
                            >
                                {editingMeal ? t('Update') : t('Add')}
                            </Button>
                        </DialogActions>
                    </StyledDialog>

                    <Box sx={{ mb: 3 }}>
                        <Button
                            variant="contained"
                            onClick={handleGeneratePlan}
                            disabled={isLoading || !userProfile}
                            startIcon={isLoading ? <CircularProgress size={20} /> : null}
                        >
                            {isLoading ? 'Генерация...' : 'Сгенерировать план питания'}
                        </Button>
                        {!userProfile && (
                            <Typography color="error" sx={{ mt: 1 }}>
                                Пожалуйста, заполните профиль пользователя
                            </Typography>
                        )}
                    </Box>
                </MotionDiv>
            </ScrollableContainer>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}

export default MealPlan;
















