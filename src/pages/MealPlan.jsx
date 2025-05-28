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
    FiberManualRecord as FiberManualRecordIcon,
    AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLanguage } from '../context/LanguageContext';
import { useMealPlan } from '../context/MealPlanContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionLimit from '../components/SubscriptionLimit';
import { generateMealPlan } from "../services/geminiService.js";
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import NutritionCard from '../components/NutritionCard';
import DailyNutritionSummary from '../components/DailyNutritionSummary';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import SyncStatus from '../components/SyncStatus';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { getProfileDataForMealPlan } from '../services/profileService';

const ScrollableContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    height: '100vh',
    overflowY: 'auto',
    position: 'relative',
    scrollbarWidth: 'thin',
    scrollbarColor: '#ff6b35 rgba(26, 26, 26, 0.3)',
    '&::-webkit-scrollbar': {
        width: '12px',
        height: '12px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(45, 24, 16, 0.8) 50%, rgba(74, 44, 23, 0.8) 100%)',
        borderRadius: '10px',
        boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa726 100%)',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(255, 107, 53, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
            background: 'linear-gradient(135deg, #e55a2b 0%, #e57a35 50%, #ff9800 100%)',
            boxShadow: '0 0 15px rgba(255, 107, 53, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            transform: 'scale(1.1)',
        },
    },
    '&::-webkit-scrollbar-corner': {
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(45, 24, 16, 0.8) 50%, rgba(74, 44, 23, 0.8) 100%)',
    }
}));

