import React, { useState, useContext } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';
import { generateMealPlan } from '../services/geminiService';
import { AuthContext } from '../context/AuthContext';

const DetailedMealPlanner = () => {
    const { t } = useLanguage();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [mealPlan, setMealPlan] = useState(null);

    // Состояние для ручного ввода КБЖУ
    const [customMacros, setCustomMacros] = useState({
        calories: '',
        protein: '',
        fat: '',
        carbs: ''
    });

    const handleMacroChange = (field, value) => {
        setCustomMacros(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateDetailedPlan = async () => {
        if (!customMacros.calories || !customMacros.protein || !customMacros.fat || !customMacros.carbs) {
            setError(t('Please fill all KBJU fields'));
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Создаем профиль с пользовательскими макросами
            const profileData = {
                age: 30,
                gender: 'male',
                weight: 70,
                height: 175,
                dietType: 'balanced',
                activityLevel: 'moderate',
                useCustomMacros: true,
                customCalories: customMacros.calories,
                customProtein: customMacros.protein,
                customFat: customMacros.fat,
                customCarbs: customMacros.carbs,
                calorieTarget: customMacros.calories
            };

            const result = await generateMealPlan(profileData, [], [], []);
            setMealPlan(result);
            setSuccess(t('Meal plan generated successfully!'));
        } catch (err) {
            console.error('Error generating meal plan:', err);
            setError(err.message || t('Failed to generate meal plan'));
        } finally {
            setLoading(false);
        }
    };

    const calculateDayTotals = (dayMeals) => {
        return dayMeals.reduce((totals, meal) => ({
            calories: totals.calories + (meal.calories || 0),
            protein: totals.protein + (meal.protein || 0),
            fat: totals.fat + (meal.fat || 0),
            carbs: totals.carbs + (meal.carbs || 0)
        }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
    };

    const groupMealsByDay = (meals) => {
        const grouped = {};
        meals.forEach(meal => {
            const date = new Date(meal.date).toLocaleDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(meal);
        });
        return grouped;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                minHeight: '100vh',
                borderRadius: 3,
                p: 4
            }}>
                <Typography variant="h3" sx={{
                    background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    mb: 4
                }}>
                    🎯 {t('Detailed Meal Planner')}
                </Typography>

                {/* Форма ввода КБЖУ */}
                <Card sx={{
                    background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(255, 140, 66, 0.1))',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    mb: 4
                }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ color: '#ff6b35', mb: 3, fontWeight: 'bold' }}>
                            📊 {t('Enter Target KBJU')}
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label={`🔥 ${t('Calories')}`}
                                    value={customMacros.calories}
                                    onChange={(e) => handleMacroChange('calories', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: 'rgba(255, 107, 53, 0.3)' },
                                            '&:hover fieldset': { borderColor: '#ff6b35' },
                                            '&.Mui-focused fieldset': { borderColor: '#ff6b35' },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#ff6b35' },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label={`💪 ${t('Protein')} (г)`}
                                    value={customMacros.protein}
                                    onChange={(e) => handleMacroChange('protein', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: 'rgba(255, 107, 53, 0.3)' },
                                            '&:hover fieldset': { borderColor: '#ff6b35' },
                                            '&.Mui-focused fieldset': { borderColor: '#ff6b35' },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#ff6b35' },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label={`🥑 ${t('Fat')} (г)`}
                                    value={customMacros.fat}
                                    onChange={(e) => handleMacroChange('fat', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: 'rgba(255, 107, 53, 0.3)' },
                                            '&:hover fieldset': { borderColor: '#ff6b35' },
                                            '&.Mui-focused fieldset': { borderColor: '#ff6b35' },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#ff6b35' },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label={`🍞 ${t('Carbs')} (г)`}
                                    value={customMacros.carbs}
                                    onChange={(e) => handleMacroChange('carbs', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: 'rgba(255, 107, 53, 0.3)' },
                                            '&:hover fieldset': { borderColor: '#ff6b35' },
                                            '&.Mui-focused fieldset': { borderColor: '#ff6b35' },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#ff6b35' },
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={generateDetailedPlan}
                                disabled={loading}
                                sx={{
                                    background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #e55a2b, #e57a32)',
                                    },
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : `🎯 ${t('Generate Detailed Plan')}`}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* Сообщения об ошибках и успехе */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                {/* Отображение сгенерированного плана */}
                {mealPlan && mealPlan.plan && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h4" sx={{ color: '#ff6b35', mb: 3, fontWeight: 'bold' }}>
                            📋 {t('Generated Meal Plan')}
                        </Typography>

                        {Object.entries(groupMealsByDay(mealPlan.plan)).map(([date, dayMeals]) => {
                            const dayTotals = calculateDayTotals(dayMeals);

                            return (
                                <Card key={date} sx={{
                                    mb: 3,
                                    background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.05), rgba(255, 140, 66, 0.05))',
                                    border: '1px solid rgba(255, 107, 53, 0.2)'
                                }}>
                                    <CardContent>
                                        <Typography variant="h5" sx={{ color: '#ff6b35', mb: 2, fontWeight: 'bold' }}>
                                            📅 {date}
                                        </Typography>

                                        {/* Таблица с блюдами */}
                                        <TableContainer component={Paper} sx={{ mb: 2, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ color: '#ff6b35', fontWeight: 'bold' }}>{t('Meal')}</TableCell>
                                                        <TableCell sx={{ color: '#ff6b35', fontWeight: 'bold' }}>{t('Ingredients')}</TableCell>
                                                        <TableCell sx={{ color: '#ff6b35', fontWeight: 'bold' }}>{t('Calories')}</TableCell>
                                                        <TableCell sx={{ color: '#ff6b35', fontWeight: 'bold' }}>{t('Protein')}</TableCell>
                                                        <TableCell sx={{ color: '#ff6b35', fontWeight: 'bold' }}>{t('Fat')}</TableCell>
                                                        <TableCell sx={{ color: '#ff6b35', fontWeight: 'bold' }}>{t('Carbs')}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {dayMeals.map((meal, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell sx={{ color: 'white' }}>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                                    {meal.name}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                                                    {meal.time} | {meal.type}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ color: 'white' }}>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                                    {meal.ingredients.map((ingredient, i) => (
                                                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <Chip
                                                                                label={ingredient}
                                                                                size="small"
                                                                                sx={{
                                                                                    backgroundColor: 'rgba(255, 107, 53, 0.2)',
                                                                                    color: 'white',
                                                                                    fontWeight: 'bold'
                                                                                }}
                                                                            />
                                                                            {/* Показываем детальную информацию о продукте если есть */}
                                                                            {meal.detailed_nutrition && meal.detailed_nutrition[i] && (
                                                                                <Typography variant="caption" sx={{
                                                                                    color: 'rgba(255,255,255,0.7)',
                                                                                    fontSize: '0.7rem'
                                                                                }}>
                                                                                    ({meal.detailed_nutrition[i].calories} ккал,
                                                                                    {meal.detailed_nutrition[i].protein}г белка,
                                                                                    {meal.detailed_nutrition[i].fat}г жира,
                                                                                    {meal.detailed_nutrition[i].carbs}г углеводов)
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                                                {Math.round(meal.calories)}
                                                            </TableCell>
                                                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                                                {Math.round(meal.protein)}г
                                                            </TableCell>
                                                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                                                {Math.round(meal.fat)}г
                                                            </TableCell>
                                                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                                                {Math.round(meal.carbs)}г
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        {/* Итоги дня с точностью попадания в цель */}
                                        <Box sx={{
                                            p: 2,
                                            background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.2), rgba(255, 140, 66, 0.2))',
                                            borderRadius: 2,
                                            border: '1px solid rgba(255, 107, 53, 0.4)'
                                        }}>
                                            <Typography variant="h6" sx={{ color: '#ff6b35', mb: 1, fontWeight: 'bold' }}>
                                                📊 {t('Daily Totals')} vs {t('Target')}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={3}>
                                                    <Typography sx={{ color: 'white' }}>
                                                        🔥 {Math.round(dayTotals.calories)} / {customMacros.calories} {t('kcal')}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{
                                                        color: Math.abs(dayTotals.calories - Number(customMacros.calories)) <= Number(customMacros.calories) * 0.02 ? '#4caf50' : '#ff9800'
                                                    }}>
                                                        {Math.abs(dayTotals.calories - Number(customMacros.calories)) <= Number(customMacros.calories) * 0.02 ? '✅ Точно' :
                                                         `⚠️ ${dayTotals.calories > Number(customMacros.calories) ? '+' : ''}${Math.round(dayTotals.calories - Number(customMacros.calories))}`}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Typography sx={{ color: 'white' }}>
                                                        💪 {Math.round(dayTotals.protein)} / {customMacros.protein}г
                                                    </Typography>
                                                    <Typography variant="caption" sx={{
                                                        color: Math.abs(dayTotals.protein - Number(customMacros.protein)) <= Number(customMacros.protein) * 0.02 ? '#4caf50' : '#ff9800'
                                                    }}>
                                                        {Math.abs(dayTotals.protein - Number(customMacros.protein)) <= Number(customMacros.protein) * 0.02 ? '✅ Точно' :
                                                         `⚠️ ${dayTotals.protein > Number(customMacros.protein) ? '+' : ''}${Math.round(dayTotals.protein - Number(customMacros.protein))}`}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Typography sx={{ color: 'white' }}>
                                                        🥑 {Math.round(dayTotals.fat)} / {customMacros.fat}г
                                                    </Typography>
                                                    <Typography variant="caption" sx={{
                                                        color: Math.abs(dayTotals.fat - Number(customMacros.fat)) <= Number(customMacros.fat) * 0.02 ? '#4caf50' : '#ff9800'
                                                    }}>
                                                        {Math.abs(dayTotals.fat - Number(customMacros.fat)) <= Number(customMacros.fat) * 0.02 ? '✅ Точно' :
                                                         `⚠️ ${dayTotals.fat > Number(customMacros.fat) ? '+' : ''}${Math.round(dayTotals.fat - Number(customMacros.fat))}`}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Typography sx={{ color: 'white' }}>
                                                        🍞 {Math.round(dayTotals.carbs)} / {customMacros.carbs}г
                                                    </Typography>
                                                    <Typography variant="caption" sx={{
                                                        color: Math.abs(dayTotals.carbs - Number(customMacros.carbs)) <= Number(customMacros.carbs) * 0.02 ? '#4caf50' : '#ff9800'
                                                    }}>
                                                        {Math.abs(dayTotals.carbs - Number(customMacros.carbs)) <= Number(customMacros.carbs) * 0.02 ? '✅ Точно' :
                                                         `⚠️ ${dayTotals.carbs > Number(customMacros.carbs) ? '+' : ''}${Math.round(dayTotals.carbs - Number(customMacros.carbs))}`}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default DetailedMealPlanner;
