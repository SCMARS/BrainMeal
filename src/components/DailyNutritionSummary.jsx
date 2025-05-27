import { motion } from 'framer-motion';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import PropTypes from 'prop-types';
import { useLanguage } from '../context/LanguageContext';

const DailyNutritionSummary = ({ meals = [], targetCalories = 2000 }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { t } = useLanguage();

    // Расчет общих значений КБЖУ
    const totalNutrition = meals.reduce((total, meal) => ({
        calories: total.calories + (Number(meal.calories) || 0),
        protein: total.protein + (Number(meal.protein) || 0),
        carbs: total.carbs + (Number(meal.carbs) || 0),
        fat: total.fat + (Number(meal.fat) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Данные для круговой диаграммы
    const pieData = [
        {
            name: t('protein'),
            value: totalNutrition.protein * 4, // 1г белка = 4 ккал
            color: '#ff6b35',
            grams: totalNutrition.protein
        },
        {
            name: t('carbs'),
            value: totalNutrition.carbs * 4, // 1г углеводов = 4 ккал
            color: '#ff8c42',
            grams: totalNutrition.carbs
        },
        {
            name: t('fat'),
            value: totalNutrition.fat * 9, // 1г жира = 9 ккал
            color: '#ffa726',
            grams: totalNutrition.fat
        }
    ];

    // Расчет процентов
    const caloriesPercent = Math.min((totalNutrition.calories / targetCalories) * 100, 100);
    const remainingCalories = Math.max(targetCalories - totalNutrition.calories, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box sx={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    borderRadius: 2,
                    p: 1.5,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                    <Typography sx={{ color: data.color, fontWeight: 'bold' }}>
                        {data.name}
                    </Typography>
                    <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
                        {data.grams}г ({Math.round(data.value)} ккал)
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    CustomTooltip.propTypes = {
        active: PropTypes.bool,
        payload: PropTypes.arrayOf(PropTypes.shape({
            payload: PropTypes.shape({
                color: PropTypes.string,
                name: PropTypes.string,
                grams: PropTypes.number,
                value: PropTypes.number
            })
        }))
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card sx={{
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 50%, rgba(74, 44, 23, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                boxShadow: `
                    0 20px 40px rgba(0,0,0,0.3),
                    0 0 0 1px rgba(255, 107, 53, 0.2)
                `,
                border: '2px solid rgba(255, 107, 53, 0.3)',
                mb: 3
            }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Typography
                            variant={isMobile ? "h6" : "h5"}
                            sx={{
                                background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 'bold',
                                mb: 3,
                                textAlign: 'center'
                            }}
                        >
                            📊 {t('dailyNutritionSummary')}
                        </Typography>
                    </motion.div>

                    <Grid container spacing={3} alignItems="center">
                        {/* Круговая диаграмма */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                            >
                                <Box sx={{ height: { xs: 250, sm: 300 } }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                        stroke={entry.color}
                                                        strokeWidth={2}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </motion.div>
                        </Grid>

                        {/* Статистика */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ textAlign: 'center' }}>
                                {/* Общие калории */}
                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                                        borderRadius: 3,
                                        p: 2,
                                        mb: 2,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {Math.round(totalNutrition.calories)}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                            {t('of')} {targetCalories} {t('kcal')}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                            {Math.round(caloriesPercent)}% {t('ofTarget')}
                                        </Typography>
                                    </Box>
                                </motion.div>

                                {/* Макронутриенты */}
                                <Grid container spacing={1}>
                                    {[
                                        { label: t('protein'), value: totalNutrition.protein, color: '#ff6b35', unit: t('grams') },
                                        { label: t('carbs'), value: totalNutrition.carbs, color: '#ff8c42', unit: t('grams') },
                                        { label: t('fat'), value: totalNutrition.fat, color: '#ffa726', unit: t('grams') }
                                    ].map((item, index) => (
                                        <Grid item xs={4} key={item.label}>
                                            <motion.div
                                                initial={{ y: 30, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                            >
                                                <Box sx={{
                                                    background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`,
                                                    border: `1px solid ${item.color}50`,
                                                    borderRadius: 2,
                                                    p: 1.5,
                                                    textAlign: 'center'
                                                }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            color: item.color,
                                                            fontWeight: 'bold',
                                                            fontSize: { xs: '1rem', sm: '1.25rem' }
                                                        }}
                                                    >
                                                        {Math.round(item.value)}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: 'rgba(255,255,255,0.8)',
                                                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                                                        }}
                                                    >
                                                        {item.label}
                                                    </Typography>
                                                </Box>
                                            </motion.div>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Оставшиеся калории */}
                                {remainingCalories > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        <Box sx={{
                                            mt: 2,
                                            p: 1.5,
                                            background: 'rgba(255, 107, 53, 0.1)',
                                            border: '1px solid rgba(255, 107, 53, 0.3)',
                                            borderRadius: 2
                                        }}>
                                            <Typography sx={{ color: '#ff8c42', fontWeight: 'bold' }}>
                                                {t('remaining')}: {Math.round(remainingCalories)} {t('kcal')}
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </motion.div>
    );
};

DailyNutritionSummary.propTypes = {
    meals: PropTypes.arrayOf(PropTypes.shape({
        calories: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        protein: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        carbs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        fat: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })),
    targetCalories: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default DailyNutritionSummary;
