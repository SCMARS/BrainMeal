import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    IconButton,
    useTheme,
    Tooltip,
    Paper,
    Snackbar,
    Tabs,
    Tab,
    Divider,
    Switch,
    FormControlLabel,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Alert,
    Fab
} from '@mui/material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    ComposedChart,
    Scatter,
    ScatterChart,
    ZAxis,
    Brush,
    ReferenceArea,
    ReferenceLine
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TimelineIcon from '@mui/icons-material/Timeline';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoIcon from '@mui/icons-material/Info';
import { useMealPlan } from '../context/MealPlanContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionLimit from '../components/SubscriptionLimit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import regression from 'regression';

const Analytics = () => {
    const theme = useTheme();
    const { t } = useLanguage();
    const { meals, getMealsByWeek, getNutritionSummary } = useMealPlan();
    const { userProfile } = useAuth();
    const { hasFeature } = useSubscription();
    const analyticsRef = useRef(null);
    const chartRef = useRef(null);

    // Состояния для основных данных
    const [timeRange, setTimeRange] = useState('week');
    const [chartData, setChartData] = useState([]);
    const [nutritionData, setNutritionData] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [isLoading, setIsLoading] = useState(false);

    // Состояния для расширенных функций
    const [tabValue, setTabValue] = useState(0);
    const [openFilterDialog, setOpenFilterDialog] = useState(false);
    const [openCompareDialog, setOpenCompareDialog] = useState(false);
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
    const [autoUpdate, setAutoUpdate] = useState(false);
    const [updateInterval, setUpdateInterval] = useState(30); // в секундах
    const [intervalId, setIntervalId] = useState(null);

    // Фильтры
    const [filters, setFilters] = useState({
        mealTypes: ['breakfast', 'lunch', 'dinner', 'snack'],
        nutrients: ['calories', 'protein', 'carbs', 'fat'],
        timeOfDay: ['morning', 'afternoon', 'evening', 'night'],
        minCalories: 0,
        maxCalories: 3000,
    });

    // Настройки сравнения
    const [compareMode, setCompareMode] = useState(false);
    const [compareDates, setCompareDates] = useState({
        currentStart: new Date(),
        currentEnd: new Date(),
        compareStart: new Date(new Date().setDate(new Date().getDate() - 14)),
        compareEnd: new Date(new Date().setDate(new Date().getDate() - 7)),
    });
    const [compareData, setCompareData] = useState([]);

    // Настройки визуализации
    const [chartSettings, setChartSettings] = useState({
        showGrid: true,
        lineType: 'monotone',
        colors: {
            calories: '#FF7849',
            protein: '#FF9F7E',
            carbs: '#FFB39E',
            fat: '#FFD1C2'
        },
        showTrends: false,
        showAverages: false,
        chartType: 'line'
    });

    // Данные для прогнозов
    const [predictions, setPredictions] = useState([]);
    const [showPredictions, setShowPredictions] = useState(false);

    // Добавляем состояние для отслеживания видимости кнопки прокрутки
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Обработчик изменения вкладок
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Функция обновления аналитики
    const refreshAnalytics = () => {
        setIsLoading(true);
        setTimeout(() => {
            loadData();
            setIsLoading(false);
            setSnackbar({
                open: true,
                message: t('Analytics data refreshed'),
                severity: 'success'
            });
        }, 600);
    };

    // Включение/выключение автообновления
    useEffect(() => {
        if (autoUpdate && !intervalId) {
            const id = setInterval(() => {
                refreshAnalytics();
            }, updateInterval * 1000);
            setIntervalId(id);
            setSnackbar({
                open: true,
                message: t('Auto-update enabled, interval: ') + updateInterval + t(' seconds'),
                severity: 'info'
            });
        } else if (!autoUpdate && intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
            setSnackbar({
                open: true,
                message: t('Auto-update disabled'),
                severity: 'info'
            });
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [autoUpdate, updateInterval]);

    // Функция экспорта данных в различные форматы
    const exportData = (format) => {
        switch (format) {
            case 'csv':
                const csvContent = "data:text/csv;charset=utf-8,"
                    + "date,calories,protein,carbs,fat\n"
                    + chartData.map(row =>
                        `${row.date},${row.calories},${row.protein},${row.carbs},${row.fat}`
                    ).join("\n");

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `nutrition_data_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                break;

            case 'excel':
                const worksheet = XLSX.utils.json_to_sheet(chartData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Nutrition Data");
                XLSX.writeFile(workbook, `nutrition_data_${new Date().toISOString().split('T')[0]}.xlsx`);
                break;

            case 'pdf':
                const pdf = new jsPDF();
                pdf.text(t('Nutrition Analysis Report'), 20, 10);
                pdf.text(`${t('Generated on')}: ${new Date().toLocaleDateString()}`, 20, 20);

                const tableData = chartData.map(item => [
                    item.date,
                    item.calories,
                    item.protein,
                    item.carbs,
                    item.fat
                ]);

                pdf.autoTable({
                    head: [['Date', 'Calories', 'Protein', 'Carbs', 'Fat']],
                    body: tableData,
                    startY: 30
                });

                pdf.save(`nutrition_report_${new Date().toISOString().split('T')[0]}.pdf`);
                break;

            case 'image':
                if (chartRef.current) {
                    const svgElement = chartRef.current.container.children[0];
                    const svgData = new XMLSerializer().serializeToString(svgElement);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        const pngData = canvas.toDataURL('image/png');
                        const downloadLink = document.createElement('a');
                        downloadLink.href = pngData;
                        downloadLink.download = `nutrition_chart_${new Date().toISOString().split('T')[0]}.png`;
                        downloadLink.click();
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                }
                break;
        }

        setOpenExportDialog(false);
        setSnackbar({
            open: true,
            message: t('Data exported successfully as ') + format.toUpperCase(),
            severity: 'success'
        });
    };

    // Функция получения активных данных для графика
    const getActiveChartData = () => {
        if (compareMode) {
            return compareData;
        }
        return chartData;
    };

    // Функция применения фильтров
    const applyFilters = (data) => {
        return data.filter(item => {
            // Фильтр по калориям
            if (item.calories < filters.minCalories || item.calories > filters.maxCalories) {
                return false;
            }

            // Фильтр по типам приемов пищи
            if (item.meals && item.meals.length > 0) {
                const mealTypes = item.meals.map(meal => meal.type);
                const hasSelectedTypes = mealTypes.some(type => filters.mealTypes.includes(type));
                if (!hasSelectedTypes) {
                    return false;
                }
            }

            // Фильтр по времени суток
            if (item.meals && item.meals.length > 0) {
                const timeOfDay = item.meals.map(meal => {
                    const hour = new Date(meal.time).getHours();
                    if (hour >= 5 && hour < 12) return 'morning';
                    if (hour >= 12 && hour < 17) return 'afternoon';
                    if (hour >= 17 && hour < 22) return 'evening';
                    return 'night';
                });
                const hasSelectedTime = timeOfDay.some(time => filters.timeOfDay.includes(time));
                if (!hasSelectedTime) {
                    return false;
                }
            }

            return true;
        });
    };

    // Функция генерации прогнозов
    const generatePredictions = (data) => {
        if (data.length < 3) return;

        const predictions = [];
        const lastDate = new Date(data[data.length - 1].date);
        const nutrients = ['calories', 'protein', 'carbs', 'fat'];

        nutrients.forEach(nutrient => {
            const values = data.map(item => item[nutrient]);
            const result = regression.linear(
                values.map((value, index) => [index, value])
            );

            // Прогноз на следующие 7 дней
            for (let i = 1; i <= 7; i++) {
                const predictionDate = new Date(lastDate);
                predictionDate.setDate(lastDate.getDate() + i);
                const predictedValue = result.predict([data.length + i - 1])[1];

                predictions.push({
                    date: predictionDate.toISOString().split('T')[0],
                    [nutrient]: Math.round(predictedValue),
                    isPrediction: true
                });
            }
        });

        setPredictions(predictions);
    };

    // Функция загрузки данных
    const loadData = () => {
        try {
            setIsLoading(true);
            const today = new Date();
            let startDate = new Date();
            let endDate = new Date();

            // Определяем диапазон дат в зависимости от выбранного периода
            switch (timeRange) {
                case 'week':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(today.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(today.getFullYear() - 1);
                    break;
                default:
                    startDate.setDate(today.getDate() - 7);
            }

            // Получаем данные о приемах пищи из контекста
            const mealsData = meals || [];

            // Фильтруем данные по выбранному периоду
            const filteredMeals = mealsData.filter(meal => {
                const mealDate = new Date(meal.date);
                return mealDate >= startDate && mealDate <= endDate;
            });

            // Группируем данные по дням с улучшенной обработкой
            const groupedData = {};
            filteredMeals.forEach(meal => {
                const date = new Date(meal.date).toISOString().split('T')[0];
                if (!groupedData[date]) {
                    groupedData[date] = {
                        date,
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fat: 0,
                        meals: [],
                        mealTypes: {
                            breakfast: { count: 0, calories: 0, protein: 0, carbs: 0, fat: 0 },
                            lunch: { count: 0, calories: 0, protein: 0, carbs: 0, fat: 0 },
                            dinner: { count: 0, calories: 0, protein: 0, carbs: 0, fat: 0 },
                            snack: { count: 0, calories: 0, protein: 0, carbs: 0, fat: 0 }
                        },
                        ingredientsCount: 0,
                        uniqueIngredients: new Set(),
                        targetAccuracy: {
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0
                        }
                    };
                }

                // Безопасное преобразование в числа
                const calories = Number(meal.calories) || 0;
                const protein = Number(meal.protein) || 0;
                const carbs = Number(meal.carbs) || 0;
                const fat = Number(meal.fat) || 0;

                groupedData[date].calories += calories;
                groupedData[date].protein += protein;
                groupedData[date].carbs += carbs;
                groupedData[date].fat += fat;
                groupedData[date].meals.push(meal);

                // Анализ по типам приемов пищи
                const mealType = meal.type?.toLowerCase() || 'snack';
                if (groupedData[date].mealTypes[mealType]) {
                    groupedData[date].mealTypes[mealType].count++;
                    groupedData[date].mealTypes[mealType].calories += calories;
                    groupedData[date].mealTypes[mealType].protein += protein;
                    groupedData[date].mealTypes[mealType].carbs += carbs;
                    groupedData[date].mealTypes[mealType].fat += fat;
                }

                // Анализ ингредиентов с точными граммами
                if (meal.ingredients && Array.isArray(meal.ingredients)) {
                    meal.ingredients.forEach(ingredient => {
                        groupedData[date].uniqueIngredients.add(ingredient);
                        groupedData[date].ingredientsCount++;
                    });
                }

                // Анализ детальной информации о питании
                if (meal.detailed_nutrition && Array.isArray(meal.detailed_nutrition)) {
                    meal.detailed_nutrition.forEach(item => {
                        if (item.ingredient && item.weight) {
                            groupedData[date].uniqueIngredients.add(`${item.ingredient}: ${item.weight}`);
                        }
                    });
                }
            });

            // Преобразуем в массив для графика с дополнительной обработкой
            const chartDataArray = Object.values(groupedData).map(day => ({
                ...day,
                uniqueIngredients: Array.from(day.uniqueIngredients), // Преобразуем Set в массив
                uniqueIngredientsCount: day.uniqueIngredients.size
            })).sort((a, b) =>
                new Date(a.date) - new Date(b.date)
            );

            // Добавляем данные о питательных веществах с расширенной аналитикой
            const nutritionDataArray = chartDataArray.map(day => ({
                date: day.date,
                calories: day.calories,
                protein: day.protein,
                carbs: day.carbs,
                fat: day.fat,
                meals: day.meals,
                mealTypes: day.mealTypes,
                ingredientsCount: day.ingredientsCount,
                uniqueIngredients: day.uniqueIngredients,
                uniqueIngredientsCount: day.uniqueIngredientsCount,
                // Расчет точности попадания в цель (если есть профиль пользователя)
                accuracy: userProfile ? {
                    calories: userProfile.calorieTarget ? Math.abs(day.calories - userProfile.calorieTarget) / userProfile.calorieTarget * 100 : 0,
                    protein: userProfile.targetProtein ? Math.abs(day.protein - userProfile.targetProtein) / userProfile.targetProtein * 100 : 0,
                    carbs: userProfile.targetCarbs ? Math.abs(day.carbs - userProfile.targetCarbs) / userProfile.targetCarbs * 100 : 0,
                    fat: userProfile.targetFat ? Math.abs(day.fat - userProfile.targetFat) / userProfile.targetFat * 100 : 0
                } : null
            }));

            setChartData(chartDataArray);
            setNutritionData(nutritionDataArray);

            // Генерируем прогнозы
            if (showPredictions) {
                generatePredictions(chartDataArray);
            }

            setSnackbar({
                open: true,
                message: t('Data loaded successfully'),
                severity: 'success'
            });
        } catch (error) {
            console.error('Error loading data:', error);
            setSnackbar({
                open: true,
                message: t('Error loading data'),
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Функция для получения данных о распределении калорий по типам приемов пищи
    const getMealTypeDistribution = () => {
        const distribution = {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            snack: 0
        };

        chartData.forEach(day => {
            day.meals.forEach(meal => {
                const type = meal.type?.toLowerCase() || 'snack';
                if (distribution[type] !== undefined) {
                    distribution[type] += parseInt(meal.calories) || 0;
                }
            });
        });

        return Object.entries(distribution).map(([name, value]) => ({
            name: t(name.charAt(0).toUpperCase() + name.slice(1)),
            value
        }));
    };

    // Функция для получения данных о распределении калорий по времени суток
    const getTimeOfDayDistribution = () => {
        const distribution = {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0
        };

        chartData.forEach(day => {
            day.meals.forEach(meal => {
                const hour = new Date(meal.date).getHours();
                if (hour >= 5 && hour < 12) distribution.morning += parseInt(meal.calories) || 0;
                else if (hour >= 12 && hour < 17) distribution.afternoon += parseInt(meal.calories) || 0;
                else if (hour >= 17 && hour < 22) distribution.evening += parseInt(meal.calories) || 0;
                else distribution.night += parseInt(meal.calories) || 0;
            });
        });

        return Object.entries(distribution).map(([name, value]) => ({
            name: t(name.charAt(0).toUpperCase() + name.slice(1)),
            calories: value
        }));
    };

    // Функция загрузки данных для сравнения
    const loadCompareData = () => {
        try {
            const { currentStart, currentEnd, compareStart, compareEnd } = compareDates;

            // Получаем данные для текущего периода
            const currentData = getMealsByWeek(currentStart);
            const compareData = getMealsByWeek(compareStart);

            // Группируем данные по дням для обоих периодов
            const processData = (meals, period) => {
                const grouped = {};
                meals.forEach(meal => {
                    const date = new Date(meal.date).toISOString().split('T')[0];
                    if (!grouped[date]) {
                        grouped[date] = {
                            date,
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0
                        };
                    }
                    grouped[date].calories += parseInt(meal.calories) || 0;
                    grouped[date].protein += parseInt(meal.protein) || 0;
                    grouped[date].carbs += parseInt(meal.carbs) || 0;
                    grouped[date].fat += parseInt(meal.fat) || 0;
                });
                return Object.values(grouped).map(day => ({
                    ...day,
                    period
                }));
            };

            const processedData = [
                ...processData(currentData, 'current'),
                ...processData(compareData, 'compare')
            ];

            setCompareData(processedData);
        } catch (error) {
            console.error('Error loading compare data:', error);
            setSnackbar({
                open: true,
                message: t('Error loading compare data'),
                severity: 'error'
            });
        }
    };

    // Обработка изменений фильтра
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // Применение фильтров
    const applyFiltersAndClose = () => {
        loadData();
        setOpenFilterDialog(false);
        setSnackbar({
            open: true,
            message: t('Filters applied successfully'),
            severity: 'success'
        });
    };

    // Загрузка данных при изменении параметров
    useEffect(() => {
        loadData();
    }, [timeRange, meals, compareMode]);

    // Добавляем обработчик скролла
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setShowScrollTop(scrollTop > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Функция прокрутки вверх
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Объединение текущих данных и прогнозов
    const getDisplayData = () => {
        if (showPredictions && predictions.length > 0) {
            return [...chartData, ...predictions];
        }
        return chartData;
    };

    // Получение доступных цветов
    const COLORS = ['#FF7849', '#FF9F7E', '#FFB39E', '#FFD1C2'];

    // Функция рендеринга линейного графика
    const renderLineChart = () => (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={getActiveChartData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                ref={chartRef}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <ReTooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [`${value}${name === 'calories' ? ' ккал' : 'г'}`, t(name)]}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="calories"
                    stroke={chartSettings.colors.calories}
                    name={t('Calories')}
                    dot={{ r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="protein"
                    stroke={chartSettings.colors.protein}
                    name={t('Protein')}
                    dot={{ r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="carbs"
                    stroke={chartSettings.colors.carbs}
                    name={t('Carbs')}
                    dot={{ r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="fat"
                    stroke={chartSettings.colors.fat}
                    name={t('Fat')}
                    dot={{ r: 4 }}
                />
                {chartSettings.showTrends && (
                    <>
                        <ReferenceLine y={2000} stroke="#ff0000" strokeDasharray="3 3" />
                        <ReferenceLine y={2500} stroke="#00ff00" strokeDasharray="3 3" />
                    </>
                )}
            </LineChart>
        </ResponsiveContainer>
    );

    // Функция рендеринга столбчатого графика
    const renderBarChart = () => (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart
                data={getActiveChartData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                ref={chartRef}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <ReTooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [`${value}${name === 'calories' ? ' ккал' : 'г'}`, t(name)]}
                />
                <Legend />
                <Bar
                    dataKey="calories"
                    fill={chartSettings.colors.calories}
                    name={t('Calories')}
                />
                <Bar
                    dataKey="protein"
                    fill={chartSettings.colors.protein}
                    name={t('Protein')}
                />
                <Bar
                    dataKey="carbs"
                    fill={chartSettings.colors.carbs}
                    name={t('Carbs')}
                />
                <Bar
                    dataKey="fat"
                    fill={chartSettings.colors.fat}
                    name={t('Fat')}
                />
            </BarChart>
        </ResponsiveContainer>
    );

    // Функция рендеринга графика с областями
    const renderAreaChart = () => (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart
                data={getActiveChartData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                ref={chartRef}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <ReTooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [`${value}${name === 'calories' ? ' ккал' : 'г'}`, t(name)]}
                />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="calories"
                    stackId="1"
                    stroke={chartSettings.colors.calories}
                    fill={chartSettings.colors.calories}
                    name={t('Calories')}
                />
                <Area
                    type="monotone"
                    dataKey="protein"
                    stackId="2"
                    stroke={chartSettings.colors.protein}
                    fill={chartSettings.colors.protein}
                    name={t('Protein')}
                />
                <Area
                    type="monotone"
                    dataKey="carbs"
                    stackId="3"
                    stroke={chartSettings.colors.carbs}
                    fill={chartSettings.colors.carbs}
                    name={t('Carbs')}
                />
                <Area
                    type="monotone"
                    dataKey="fat"
                    stackId="4"
                    stroke={chartSettings.colors.fat}
                    fill={chartSettings.colors.fat}
                    name={t('Fat')}
                />
            </AreaChart>
        </ResponsiveContainer>
    );

    // Выбор типа графика для отображения
    const renderActiveChart = () => {
        switch (chartSettings.chartType) {
            case 'bar':
                return renderBarChart();
            case 'area':
                return renderAreaChart();
            case 'line':
            default:
                return renderLineChart();
        }
    };

    // Проверяем доступ к аналитике
    if (!hasFeature('analytics')) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3
            }}>
                <SubscriptionLimit
                    feature="analytics"
                    title={t('analyticsNotAvailable')}
                    description={t('upgradeToAccessAnalytics')}
                />
            </Box>
        );
    }

    return (
        <Box sx={{
            p: 3,
            height: '100vh',
            overflowY: 'auto',
            position: 'relative',
            '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
            },
            '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                    background: '#555',
                },
            },
            '&::-webkit-scrollbar-corner': {
                background: '#f1f1f1',
            }
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Typography variant="h4" gutterBottom>
                    {t('Analytics')}
                </Typography>
            </motion.div>

            {/* Панель управления аналитикой */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>{t('Time Range')}</InputLabel>
                    <Select
                        value={timeRange}
                        label={t('Time Range')}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <MenuItem value="week">{t('Last Week')}</MenuItem>
                        <MenuItem value="month">{t('Last Month')}</MenuItem>
                        <MenuItem value="year">{t('Last Year')}</MenuItem>
                        <MenuItem value="custom">{t('Custom Range')}</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={t('Filters')}>
                        <IconButton onClick={() => setOpenFilterDialog(true)}>
                            <FilterListIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('Compare Periods')}>
                        <IconButton onClick={() => setOpenCompareDialog(true)}>
                            <CompareArrowsIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={t('Export Data')}>
                        <IconButton onClick={() => setOpenExportDialog(true)}>
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={t('Settings')}>
                        <IconButton onClick={() => setOpenSettingsDialog(true)}>
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={t('Refresh Data')}>
                        <IconButton onClick={refreshAnalytics}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Основной график */}
            <Paper
                elevation={3}
                sx={{
                    height: 400,
                    p: 2,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {isLoading ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <CircularProgress />
                    </Box>
                ) : chartData.length > 0 ? (
                    <>
                        {renderActiveChart()}

                        {/* Кнопка переключения прогнозов */}
                        {predictions.length > 0 && (
                            <Tooltip title={t('Toggle Predictions')}>
                                <IconButton
                                    onClick={() => setShowPredictions(!showPredictions)}
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        backgroundColor: showPredictions ?
                                            theme.palette.primary.main : 'transparent',
                                        color: showPredictions ? 'white' : theme.palette.text.primary,
                                        '&:hover': {
                                            backgroundColor: showPredictions ?
                                                theme.palette.primary.dark : theme.palette.action.hover,
                                        }
                                    }}
                                >
                                    <TrendingUpIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        flexDirection: 'column'
                    }}>
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                            {t('No data available for the selected period')}
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<TimelineIcon />}
                            onClick={() => setTimeRange('month')}
                        >
                            {t('Try different time range')}
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Индикаторы и сводки */}
            <Grid container spacing={3} mb={4}>
                {nutritionData.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            elevation={2}
                            sx={{
                                backgroundColor: `${COLORS[index]}15`,
                                borderLeft: `4px solid ${COLORS[index]}`,
                                transition: 'transform 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-5px)'
                                }
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {item.name}
                                </Typography>
                                <Typography variant="h4">
                                    {item.value}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {t('Daily Average')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Подробная аналитика */}
            <div ref={analyticsRef}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label={t('Nutrition Details')} />
                        <Tab label={t('Meal Distribution')} />
                        <Tab label={t('Ingredients & Accuracy')} />
                        <Tab label={t('Trends & Insights')} />
                    </Tabs>
                </Box>

                {/* Вкладка 1: Детальная информация о питании */}
                {tabValue === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 2, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    {t('Nutrition Breakdown by Day')}
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <ReTooltip />
                                            <Legend />
                                            <Bar dataKey="calories" fill={chartSettings.colors.calories} name={t('Calories')} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    {t('Macronutrient Distribution')}
                                </Typography>
                                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={nutritionData.slice(1)} // Исключаем калории
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {nutritionData.slice(1).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                                ))}
                                            </Pie>
                                            <ReTooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* Вкладка 2: Распределение приемов пищи */}
                {tabValue === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    {t('Calories by Meal Type')}
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={getMealTypeDistribution()}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                <Cell fill="#FF8042" />
                                                <Cell fill="#00C49F" />
                                                <Cell fill="#0088FE" />
                                                <Cell fill="#FFBB28" />
                                            </Pie>
                                            <ReTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    {t('Calories by Time of Day')}
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={getTimeOfDayDistribution()}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <ReTooltip />
                                            <Bar dataKey="calories" fill={chartSettings.colors.calories} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* Вкладка 3: Ингредиенты и точность */}
                {tabValue === 2 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    🥗 {t('Most Used Ingredients')}
                                </Typography>
                                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                                    {chartData.length > 0 && (() => {
                                        // Подсчет популярности ингредиентов
                                        const ingredientCount = {};
                                        chartData.forEach(day => {
                                            day.uniqueIngredients.forEach(ingredient => {
                                                ingredientCount[ingredient] = (ingredientCount[ingredient] || 0) + 1;
                                            });
                                        });

                                        const sortedIngredients = Object.entries(ingredientCount)
                                            .sort(([,a], [,b]) => b - a)
                                            .slice(0, 10);

                                        return sortedIngredients.map(([ingredient, count], index) => (
                                            <Box key={ingredient} sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1,
                                                mb: 1,
                                                backgroundColor: index < 3 ? 'rgba(255, 107, 53, 0.1)' : 'rgba(0,0,0,0.05)',
                                                borderRadius: 1,
                                                border: index < 3 ? '1px solid rgba(255, 107, 53, 0.3)' : 'none'
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: index < 3 ? 'bold' : 'normal',
                                                    color: index < 3 ? '#ff6b35' : 'inherit'
                                                }}>
                                                    {index < 3 && ['🥇', '🥈', '🥉'][index]} {ingredient}
                                                </Typography>
                                                <Chip
                                                    label={`${count} ${t('times')}`}
                                                    size="small"
                                                    color={index < 3 ? 'primary' : 'default'}
                                                />
                                            </Box>
                                        ));
                                    })()}
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    🎯 {t('Target Accuracy Analysis')}
                                </Typography>
                                {userProfile && chartData.length > 0 && (() => {
                                    const avgAccuracy = chartData.reduce((acc, day) => {
                                        if (day.accuracy) {
                                            acc.calories += day.accuracy.calories;
                                            acc.protein += day.accuracy.protein;
                                            acc.carbs += day.accuracy.carbs;
                                            acc.fat += day.accuracy.fat;
                                        }
                                        return acc;
                                    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

                                    const dayCount = chartData.filter(day => day.accuracy).length;
                                    if (dayCount > 0) {
                                        avgAccuracy.calories /= dayCount;
                                        avgAccuracy.protein /= dayCount;
                                        avgAccuracy.carbs /= dayCount;
                                        avgAccuracy.fat /= dayCount;
                                    }

                                    const accuracyData = [
                                        { name: t('Calories'), accuracy: Math.max(0, 100 - avgAccuracy.calories), color: '#ff6b35' },
                                        { name: t('Protein'), accuracy: Math.max(0, 100 - avgAccuracy.protein), color: '#4caf50' },
                                        { name: t('Carbs'), accuracy: Math.max(0, 100 - avgAccuracy.carbs), color: '#2196f3' },
                                        { name: t('Fat'), accuracy: Math.max(0, 100 - avgAccuracy.fat), color: '#ff9800' }
                                    ];

                                    return (
                                        <Box>
                                            {accuracyData.map((item, index) => (
                                                <Box key={item.name} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body2">{item.name}</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: item.color }}>
                                                            {Math.round(item.accuracy)}%
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        width: '100%',
                                                        height: 8,
                                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                                        borderRadius: 4,
                                                        overflow: 'hidden'
                                                    }}>
                                                        <Box sx={{
                                                            width: `${item.accuracy}%`,
                                                            height: '100%',
                                                            backgroundColor: item.color,
                                                            transition: 'width 0.3s ease'
                                                        }} />
                                                    </Box>
                                                </Box>
                                            ))}
                                            <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)', mt: 1, display: 'block' }}>
                                                * {t('accuracyExplanation')}
                                            </Typography>
                                        </Box>
                                    );
                                })()}
                                {!userProfile && (
                                    <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)', textAlign: 'center', py: 4 }}>
                                        {t('fillProfileForAccuracy')}
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    📊 {t('Daily Ingredients Diversity')}
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                                            />
                                            <YAxis />
                                            <ReTooltip
                                                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                                formatter={(value, name) => [value, name === 'uniqueIngredientsCount' ? t('Unique Ingredients') : t('Total Ingredients')]}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="uniqueIngredientsCount"
                                                fill="#ff6b35"
                                                name={t('Unique Ingredients')}
                                            />
                                            <Bar
                                                dataKey="ingredientsCount"
                                                fill="#ff8c42"
                                                name={t('Total Ingredients')}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* Вкладка 4: Тренды и аналитика */}
                {tabValue === 3 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    {t('Nutrition Trends')}
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={getDisplayData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <ReTooltip />
                                            <Legend />
                                            <Bar dataKey="calories" fill={chartSettings.colors.calories} name={t('Calories')} />
                                            <Line type="monotone" dataKey="calories" stroke={chartSettings.colors.calories} dot={false} strokeWidth={2} name={t('Trend')} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </Box>

                                {predictions.length > 0 && (
                                    <Accordion sx={{ mt: 2 }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography>{t('Predictions & Insights')}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography variant="body2" paragraph>
                                                {t('Based on your recent consumption patterns, we predict the following trends:')}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                                {predictions[6].calories > chartData[chartData.length-1].calories ? (
                                                    <Chip
                                                        color="error"
                                                        label={t('Calorie intake trending upward')}
                                                        icon={<TrendingUpIcon />}
                                                    />
                                                ) : (
                                                    <Chip
                                                        color="success"
                                                        label={t('Calorie intake trending downward')}
                                                        icon={<TrendingUpIcon sx={{ transform: 'rotate(180deg)' }} />}
                                                    />
                                                )}

                                                {predictions[6].protein > chartData[chartData.length-1].protein ? (
                                                    <Chip
                                                        color="success"
                                                        label={t('Protein intake increasing')}
                                                        icon={<TrendingUpIcon />}
                                                    />
                                                ) : (
                                                    <Chip
                                                        color="warning"
                                                        label={t('Protein intake decreasing')}
                                                        icon={<TrendingUpIcon sx={{ transform: 'rotate(180deg)' }} />}
                                                    />
                                                )}
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                onClick={() => setShowPredictions(!showPredictions)}
                                                startIcon={<TrendingUpIcon />}
                                            >
                                                {showPredictions ? t('Hide Predictions') : t('Show Predictions')}
                                            </Button>
                                        </AccordionDetails>
                                    </Accordion>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </div>

            {/* Добавляем кнопку прокрутки вверх */}
            {showScrollTop && (
                <Fab
                    color="primary"
                    aria-label="scroll to top"
                    onClick={scrollToTop}
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        zIndex: 1000
                    }}
                >
                    <KeyboardArrowUpIcon />
                </Fab>
            )}

            {/* Диалог фильтрации */}
            <Dialog
                open={openFilterDialog}
                onClose={() => setOpenFilterDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t('Filter Analytics')}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('Meal Types')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                                    <Chip
                                        key={type}
                                        label={t(type.charAt(0).toUpperCase() + type.slice(1))}
                                        onClick={() => {
                                            const updatedTypes = filters.mealTypes.includes(type)
                                                ? filters.mealTypes.filter(item => item !== type)
                                                : [...filters.mealTypes, type];
                                            handleFilterChange('mealTypes', updatedTypes);
                                        }}
                                        color={filters.mealTypes.includes(type) ? 'primary' : 'default'}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('Nutrients')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {['calories', 'protein', 'carbs', 'fat'].map(nutrient => (
                                    <Chip
                                        key={nutrient}
                                        label={t(nutrient.charAt(0).toUpperCase() + nutrient.slice(1))}
                                        onClick={() => {
                                            const updatedNutrients = filters.nutrients.includes(nutrient)
                                                ? filters.nutrients.filter(item => item !== nutrient)
                                                : [...filters.nutrients, nutrient];
                                            handleFilterChange('nutrients', updatedNutrients);
                                        }}
                                        color={filters.nutrients.includes(nutrient) ? 'primary' : 'default'}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('Time of Day')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {['morning', 'afternoon', 'evening', 'night'].map(time => (
                                    <Chip
                                        key={time}
                                        label={t(time.charAt(0).toUpperCase() + time.slice(1))}
                                        onClick={() => {
                                            const updatedTimes = filters.timeOfDay.includes(time)
                                                ? filters.timeOfDay.filter(item => item !== time)
                                                : [...filters.timeOfDay, time];
                                            handleFilterChange('timeOfDay', updatedTimes);
                                        }}
                                        color={filters.timeOfDay.includes(time) ? 'primary' : 'default'}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('Calorie Range')}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <TextField
                                    label={t('Min Calories')}
                                    type="number"
                                    value={filters.minCalories}
                                    onChange={(e) => handleFilterChange('minCalories', parseInt(e.target.value) || 0)}
                                    InputProps={{ inputProps: { min: 0 } }}
                                />
                                <Typography>-</Typography>
                                <TextField
                                    label={t('Max Calories')}
                                    type="number"
                                    value={filters.maxCalories}
                                    onChange={(e) => handleFilterChange('maxCalories', parseInt(e.target.value) || 0)}
                                    InputProps={{ inputProps: { min: 0 } }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFilterDialog(false)}>
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={applyFiltersAndClose}
                    >
                        {t('Apply Filters')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог сравнения периодов */}
            <Dialog
                open={openCompareDialog}
                onClose={() => setOpenCompareDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t('Compare Periods')}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={compareMode}
                                        onChange={(e) => setCompareMode(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={t('Enable Comparison Mode')}
                            />
                        </Grid>

                        {compareMode && (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        {t('Current Period')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                label={t('Start Date')}
                                                value={compareDates.currentStart}
                                                onChange={(newValue) => setCompareDates(prev => ({ ...prev, currentStart: newValue }))}
                                            />
                                            <DatePicker
                                                label={t('End Date')}
                                                value={compareDates.currentEnd}
                                                onChange={(newValue) => setCompareDates(prev => ({ ...prev, currentEnd: newValue }))}
                                            />
                                        </LocalizationProvider>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        {t('Comparison Period')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                label={t('Start Date')}
                                                value={compareDates.compareStart}
                                                onChange={(newValue) => setCompareDates(prev => ({ ...prev, compareStart: newValue }))}
                                            />
                                            <DatePicker
                                                label={t('End Date')}
                                                value={compareDates.compareEnd}
                                                onChange={(newValue) => setCompareDates(prev => ({ ...prev, compareEnd: newValue }))}
                                            />
                                        </LocalizationProvider>
                                    </Box>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCompareDialog(false)}>
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            loadData();
                            setOpenCompareDialog(false);
                        }}
                    >
                        {t('Apply')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог экспорта данных */}
            <Dialog
                open={openExportDialog}
                onClose={() => setOpenExportDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>{t('Export Data')}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => exportData('csv')}
                            >
                                {t('Export as CSV')}
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<SaveAltIcon />}
                                onClick={() => exportData('excel')}
                            >
                                {t('Export as Excel')}
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<PictureAsPdfIcon />}
                                onClick={() => exportData('pdf')}
                            >
                                {t('Export as PDF')}
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<SaveAltIcon />}
                                onClick={() => exportData('image')}
                            >
                                {t('Export Chart as Image')}
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenExportDialog(false)}>
                        {t('Cancel')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог настроек */}
            <Dialog
                open={openSettingsDialog}
                onClose={() => setOpenSettingsDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t('Settings')}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('Chart Type')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {['line', 'bar', 'area'].map(type => (
                                    <Chip
                                        key={type}
                                        label={t(type.charAt(0).toUpperCase() + type.slice(1))}
                                        onClick={() => setChartSettings(prev => ({ ...prev, chartType: type }))}
                                        color={chartSettings.chartType === type ? 'primary' : 'default'}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('Chart Settings')}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={chartSettings.showGrid}
                                                onChange={(e) => setChartSettings(prev => ({ ...prev, showGrid: e.target.checked }))}
                                                color="primary"
                                            />
                                        }
                                        label={t('Show Grid')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={chartSettings.showAverages}
                                                onChange={(e) => setChartSettings(prev => ({ ...prev, showAverages: e.target.checked }))}
                                                color="primary"
                                            />
                                        }
                                        label={t('Show Averages')}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('Auto-Update')}
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoUpdate}
                                        onChange={(e) => setAutoUpdate(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={t('Enable Auto-Update')}
                            />
                            {autoUpdate && (
                                <Box sx={{ mt: 2 }}>
                                    <TextField
                                        label={t('Update Interval (seconds)')}
                                        type="number"
                                        value={updateInterval}
                                        onChange={(e) => setUpdateInterval(parseInt(e.target.value) || 30)}
                                        InputProps={{ inputProps: { min: 5, max: 3600 } }}
                                    />
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSettingsDialog(false)}>
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setOpenSettingsDialog(false);
                            refreshAnalytics();
                        }}
                    >
                        {t('Apply Settings')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Уведомления */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Analytics;
