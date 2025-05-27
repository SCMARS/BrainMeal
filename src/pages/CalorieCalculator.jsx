import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Paper,
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

export default function CalorieCalculator() {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        age: '',
        gender: 'male',
        weight: '',
        height: '',
        activity: 'moderate',
        goal: 'maintain',
    });

    const [result, setResult] = useState(null);

    const activityLevels = {
        sedentary: 1.2, // Сидячий образ жизни
        light: 1.375, // Легкая активность
        moderate: 1.55, // Умеренная активность
        active: 1.725, // Активный образ жизни
        veryActive: 1.9, // Очень активный образ жизни
    };

    const goalMultipliers = {
        lose: 0.85, // Снижение веса (дефицит 15%)
        maintain: 1, // Поддержание веса
        gain: 1.15, // Легкий набор массы
        bulking: 1.25, // Интенсивный массонабор (профицит 25%)
    };

    const calculateCalories = () => {
        // Формула Харриса-Бенедикта
        let bmr;
        if (formData.gender === 'male') {
            bmr = 88.362 + (13.397 * formData.weight) + (4.799 * formData.height) - (5.677 * formData.age);
        } else {
            bmr = 447.593 + (9.247 * formData.weight) + (3.098 * formData.height) - (4.330 * formData.age);
        }

        // Учитываем уровень активности и цель
        const tdee = bmr * activityLevels[formData.activity];
        const targetCalories = Math.round(tdee * goalMultipliers[formData.goal]);

        setResult({
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories,
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {t('calorieCalculator')}
            </Typography>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label={t('age')}
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>{t('gender')}</InputLabel>
                                <Select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    label={t('gender')}
                                >
                                    <MenuItem value="male">{t('male')}</MenuItem>
                                    <MenuItem value="female">{t('female')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label={t('weight')}
                                name="weight"
                                type="number"
                                value={formData.weight}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label={t('height')}
                                name="height"
                                type="number"
                                value={formData.height}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography gutterBottom>{t('activityLevel')}</Typography>
                            <Slider
                                value={formData.activity}
                                onChange={(e, value) => handleChange({ target: { name: 'activity', value } })}
                                marks
                                step={null}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => {
                                    const labels = {
                                        sedentary: t('sedentary'),
                                        light: t('light'),
                                        moderate: t('moderate'),
                                        active: t('active'),
                                        veryActive: t('veryActive'),
                                    };
                                    return labels[value];
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>{t('goal')}</InputLabel>
                                <Select
                                    name="goal"
                                    value={formData.goal}
                                    onChange={handleChange}
                                    label={t('goal')}
                                >
                                    <MenuItem value="lose">{t('loseWeight')}</MenuItem>
                                    <MenuItem value="maintain">{t('maintainWeight')}</MenuItem>
                                    <MenuItem value="gain">{t('gainWeight')}</MenuItem>
                                    <MenuItem value="bulking">💪 {t('Bulking')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={calculateCalories}
                                disabled={!formData.age || !formData.weight || !formData.height}
                            >
                                {t('calculate')}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {result && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t('results')}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">{t('bmr')}</Typography>
                            <Typography variant="h4">{result.bmr}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t('caloriesPerDay')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">{t('tdee')}</Typography>
                            <Typography variant="h4">{result.tdee}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t('caloriesPerDay')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">{t('targetCalories')}</Typography>
                            <Typography variant="h4">{result.targetCalories}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t('caloriesPerDay')}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Box>
    );
}