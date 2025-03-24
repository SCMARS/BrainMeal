import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    useTheme,
    alpha,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { useMealPlan } from '../context/MealPlanContext';
import { useLanguage } from '../context/LanguageContext';

// Современная темно-оранжевая цветовая палитра
const COLORS = {
    primary: '#FF5722', // Основной темно-оранжевый
    secondary: '#FF8A65', // Светлее
    tertiary: '#FFCCBC', // Еще светлее
    quaternary: '#BF360C', // Темнее
    accent: '#DD2C00', // Акцентный
    background: '#121212', // Темный фон
    cardBg: '#1E1E1E', // Фон карточек
    text: '#FFFFFF', // Текст
    gridLines: '#333333' // Линии сетки
};

const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: {
            duration: 0.3
        }
    }
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i) => ({
        y: 0,
        opacity: 1,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: [0.43, 0.13, 0.23, 0.96]
        }
    }),
    hover: {
        y: -5,
        boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
        transition: {
            duration: 0.3
        }
    }
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box
                sx={{
                    background: COLORS.cardBg,
                    border: `1px solid ${COLORS.primary}`,
                    borderRadius: '8px',
                    padding: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
            >
                <Typography variant="subtitle2" sx={{ color: COLORS.text, fontWeight: 'bold' }}>
                    {label}
                </Typography>
                {payload.map((entry, index) => (
                    <Typography
                        key={`tooltip-${index}`}
                        variant="body2"
                        sx={{ color: entry.color, marginTop: '5px' }}
                    >
                        {`${entry.name}: ${entry.value}`}
                    </Typography>
                ))}
            </Box>
        );
    }
    return null;
};

