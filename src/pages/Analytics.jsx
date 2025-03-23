import { useState } from 'react';
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
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Analytics() {
    const { t } = useLanguage();
    const [timeRange, setTimeRange] = useState('week');

    // Пример данных для графиков
    const calorieData = [
        { name: 'Mon', calories: 2100 },
        { name: 'Tue', calories: 1950 },
        { name: 'Wed', calories: 2200 },
        { name: 'Thu', calories: 2050 },
        { name: 'Fri', calories: 2300 },
        { name: 'Sat', calories: 1800 },
        { name: 'Sun', calories: 2000 },
    ];

    const macroData = [
        { name: t('protein'), value: 30 },
        { name: t('carbs'), value: 40 },
        { name: t('fats'), value: 30 },
    ];

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    {t('analytics')}
                </Typography>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>{t('timeRange')}</InputLabel>
                    <Select
                        value={timeRange}
                        label={t('timeRange')}
                        onChange={handleTimeRangeChange}
                    >
                        <MenuItem value="week">{t('week')}</MenuItem>
                        <MenuItem value="month">{t('month')}</MenuItem>
                        <MenuItem value="year">{t('year')}</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('calorieIntake')}
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={calorieData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="calories"
                                            stroke="#8884d8"
                                            name={t('calories')}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('macroDistribution')}
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={macroData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                `${name} ${(percent * 100).toFixed(0)}%`
                                            }
                                        >
                                            {macroData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('nutritionGoals')}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body1" gutterBottom>
                                    {t('dailyCalorieGoal')}: 2000 kcal
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {t('proteinGoal')}: 150g
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {t('carbsGoal')}: 250g
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {t('fatsGoal')}: 70g
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('progress')}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body1" gutterBottom>
                                    {t('weeklyAverage')}: 2050 kcal
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {t('monthlyAverage')}: 2100 kcal
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {t('goalAchievement')}: 85%
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
} 