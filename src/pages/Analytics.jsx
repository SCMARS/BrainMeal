import React, { useState, useEffect } from 'react';
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
    useTheme
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
    Cell
} from 'recharts';
import { useMealPlan } from '../context/MealPlanContext';
import { useLanguage } from '../context/LanguageContext';

const Analytics = () => {
    const theme = useTheme();
    const { t } = useLanguage();
    const { meals, getMealsByWeek, getNutritionSummary } = useMealPlan();
    const [timeRange, setTimeRange] = useState('week');
    const [chartData, setChartData] = useState([]);
    const [nutritionData, setNutritionData] = useState([]);

    useEffect(() => {
        const startDate = new Date();
        if (timeRange === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (timeRange === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
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
        setNutritionData([
            { name: t('Calories'), value: Math.round(avgNutrition.calories / count) },
            { name: t('Protein'), value: Math.round(avgNutrition.protein / count) },
            { name: t('Carbs'), value: Math.round(avgNutrition.carbs / count) },
            { name: t('Fat'), value: Math.round(avgNutrition.fat / count) }
        ]);
    }, [timeRange, meals, getMealsByWeek, t]);

    const COLORS = ['#FF7849', '#FF9F7E', '#FFB39E', '#FFD1C2'];

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

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6">
                                    {t('Nutrition Overview')}
                                </Typography>
                                <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel>{t('Time Range')}</InputLabel>
                                    <Select
                                        value={timeRange}
                                        label={t('Time Range')}
                                        onChange={(e) => setTimeRange(e.target.value)}
                                    >
                                        <MenuItem value="week">{t('Last Week')}</MenuItem>
                                        <MenuItem value="month">{t('Last Month')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box height={400}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="calories"
                                            stroke="#FF7849"
                                            name={t('Calories')}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="protein"
                                            stroke="#FF9F7E"
                                            name={t('Protein')}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="carbs"
                                            stroke="#FFB39E"
                                            name={t('Carbs')}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="fat"
                                            stroke="#FFD1C2"
                                            name={t('Fat')}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('Average Daily Nutrition')}
                                </Typography>
                                <Box height={300}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={nutritionData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#FF7849" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>

                <Grid item xs={12} md={6}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('Nutrition Distribution')}
                                </Typography>
                                <Box height={300}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={nutritionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {nutritionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analytics; 