const Analytics = () => {
    const theme = useTheme();
    const { t } = useLanguage();
    const { meals, getMealsByWeek, getNutritionSummary } = useMealPlan();
    const [timeRange, setTimeRange] = useState('week');
    const [chartData, setChartData] = useState([]);
    const [nutritionData, setNutritionData] = useState([]);
    const [chartType, setChartType] = useState('line');
    const [showPct, setShowPct] = useState(false);

    useEffect(() => {
        const startDate = new Date();
        if (timeRange === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (timeRange === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (timeRange === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        }

        const weeklyMeals = getMealsByWeek(startDate);
        const nutritionData = weeklyMeals.map(meal => ({
            date: new Date(meal.date).toLocaleDateString(),
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat
        }));

        setChartData(nutritionData);

        // Calculate average nutrition data
        const avgNutrition = nutritionData.reduce((acc, curr) => ({
            calories: acc.calories + curr.calories,
            protein: acc.protein + curr.protein,
            carbs: acc.carbs + curr.carbs,
            fat: acc.fat + curr.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        const count = nutritionData.length || 1;

        // Calculate total for percentage
        const total = Math.round(avgNutrition.protein / count) +
            Math.round(avgNutrition.carbs / count) +
            Math.round(avgNutrition.fat / count);

        setNutritionData([
            { name: t('Calories'), value: Math.round(avgNutrition.calories / count), pct: 100 },
            { name: t('Protein'), value: Math.round(avgNutrition.protein / count), pct: Math.round((avgNutrition.protein / count) / total * 100) },
            { name: t('Carbs'), value: Math.round(avgNutrition.carbs / count), pct: Math.round((avgNutrition.carbs / count) / total * 100) },
            { name: t('Fat'), value: Math.round(avgNutrition.fat / count), pct: Math.round((avgNutrition.fat / count) / total * 100) }
        ]);
    }, [timeRange, meals, getMealsByWeek, t]);

    const renderMainChart = () => {
        switch(chartType) {
            case 'area':
                return (
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                            </linearGradient>
                            <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.2}/>
                            </linearGradient>
                            <linearGradient id="colorCarbs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.tertiary} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={COLORS.tertiary} stopOpacity={0.2}/>
                            </linearGradient>
                            <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0.2}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLines} />
                        <XAxis dataKey="date" stroke={COLORS.text} />
                        <YAxis stroke={COLORS.text} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="calories"
                            stroke={COLORS.primary}
                            fillOpacity={1}
                            fill="url(#colorCalories)"
                            name={t('Calories')}
                            animationDuration={1500}
                        />
                        <Area
                            type="monotone"
                            dataKey="protein"
                            stroke={COLORS.secondary}
                            fillOpacity={1}
                            fill="url(#colorProtein)"
                            name={t('Protein')}
                            animationDuration={1500}
                            animationBegin={300}
                        />
                        <Area
                            type="monotone"
                            dataKey="carbs"
                            stroke={COLORS.tertiary}
                            fillOpacity={1}
                            fill="url(#colorCarbs)"
                            name={t('Carbs')}
                            animationDuration={1500}
                            animationBegin={600}
                        />
                        <Area
                            type="monotone"
                            dataKey="fat"
                            stroke={COLORS.accent}
                            fillOpacity={1}
                            fill="url(#colorFat)"
                            name={t('Fat')}
                            animationDuration={1500}
                            animationBegin={900}
                        />
                    </AreaChart>
                );
            default:
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLines} />
                        <XAxis dataKey="date" stroke={COLORS.text} />
                        <YAxis stroke={COLORS.text} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="calories"
                            stroke={COLORS.primary}
                            strokeWidth={3}
                            dot={{ stroke: COLORS.primary, strokeWidth: 2, r: 4, fill: COLORS.cardBg }}
                            activeDot={{ stroke: COLORS.text, strokeWidth: 2, r: 6, fill: COLORS.primary }}
                            name={t('Calories')}
                            animationDuration={1500}
                        />
                        <Line
                            type="monotone"
                            dataKey="protein"
                            stroke={COLORS.secondary}
                            strokeWidth={3}
                            dot={{ stroke: COLORS.secondary, strokeWidth: 2, r: 4, fill: COLORS.cardBg }}
                            activeDot={{ stroke: COLORS.text, strokeWidth: 2, r: 6, fill: COLORS.secondary }}
                            name={t('Protein')}
                            animationDuration={1500}
                            animationBegin={300}
                        />
                        <Line
                            type="monotone"
                            dataKey="carbs"
                            stroke={COLORS.tertiary}
                            strokeWidth={3}
                            dot={{ stroke: COLORS.tertiary, strokeWidth: 2, r: 4, fill: COLORS.cardBg }}
                            activeDot={{ stroke: COLORS.text, strokeWidth: 2, r: 6, fill: COLORS.tertiary }}
                            name={t('Carbs')}
                            animationDuration={1500}
                            animationBegin={600}
                        />
                        <Line
                            type="monotone"
                            dataKey="fat"
                            stroke={COLORS.accent}
                            strokeWidth={3}
                            dot={{ stroke: COLORS.accent, strokeWidth: 2, r: 4, fill: COLORS.cardBg }}
                            activeDot={{ stroke: COLORS.text, strokeWidth: 2, r: 6, fill: COLORS.accent }}
                            name={t('Fat')}
                            animationDuration={1500}
                            animationBegin={900}
                        />
                    </LineChart>
                );
        }
    };

    return (
        <Box sx={{
            p: 3,
            backgroundColor: COLORS.background,
            minHeight: '100vh'
        }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ marginBottom: '20px' }}
            >
                <Typography variant="h4" gutterBottom sx={{
                    color: COLORS.text,
                    fontWeight: 700,
                    position: 'relative',
                    display: 'inline-block',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '50%',
                        height: '4px',
                        bottom: '-8px',
                        left: '0',
                        backgroundColor: COLORS.primary,
                        borderRadius: '2px'
                    }
                }}>
                    {t('Analytics')}
                </Typography>
            </motion.div>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        custom={0}
                    >
                        <Card sx={{
                            backgroundColor: COLORS.cardBg,
                            borderRadius: '16px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            overflow: 'hidden',
                            border: `1px solid ${alpha(COLORS.primary, 0.2)}`
                        }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                                    <Typography variant="h6" sx={{ color: COLORS.text, fontWeight: 600 }}>
                                        {t('Nutrition Overview')}
                                    </Typography>
                                    <Box display="flex" gap={2} flexWrap="wrap">
                                        <FormControl sx={{ minWidth: 120 }}>
                                            <InputLabel sx={{ color: COLORS.text }}>{t('Chart Type')}</InputLabel>
                                            <Select
                                                value={chartType}
                                                label={t('Chart Type')}
                                                onChange={(e) => setChartType(e.target.value)}
                                                sx={{
                                                    color: COLORS.text,
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: alpha(COLORS.primary, 0.5),
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: COLORS.primary,
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: COLORS.primary,
                                                    }
                                                }}
                                            >
                                                <MenuItem value="line">{t('Line Chart')}</MenuItem>
                                                <MenuItem value="area">{t('Area Chart')}</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl sx={{ minWidth: 120 }}>
                                            <InputLabel sx={{ color: COLORS.text }}>{t('Time Range')}</InputLabel>
                                            <Select
                                                value={timeRange}
                                                label={t('Time Range')}
                                                onChange={(e) => setTimeRange(e.target.value)}
                                                sx={{
                                                    color: COLORS.text,
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: alpha(COLORS.primary, 0.5),
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: COLORS.primary,
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: COLORS.primary,
                                                    }
                                                }}
                                            >
                                                <MenuItem value="week">{t('Last Week')}</MenuItem>
                                                <MenuItem value="month">{t('Last Month')}</MenuItem>
                                                <MenuItem value="year">{t('Last Year')}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={chartType}
                                        variants={chartVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        style={{ height: 400 }}
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            {renderMainChart()}
                                        </ResponsiveContainer>
                                    </motion.div>
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>

                <Grid item xs={12} md={6}>
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        custom={1}
                    >
                        <Card sx={{
                            backgroundColor: COLORS.cardBg,
                            borderRadius: '16px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            overflow: 'hidden',
                            border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
                            height: '100%'
                        }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" sx={{ color: COLORS.text, fontWeight: 600 }}>
                                        {t('Average Daily Nutrition')}
                                    </Typography>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={showPct}
                                                onChange={() => setShowPct(!showPct)}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        color: COLORS.primary,
                                                        '&:hover': {
                                                            backgroundColor: alpha(COLORS.primary, 0.1),
                                                        },
                                                    },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                        backgroundColor: COLORS.primary,
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" sx={{ color: COLORS.text }}>
                                                {t('Show %')}
                                            </Typography>
                                        }
                                    />
                                </Box>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`bar-${showPct}`}
                                        variants={chartVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        style={{ height: 300 }}
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={nutritionData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLines} />
                                                <XAxis dataKey="name" stroke={COLORS.text} />
                                                <YAxis stroke={COLORS.text} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <defs>
                                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={COLORS.primary} stopOpacity={1} />
                                                        <stop offset="100%" stopColor={COLORS.quaternary} stopOpacity={0.8} />
                                                    </linearGradient>
                                                </defs>
                                                <Bar
                                                    dataKey={showPct ? "pct" : "value"}
                                                    fill="url(#barGradient)"
                                                    radius={[8, 8, 0, 0]}
                                                    animationDuration={1500}
                                                    animationBegin={300}
                                                    label={{
                                                        position: 'top',
                                                        fill: COLORS.text,
                                                        fontSize: 12,
                                                        formatter: showPct ? (value) => `${value}%` : (value) => value
                                                    }}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </motion.div>
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>

                <Grid item xs={12} md={6}>
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        custom={2}
                    >
                        <Card sx={{
                            backgroundColor: COLORS.cardBg,
                            borderRadius: '16px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            overflow: 'hidden',
                            border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
                            height: '100%'
                        }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ color: COLORS.text, fontWeight: 600 }}>
                                    {t('Nutrition Distribution')}
                                </Typography>
                                <motion.div
                                    variants={chartVariants}
                                    initial="hidden"
                                    animate="visible"
                                    style={{ height: 300 }}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <defs>
                                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                                </filter>
                                            </defs>
                                            <Pie
                                                data={nutritionData.filter(item => item.name !== "Calories")}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                animationDuration={1500}
                                                animationBegin={600}
                                                filter="url(#glow)"
                                            >
                                                <Cell fill={COLORS.primary} />
                                                <Cell fill={COLORS.secondary} />
                                                <Cell fill={COLORS.accent} />
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analytics;