const StyledCard = styled(Card)(({ theme }) => ({
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

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
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

const MotionCard = motion(Card);
const MotionDiv = motion.div;
const MotionBox = motion(Box);

const COLORS = ['#FF7849', '#FF9F7E', '#FFB39E', '#FFD1C2'];
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

const WeekViewContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(3),
    overflowX: 'auto',
    padding: theme.spacing(1),
    scrollbarWidth: 'thin',
    scrollbarColor: '#ff6b35 rgba(26, 26, 26, 0.3)',
    '&::-webkit-scrollbar': {
        height: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'rgba(26, 26, 26, 0.3)',
        borderRadius: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(90deg, #ff6b35, #ff8c42)',
        borderRadius: '6px',
        '&:hover': {
            background: 'linear-gradient(90deg, #e55a2b, #e57a35)',
        },
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
    const { meals, generateMealPlan, updateMealPlan, addMeal, updateMeal, deleteMeal, generateSingleMeal } = useMealPlan();
    const {
        canCreateMealPlan,
        canCreateWeeklyPlan,
        canGenerate,
        incrementMealPlanCount,
        incrementWeeklyPlanCount,
        incrementGenerationCount,
        remainingMealPlans,
        getRemainingWeeklyPlans,
        getRemainingGenerations,
        weeklyPlansCount,
        totalGenerations,
        isActive,
        hasFeature
    } = useSubscription();

    // Основные состояния
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [userData, setUserData] = useState(null);
    const [showProfilePrompt, setShowProfilePrompt] = useState(false);

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
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        meal: null
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
        console.log('useEffect meals changed:', meals);
        if (meals) {
            const newGroupedMeals = {
                breakfast: [],
                lunch: [],
                dinner: [],
                snack: []
            };

            meals.forEach(meal => {
                console.log('Processing meal:', meal);
                if (newGroupedMeals[meal.type]) {
                    newGroupedMeals[meal.type].push(meal);
                }
            });

            console.log('New grouped meals:', newGroupedMeals);
            setGroupedMeals(newGroupedMeals);
        } else {
            console.log('No meals found');
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
                return '#ff6b35';
            case 'lunch':
                return '#ff8c42';
            case 'dinner':
                return '#ffa726';
            case 'snack':
                return '#ffb74d';
            default:
                return '#ff6b35';
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
        try {
            setIsLoading(true);
            setError(null);

            if (!user) {
                throw new Error('Пожалуйста, войдите в систему');
            }

            // Проверяем лимиты подписки для недельных планов
            if (!canCreateWeeklyPlan()) {
                const remaining = getRemainingWeeklyPlans();
                setError(`Достигнут лимит недельных планов (${weeklyPlansCount}/5). Осталось: ${remaining}. Обновите подписку для безлимитного доступа.`);
                return;
            }

            // Получаем данные профиля
            const profileData = await getProfileDataForMealPlan(user);

            if (!profileData) {
                navigate('/profile');
                throw new Error('Пожалуйста, заполните профиль перед генерацией плана питания');
            }

            // Генерируем план питания
            const generatedPlan = await generateMealPlan(profileData);

            if (!generatedPlan || !generatedPlan.plan) {
                throw new Error('Не удалось сгенерировать план питания');
            }

            // Увеличиваем счетчик недельных планов для бесплатных пользователей
            if (!isActive) {
                await incrementWeeklyPlanCount();
            }

            // Сохраняем план
            console.log('Updating meal plan with:', generatedPlan);
            await updateMealPlan(generatedPlan);

            setSuccess('План питания успешно сгенерирован');

            // Увеличиваем счетчик сгенерированных планов для достижений
            const currentCount = parseInt(localStorage.getItem('mealPlanCount') || '0');
            localStorage.setItem('mealPlanCount', (currentCount + 1).toString());

        } catch (err) {
            console.error('Error generating meal plan:', err);

            let errorMessage = err.message || 'Ошибка при генерации плана питания';

            // Обрабатываем специфичные ошибки
            if (err.message.includes('необходимо заполнить')) {
                errorMessage = 'Необходимо заполнить профиль. Переходим к настройкам профиля...';
                setShowProfilePrompt(true);
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Функция генерации отдельного блюда
    const handleGenerateSingleMeal = async (mealType) => {
        try {
            setIsLoading(true);
            setError(null);

            if (!user) {
                throw new Error('Пожалуйста, войдите в систему');
            }

            // Проверяем лимиты подписки для генерации
            if (!canGenerate()) {
                const remaining = getRemainingGenerations();
                setError(`Достигнут лимит генераций (${totalGenerations}/5). Осталось: ${remaining}. Обновите подписку для безлимитного доступа.`);
                return;
            }

            // Получаем данные профиля
            const profileData = await getProfileDataForMealPlan(user);

            if (!profileData) {
                navigate('/profile');
                throw new Error('Пожалуйста, заполните профиль перед генерацией блюда');
            }

            // Генерируем отдельное блюдо
            const generatedMeal = await generateSingleMeal(mealType, profileData, selectedDate);

            if (!generatedMeal) {
                throw new Error('Не удалось сгенерировать блюдо');
            }

            // Увеличиваем счетчик генераций для бесплатных пользователей
            if (!isActive) {
                await incrementGenerationCount();
            }

            setSuccess(`${getMealTypeName(mealType)} успешно сгенерирован`);

        } catch (err) {
            console.error('Error generating single meal:', err);

            let errorMessage = err.message || 'Ошибка при генерации блюда';

            if (err.message.includes('необходимо заполнить')) {
                errorMessage = 'Необходимо заполнить профиль. Переходим к настройкам профиля...';
                setShowProfilePrompt(true);
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Функция для получения названия типа блюда
    const getMealTypeName = (type) => {
        switch (type) {
            case 'breakfast':
                return t('Breakfast');
            case 'lunch':
                return t('Lunch');
            case 'dinner':
                return t('Dinner');
            case 'snack':
                return t('Snack');
            default:
                return t('Meal');
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

    const handleAddMeal = (type = 'breakfast') => {
        setEditingMeal(null);
        setFormData({
            name: '',
            type: type,
            calories: '',
            protein: '',
            carbs: '',
            fat: '',
            time: '12:00',
            notes: ''
        });
        setOpenDialog(true);
    };

    const handleEditMeal = (meal) => {
        setEditingMeal(meal);
        setFormData({
            name: meal.name || '',
            type: meal.type || 'breakfast',
            calories: meal.calories || '',
            protein: meal.protein || '',
            carbs: meal.carbs || '',
            fat: meal.fat || '',
            time: meal.time || '12:00',
            notes: meal.notes || ''
        });
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            // Валидация данных
            if (!formData.name.trim()) {
                setError('Название блюда обязательно');
                return;
            }

            const mealData = {
                ...formData,
                date: selectedDay.toISOString(),
                userId: user?.uid,
                calories: Number(formData.calories) || 0,
                protein: Number(formData.protein) || 0,
                carbs: Number(formData.carbs) || 0,
                fat: Number(formData.fat) || 0,
                updatedAt: new Date().toISOString()
            };

            if (editingMeal) {
                // Обновляем существующий прием пищи через Firebase
                await updateMeal(editingMeal.id, mealData);
                setSuccess('Блюдо успешно обновлено! 🎉');
            } else {
                // Добавляем новый прием пищи через Firebase
                await addMeal(mealData);
                setSuccess('Новое блюдо добавлено! 🍽️');
            }

            handleCloseDialog();
        } catch (error) {
            console.error('Error saving meal:', error);
            setError('Ошибка при сохранении блюда');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMeal = (meal) => {
        setDeleteDialog({
            open: true,
            meal: meal
        });
    };

    const confirmDeleteMeal = async () => {
        try {
            setIsLoading(true);

            const meal = deleteDialog.meal;
            if (!meal) return;

            // Удаляем блюдо через Firebase
            await deleteMeal(meal.id);

            setSuccess(`Блюдо "${meal.name}" удалено! 🗑️`);
            setDeleteDialog({ open: false, meal: null });
        } catch (error) {
            console.error('Error deleting meal:', error);
            setError('Ошибка при удалении блюда');
        } finally {
            setIsLoading(false);
        }
    };

    const cancelDeleteMeal = () => {
        setDeleteDialog({ open: false, meal: null });
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
        if (!meals || !date) {
            return [];
        }

        // Нормализуем дату для сравнения (убираем время)
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const filteredMeals = meals.filter(meal => {
            if (!meal.date) return false;

            const mealDate = new Date(meal.date);
            mealDate.setHours(0, 0, 0, 0);

            return mealDate.getTime() === targetDate.getTime();
        });

        return filteredMeals;
    };

    // Расчет дневной статистики КБЖУ
    const getDailyNutrition = (date) => {
        const dayMeals = getMealsForDay(date);
        return dayMeals.reduce((total, meal) => ({
            calories: total.calories + (Number(meal.calories) || 0),
            protein: total.protein + (Number(meal.protein) || 0),
            carbs: total.carbs + (Number(meal.carbs) || 0),
            fat: total.fat + (Number(meal.fat) || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
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
            <Box sx={{
                height: '100vh',
                overflow: 'auto',
                pb: { xs: '120px', sm: '20px' }, // Больше отступа снизу на мобильных
                '&::-webkit-scrollbar': {
                    width: { xs: '8px', sm: '12px' }, // Тоньше скроллбар на мобильных
                },
                '&::-webkit-scrollbar-track': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    margin: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                    borderRadius: '6px',
                    border: '2px solid rgba(255,255,255,0.1)',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #e55a2b, #e8851a)',
                        border: '2px solid rgba(255,255,255,0.2)',
                    },
                },
            }}>
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
                        position: 'relative',
                        minHeight: '250vh', // Увеличиваем для лучшего скролла на мобильных
                        paddingBottom: '150px' // Добавляем отступ снизу для мобильных устройств
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
                                startIcon={isLoading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                                onClick={handleGeneratePlan}
                                disabled={isLoading || !userProfile}
                                sx={{
                                    background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                                    color: 'white',
                                    '&:hover': {
                                        background: `linear-gradient(45deg, ${muiTheme.palette.primary.dark}, ${muiTheme.palette.secondary.dark})`,
                                        transform: 'scale(1.05)',
                                        transition: 'all 0.3s'
                                    },
                                    '&:disabled': {
                                        background: 'rgba(0,0,0,0.12)',
                                        color: 'rgba(0,0,0,0.26)'
                                    }
                                }}
                            >
                                {isLoading ? t('loading') : t('generateMealPlan')}
                            </Button>
                        </Box>

                        {/* Статус синхронизации */}
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                            <SyncStatus
                                isLoading={isLoading}
                                error={error}
                                lastSync={meals.length > 0 ? new Date().toISOString() : null}
                                totalMeals={meals.length}
                            />
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

                    {/* Ограничения подписки для недельных планов */}
                    {!canCreateWeeklyPlan() && (
                        <MotionDiv
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            style={{ marginBottom: '2rem' }}
                        >
                            <SubscriptionLimit
                                feature="maxWeeklyPlans"
                                title={t('weeklyPlanLimitReached')}
                                description={t('upgradeToCreateMoreWeeklyPlans')}
                                showProgress={true}
                            />
                        </MotionDiv>
                    )}

                    {/* Ограничения подписки для генераций */}
                    {!canGenerate() && canCreateWeeklyPlan() && (
                        <MotionDiv
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            style={{ marginBottom: '2rem' }}
                        >
                            <SubscriptionLimit
                                feature="maxGenerations"
                                title={t('generationLimitReached')}
                                description={t('upgradeToContinueGenerating')}
                                showProgress={true}
                            />
                        </MotionDiv>
                    )}

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
                            const dayNutrition = getDailyNutrition(day);
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
                                            {dayMeals.length} {t('meals')}
                                        </Typography>
                                        {dayNutrition.calories > 0 && (
                                            <NutritionCard
                                                calories={dayNutrition.calories}
                                                protein={dayNutrition.protein}
                                                carbs={dayNutrition.carbs}
                                                fat={dayNutrition.fat}
                                                targetCalories={userProfile?.calorieTarget || 2000}
                                                compact={true}
                                                showProgress={false}
                                            />
                                        )}
                                    </CardContent>
                                </DayCard>
                            );
                        })}
                    </WeekViewContainer>

                    {/* Дневная сводка питания */}
                    {getMealsForDay(selectedDay).length > 0 && (
                        <DailyNutritionSummary
                            meals={getMealsForDay(selectedDay)}
                            targetCalories={userProfile?.calorieTarget || 2000}
                        />
                    )}

                    {/* Отображение блюд для выбранного дня */}
                    <Grid container spacing={3}>
                        {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                            const dayMeals = getMealsForDay(selectedDay);
                            const typeMeals = dayMeals.filter(meal => meal.type === type);

                            return (
                                <Grid item xs={12} md={6} key={type}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * ['breakfast', 'lunch', 'dinner', 'snack'].indexOf(type) }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <Card sx={{
                                            background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 50%, rgba(74, 44, 23, 0.95) 100%)',
                                            backdropFilter: 'blur(20px)',
                                            borderRadius: 3,
                                            boxShadow: `
                                                0 15px 30px rgba(0,0,0,0.3),
                                                0 0 0 1px ${getMealTypeColor(type)}30
                                            `,
                                            border: `2px solid ${getMealTypeColor(type)}40`,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: `linear-gradient(90deg, ${getMealTypeColor(type)}, ${getMealTypeColor(type)}80)`,
                                                zIndex: 1
                                            }
                                        }}>
                                            <CardHeader
                                                avatar={
                                                    <motion.div
                                                        animate={{
                                                            scale: [1, 1.1, 1],
                                                            rotate: [0, 5, -5, 0]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            repeatDelay: 3
                                                        }}
                                                    >
                                                        <Avatar sx={{
                                                            bgcolor: getMealTypeColor(type),
                                                            boxShadow: `0 0 15px ${getMealTypeColor(type)}50`
                                                        }}>
                                                            {getMealTypeIcon(type)}
                                                        </Avatar>
                                                    </motion.div>
                                                }
                                                title={
                                                    <Typography sx={{
                                                        color: getMealTypeColor(type),
                                                        fontWeight: 'bold',
                                                        fontSize: '1.2rem'
                                                    }}>
                                                        {t(type.charAt(0).toUpperCase() + type.slice(1))}
                                                    </Typography>
                                                }
                                                action={
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <motion.div
                                                            whileTap={{ scale: 0.95 }}
                                                            whileHover={{ scale: 1.1 }}
                                                        >
                                                            <IconButton
                                                                onClick={() => handleGenerateSingleMeal(type)}
                                                                disabled={isLoading}
                                                                sx={{
                                                                    background: `${getMealTypeColor(type)}15`,
                                                                    color: getMealTypeColor(type),
                                                                    '&:hover': {
                                                                        background: `${getMealTypeColor(type)}25`,
                                                                        boxShadow: `0 0 15px ${getMealTypeColor(type)}40`
                                                                    },
                                                                    '&:disabled': {
                                                                        opacity: 0.5
                                                                    }
                                                                }}
                                                                title={`Сгенерировать ${getMealTypeName(type).toLowerCase()}`}
                                                            >
                                                                <AutoAwesomeIcon />
                                                            </IconButton>
                                                        </motion.div>
                                                        <motion.div
                                                            whileTap={{ scale: 0.95 }}
                                                            whileHover={{ scale: 1.1 }}
                                                        >
                                                            <IconButton
                                                                onClick={() => handleAddMeal(type)}
                                                                sx={{
                                                                    background: `${getMealTypeColor(type)}20`,
                                                                    color: getMealTypeColor(type),
                                                                    '&:hover': {
                                                                        background: `${getMealTypeColor(type)}30`,
                                                                        boxShadow: `0 0 15px ${getMealTypeColor(type)}50`
                                                                    }
                                                                }}
                                                                title={`Добавить ${getMealTypeName(type).toLowerCase()}`}
                                                            >
                                                                <AddIcon />
                                                            </IconButton>
                                                        </motion.div>
                                                    </Box>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                        <CardContent>
                                            <List
                                                className="list-scroll"
                                                sx={{
                                                    maxHeight: 400,
                                                    overflow: 'auto',
                                                    scrollbarWidth: 'thin',
                                                    scrollbarColor: '#ff6b35 rgba(26, 26, 26, 0.3)'
                                                }}
                                            >
                                                {typeMeals.map((meal) => (
                                                    <ListItem
                                                        key={meal.id}
                                                        secondaryAction={
                                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                <motion.div
                                                                    whileTap={{ scale: 0.95 }}
                                                                    whileHover={{ scale: 1.1 }}
                                                                >
                                                                    <IconButton
                                                                        edge="end"
                                                                        onClick={() => handleEditMeal(meal)}
                                                                        sx={{
                                                                            background: 'rgba(255, 140, 66, 0.1)',
                                                                            color: '#ff8c42',
                                                                            '&:hover': {
                                                                                background: 'rgba(255, 140, 66, 0.2)',
                                                                                boxShadow: '0 0 15px rgba(255, 140, 66, 0.3)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                </motion.div>
                                                                <motion.div
                                                                    whileTap={{ scale: 0.95 }}
                                                                    whileHover={{ scale: 1.1 }}
                                                                >
                                                                    <IconButton
                                                                        edge="end"
                                                                        onClick={() => handleDeleteMeal(meal)}
                                                                        sx={{
                                                                            background: 'rgba(244, 67, 54, 0.1)',
                                                                            color: '#f44336',
                                                                            '&:hover': {
                                                                                background: 'rgba(244, 67, 54, 0.2)',
                                                                                boxShadow: '0 0 15px rgba(244, 67, 54, 0.3)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </motion.div>
                                                            </Box>
                                                        }
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                                    {meal.name}
                                                                </Typography>
                                                            }
                                                            secondary={
                                                                <Box sx={{ mt: 1 }}>
                                                                    <NutritionCard
                                                                        calories={meal.calories}
                                                                        protein={meal.protein}
                                                                        carbs={meal.carbs}
                                                                        fat={meal.fat}
                                                                        compact={true}
                                                                        showProgress={false}
                                                                    />
                                                                    {meal.time && (
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                color: '#ff8c42',
                                                                                fontWeight: 'bold',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 0.5,
                                                                                mt: 1
                                                                            }}
                                                                        >
                                                                            <AccessTimeIcon sx={{ fontSize: '0.8rem' }} />
                                                                            {meal.time}
                                                                        </Typography>
                                                                    )}
                                                                    {meal.ingredients && meal.ingredients.length > 0 && (
                                                                        <Box sx={{ mt: 1 }}>
                                                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, display: 'block' }}>
                                                                                {t('Ingredients')}:
                                                                            </Typography>
                                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                                {meal.ingredients.slice(0, 3).map((ingredient, i) => (
                                                                                    <Chip
                                                                                        key={i}
                                                                                        label={ingredient}
                                                                                        size="small"
                                                                                        sx={{
                                                                                            backgroundColor: 'rgba(255, 107, 53, 0.2)',
                                                                                            color: 'white',
                                                                                            fontWeight: 'bold',
                                                                                            fontSize: '0.7rem',
                                                                                            height: '20px'
                                                                                        }}
                                                                                    />
                                                                                ))}
                                                                                {meal.ingredients.length > 3 && (
                                                                                    <Chip
                                                                                        label={`+${meal.ingredients.length - 3}`}
                                                                                        size="small"
                                                                                        sx={{
                                                                                            backgroundColor: 'rgba(255, 107, 53, 0.3)',
                                                                                            color: 'white',
                                                                                            fontSize: '0.7rem',
                                                                                            height: '20px'
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                                {typeMeals.length === 0 && (
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={t('noMeals')}
                                                            secondary={t('clickPlusToAdd')}
                                                        />
                                                    </ListItem>
                                                )}
                                            </List>
                                        </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Dialog */}
                    <Dialog
                        open={openDialog}
                        onClose={handleCloseDialog}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: {
                                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 50%, rgba(74, 44, 23, 0.95) 100%)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: 4,
                                boxShadow: `
                                    0 25px 50px rgba(0,0,0,0.3),
                                    0 0 0 1px rgba(255, 107, 53, 0.2)
                                `,
                                border: '2px solid rgba(255, 107, 53, 0.3)',
                            }
                        }}
                    >
                        <DialogTitle sx={{
                            background: 'linear-gradient(90deg, rgba(255, 107, 53, 0.2), transparent)',
                            borderBottom: '1px solid rgba(255, 107, 53, 0.3)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            >
                                🍽️
                            </motion.div>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {editingMeal ? 'Редактировать блюдо' : 'Добавить новое блюдо'}
                            </Typography>
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
                    </Dialog>

                    {/* Диалог подтверждения удаления */}
                    <DeleteConfirmDialog
                        open={deleteDialog.open}
                        onClose={cancelDeleteMeal}
                        onConfirm={confirmDeleteMeal}
                        title="Удаление блюда"
                        message="Вы уверены, что хотите удалить это блюдо из плана питания?"
                        itemName={deleteDialog.meal?.name}
                        loading={isLoading}
                    />


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

            {/* Диалог для перехода к профилю */}
            <Dialog
                open={showProfilePrompt}
                onClose={() => setShowProfilePrompt(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Необходимо заполнить профиль
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Для создания плана питания необходимо указать:
                    </Typography>
                    <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                        <li>Пол</li>
                        <li>Уровень активности</li>
                        <li>Тип диеты</li>
                        <li>Возраст, вес, рост</li>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowProfilePrompt(false)}>
                        Отмена
                    </Button>
                    <Button
                        onClick={() => {
                            setShowProfilePrompt(false);
                            navigate('/profile');
                        }}
                        variant="contained"
                    >
                        Перейти к профилю
                    </Button>
                </DialogActions>
            </Dialog>
            </Box>
        </ThemeProvider>
    );
}

export default MealPlan;

