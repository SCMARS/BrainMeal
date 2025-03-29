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
    Alert
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
import { useMealPlan } from '../context/MealPlanContext';
import { useLanguage } from '../context/LanguageContext';
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

    // Применение фильтров к данным
    const applyFilters = (data) => {
        return data.filter(item => {
            // Фильтр по типу приема пищи (если эта информация есть)
            if (item.mealType && !filters.mealTypes.includes(item.mealType)) {
                return false;
            }

            // Фильтр по времени суток (если эта информация есть)
            if (item.timeOfDay && !filters.timeOfDay.includes(item.timeOfDay)) {
                return false;
            }

            // Фильтр по калориям
            if (item.calories < filters.minCalories || item.calories > filters.maxCalories) {
                return false;
            }

            return true;
        });
    };

    // Загрузка и обработка данных для аналитики
    const loadData = () => {
        let startDate = new Date();
        let endDate = new Date();

        // Определение временного диапазона
        if (timeRange === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (timeRange === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (timeRange === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        } else if (timeRange === 'custom' && compareMode) {
            startDate = new Date(compareDates.currentStart);
            endDate = new Date(compareDates.currentEnd);
        }

        // Получение данных о приемах пищи
        const weeklyMeals = getMealsByWeek(startDate, endDate);

        // Применение фильтров
        const filteredMeals = applyFilters(weeklyMeals);

        // Преобразование данных для графиков
        const data = filteredMeals.map(meal => ({
            date: new Date(meal.date).toLocaleDateString(),
            time: meal.time || '00:00',
            mealType: meal.mealType || 'unknown',
            timeOfDay: meal.timeOfDay || 'unknown',
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat
        }));

        setChartData(data);

        // Расчет средних показателей
        if (data.length > 0) {
            const avg = data.reduce((acc, curr) => ({
                calories: acc.calories + curr.calories,
                protein: acc.protein + curr.protein,
                carbs: acc.carbs + curr.carbs,
                fat: acc.fat + curr.fat
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

            const count = data.length;
            setNutritionData([
                { name: t('Calories'), value: Math.round(avg.calories / count) },
                { name: t('Protein'), value: Math.round(avg.protein / count) },
                { name: t('Carbs'), value: Math.round(avg.carbs / count) },
                { name: t('Fat'), value: Math.round(avg.fat / count) }
            ]);
        } else {
            setNutritionData([
                { name: t('Calories'), value: 0 },
                { name: t('Protein'), value: 0 },
                { name: t('Carbs'), value: 0 },
                { name: t('Fat'), value: 0 }
            ]);
        }

        // Загрузка данных для сравнения, если включен режим сравнения
        if (compareMode) {
            loadCompareData();
        }

        // Генерация прогнозов
        if (data.length > 3) {
            generatePredictions(data);
        }
    };

    // Загрузка данных для сравнения
    const loadCompareData = () => {
        const startDate = new Date(compareDates.compareStart);
        const endDate = new Date(compareDates.compareEnd);

        const compareMeals = getMealsByWeek(startDate, endDate);
        const filteredCompareMeals = applyFilters(compareMeals);

        const data = filteredCompareMeals.map(meal => ({
            date: new Date(meal.date).toLocaleDateString(),
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            period: t('Previous')
        }));

        // Добавление метки периода к текущим данным
        const currentDataWithPeriod = chartData.map(item => ({
            ...item,
            period: t('Current')
        }));

        setCompareData([...currentDataWithPeriod, ...data]);
    };

    // Генерация прогнозов на основе линейной регрессии
    const generatePredictions = (data) => {
        if (data.length < 4) return;

        try {
            // Данные для регрессии (индекс, значение)
            const caloriesData = data.map((item, index) => [index, item.calories]);
            const proteinData = data.map((item, index) => [index, item.protein]);
            const carbsData = data.map((item, index) => [index, item.carbs]);
            const fatData = data.map((item, index) => [index, item.fat]);

            // Расчет линейной регрессии
            const caloriesResult = regression.linear(caloriesData);
            const proteinResult = regression.linear(proteinData);
            const carbsResult = regression.linear(carbsData);
            const fatResult = regression.linear(fatData);

            // Прогноз на 7 дней вперед
            const predictions = [];
            const lastIndex = data.length - 1;
            const lastDate = new Date(data[lastIndex].date);

            for (let i = 1; i <= 7; i++) {
                const predictionDate = new Date(lastDate);
                predictionDate.setDate(predictionDate.getDate() + i);

                predictions.push({
                    date: predictionDate.toLocaleDateString(),
                    calories: Math.max(0, Math.round(caloriesResult.predict(lastIndex + i)[1])),
                    protein: Math.max(0, Math.round(proteinResult.predict(lastIndex + i)[1])),
                    carbs: Math.max(0, Math.round(carbsResult.predict(lastIndex + i)[1])),
                    fat: Math.max(0, Math.round(fatResult.predict(lastIndex + i)[1])),
                    isPrediction: true
                });
            }

            setPredictions(predictions);
        } catch (error) {
            console.error("Error generating predictions:", error);
            setPredictions([]);
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

    // Прокрутка к детальной аналитике
    const scrollDown = () => {
        if (analyticsRef.current) {
            analyticsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
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

    // Получение данных для отображения в зависимости от режима
    const getActiveChartData = () => {
        if (compareMode) {
            return compareData;
        }
        return getDisplayData();
    };

    // Рендер линейного графика
    const renderLineChart = () => (
        <ResponsiveContainer width="100%" height="100%" ref={chartRef}>
            <LineChart data={getActiveChartData()}>
                {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis dataKey="date" />
                <YAxis />
                <ReTooltip
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div style={{
                                    backgroundColor: theme.palette.background.paper,
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                                }}>
                                    <p style={{ margin: 0 }}><strong>{label}</strong></p>
                                    {payload.map((p, index) => (
                                        <p key={index} style={{
                                            margin: '5px 0',
                                            color: p.color
                                        }}>
                                            {p.name}: {p.value}
                                            {p.payload && p.payload.isPrediction &&
                                                <span style={{
                                                    fontSize: '0.8em',
                                                    marginLeft: '5px',
                                                    color: theme.palette.warning.main
                                                }}>
                                                    (прогноз)
                                                </span>
                                            }
                                        </p>
                                    ))}
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Legend />

                {/* Отображаем только выбранные в фильтрах питательные вещества */}
                {filters.nutrients.includes('calories') && (
                    <Line
                        type={chartSettings.lineType}
                        dataKey="calories"
                        stroke={chartSettings.colors.calories}
                        name={t('Calories')}
                        dot={{ r: (point) => point.isPrediction ? 0 : 3 }}
                        strokeDasharray={(point) => point && point.isPrediction ? "5 5" : "0"}
                    />
                )}
                {filters.nutrients.includes('protein') && (
                    <Line
                        type={chartSettings.lineType}
                        dataKey="protein"
                        stroke={chartSettings.colors.protein}
                        name={t('Protein')}
                        dot={{ r: (point) => point.isPrediction ? 0 : 3 }}
                        strokeDasharray={(point) => point && point.isPrediction ? "5 5" : "0"}
                    />
                )}
                {filters.nutrients.includes('carbs') && (
                    <Line
                        type={chartSettings.lineType}
                        dataKey="carbs"
                        stroke={chartSettings.colors.carbs}
                        name={t('Carbs')}
                        dot={{ r: (point) => point.isPrediction ? 0 : 3 }}
                        strokeDasharray={(point) => point && point.isPrediction ? "5 5" : "0"}
                    />
                )}
                {filters.nutrients.includes('fat') && (
                    <Line
                        type={chartSettings.lineType}
                        dataKey="fat"
                        stroke={chartSettings.colors.fat}
                        name={t('Fat')}
                        dot={{ r: (point) => point.isPrediction ? 0 : 3 }}
                        strokeDasharray={(point) => point && point.isPrediction ? "5 5" : "0"}
                    />
                )}

                {/* Отображение средних значений */}
                {chartSettings.showAverages && nutritionData.length > 0 && (
                    <>
                        {filters.nutrients.includes('calories') && (
                            <ReferenceLine
                                y={nutritionData[0].value}
                                stroke={chartSettings.colors.calories}
                                strokeDasharray="3 3"
                                label={{
                                    value: `Avg: ${nutritionData[0].value}`,
                                    position: 'insideTopRight',
                                    fill: chartSettings.colors.calories
                                }}
                            />
                        )}
                        {filters.nutrients.includes('protein') && (
                            <ReferenceLine
                                y={nutritionData[1].value}
                                stroke={chartSettings.colors.protein}
                                strokeDasharray="3 3"
                                label={{
                                    value: `Avg: ${nutritionData[1].value}`,
                                    position: 'insideTopRight',
                                    fill: chartSettings.colors.protein
                                }}
                            />
                        )}
                    </>
                )}

                {/* Разделитель между фактическими данными и прогнозами */}
                {showPredictions && predictions.length > 0 && (
                    <ReferenceLine
                        x={chartData[chartData.length-1].date}
                        stroke="#666"
                        strokeDasharray="3 3"
                        label={{
                            value: t('Forecast start'),
                            position: 'insideTopRight',
                            fill: '#666'
                        }}
                    />
                )}

                {compareMode && (
                    <Brush dataKey="date" height={30} stroke="#8884d8" />
                )}
            </LineChart>
        </ResponsiveContainer>
    );

    // Рендер столбчатого графика
    const renderBarChart = () => (
        <ResponsiveContainer width="100%" height="100%" ref={chartRef}>
            <BarChart data={getActiveChartData()}>
                {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis dataKey="date" />
                <YAxis />
                <ReTooltip />
                <Legend />

                {filters.nutrients.includes('calories') && (
                    <Bar
                        dataKey="calories"
                        fill={chartSettings.colors.calories}
                        name={t('Calories')}
                        opacity={(data) => data.isPrediction ? 0.5 : 1}
                    />
                )}
                {filters.nutrients.includes('protein') && (
                    <Bar
                        dataKey="protein"
                        fill={chartSettings.colors.protein}
                        name={t('Protein')}
                        opacity={(data) => data.isPrediction ? 0.5 : 1}
                    />
                )}
                {filters.nutrients.includes('carbs') && (
                    <Bar
                        dataKey="carbs"
                        fill={chartSettings.colors.carbs}
                        name={t('Carbs')}
                        opacity={(data) => data.isPrediction ? 0.5 : 1}
                    />
                )}
                {filters.nutrients.includes('fat') && (
                    <Bar
                        dataKey="fat"
                        fill={chartSettings.colors.fat}
                        name={t('Fat')}
                        opacity={(data) => data.isPrediction ? 0.5 : 1}
                    />
                )}

                {compareMode && (
                    <Brush dataKey="date" height={30} stroke="#8884d8" />
                )}
            </BarChart>
        </ResponsiveContainer>
    );

    // Рендер графика областей
    const renderAreaChart = () => (
        <ResponsiveContainer width="100%" height="100%" ref={chartRef}>
            <AreaChart data={getActiveChartData()}>
                {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis dataKey="date" />
                <YAxis />
                <ReTooltip />
                <Legend />

                {filters.nutrients.includes('calories') && (
                    <Area
                        type={chartSettings.lineType}
                        dataKey="calories"
                        fill={chartSettings.colors.calories}
                        stroke={chartSettings.colors.calories}
                        name={t('Calories')}
                        fillOpacity={0.3}
                    />
                )}
                {filters.nutrients.includes('protein') && (
                    <Area
                        type={chartSettings.lineType}
                        dataKey="protein"
                        fill={chartSettings.colors.protein}
                        stroke={chartSettings.colors.protein}
                        name={t('Protein')}
                        fillOpacity={0.3}
                    />
                )}
                {filters.nutrients.includes('carbs') && (
                    <Area
                        type={chartSettings.lineType}
                        dataKey="carbs"
                        fill={chartSettings.colors.carbs}
                        stroke={chartSettings.colors.carbs}
                        name={t('Carbs')}
                        fillOpacity={0.3}
                    />
                )}
                {filters.nutrients.includes('fat') && (
                    <Area
                        type={chartSettings.lineType}
                        dataKey="fat"
                        fill={chartSettings.colors.fat}
                        stroke={chartSettings.colors.fat}
                        name={t('Fat')}
                        fillOpacity={0.3}
                    />
                )}

                {compareMode && (
                    <Brush dataKey="date" height={30} stroke="#8884d8" />
                )}
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

    return (
        <Box sx={{ p: 3 }}>
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
                                                data={[
                                                    { name: t('Breakfast'), value: 300 },
                                                    { name: t('Lunch'), value: 450 },
                                                    { name: t('Dinner'), value: 400 },
                                                    { name: t('Snacks'), value: 250 }
                                                ]}
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
                                            data={[
                                                { name: t('Morning'), calories: 350 },
                                                { name: t('Afternoon'), calories: 450 },
                                                { name: t('Evening'), calories: 400 },
                                                { name: t('Night'), calories: 200 }
                                            ]}
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

                {/* Вкладка 3: Тренды и аналитика */}
                {tabValue === 2 && (
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
