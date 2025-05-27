import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Typography,
    Box,
    LinearProgress,
    Grid,
    Chip,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    LocalFireDepartment as CaloriesIcon,
    FitnessCenter as ProteinIcon,
    Grain as CarbsIcon,
    WaterDrop as FatIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useLanguage } from '../context/LanguageContext';

const NutritionCard = ({
    calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0,
    targetCalories = 2000,
    title = "Nutrition Summary",
    showProgress = true,
    compact = false
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { t } = useLanguage();

    // Расчет процентов от целевых значений с повышенным содержанием белка
    const caloriesPercent = Math.min((calories / targetCalories) * 100, 100);
    const proteinTarget = targetCalories * 0.25 / 4; // 25% от калорий (увеличено с 15%)
    const carbsTarget = targetCalories * 0.45 / 4; // 45% от калорий (уменьшено с 55%)
    const fatTarget = targetCalories * 0.30 / 9; // 30% от калорий

    const proteinPercent = Math.min((protein / proteinTarget) * 100, 100);
    const carbsPercent = Math.min((carbs / carbsTarget) * 100, 100);
    const fatPercent = Math.min((fat / fatTarget) * 100, 100);

    const nutritionData = [
        {
            label: t('Calories'),
            value: calories,
            target: targetCalories,
            percent: caloriesPercent,
            icon: <CaloriesIcon />,
            color: '#ff6b35',
            unit: t('kcal')
        },
        {
            label: t('Protein'),
            value: protein,
            target: proteinTarget,
            percent: proteinPercent,
            icon: <ProteinIcon />,
            color: '#ff8c42',
            unit: t('grams')
        },
        {
            label: t('Carbs'),
            value: carbs,
            target: carbsTarget,
            percent: carbsPercent,
            icon: <CarbsIcon />,
            color: '#ffa726',
            unit: t('grams')
        },
        {
            label: t('Fat'),
            value: fat,
            target: fatTarget,
            percent: fatPercent,
            icon: <FatIcon />,
            color: '#ffb74d',
            unit: t('grams')
        }
    ];

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    {nutritionData.map((item) => (
                        <Chip
                            key={item.label}
                            icon={item.icon}
                            label={`${Math.round(item.value)}${item.unit}`}
                            sx={{
                                background: `linear-gradient(45deg, ${item.color}20, ${item.color}40)`,
                                color: item.color,
                                fontWeight: 'bold',
                                border: `1px solid ${item.color}50`,
                                '& .MuiChip-icon': {
                                    color: item.color
                                }
                            }}
                        />
                    ))}
                </Box>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
        >
            <Card sx={{
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 50%, rgba(74, 44, 23, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                boxShadow: `
                    0 20px 40px rgba(0,0,0,0.3),
                    0 0 0 1px rgba(255, 107, 53, 0.2),
                    inset 0 1px 0 rgba(255, 140, 66, 0.1)
                `,
                border: '2px solid rgba(255, 107, 53, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.1), transparent)',
                    animation: 'shimmer 3s infinite',
                    zIndex: 1
                },
                '@keyframes shimmer': {
                    '0%': { left: '-100%' },
                    '100%': { left: '100%' }
                }
            }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 2 }}>
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
                            {title}
                        </Typography>
                    </motion.div>

                    <Grid container spacing={2}>
                        {nutritionData.map((item, index) => (
                            <Grid item xs={6} sm={3} key={item.label}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                                >
                                    <Box sx={{
                                        textAlign: 'center',
                                        p: 2,
                                        borderRadius: 3,
                                        background: `linear-gradient(135deg, ${item.color}10, ${item.color}20)`,
                                        border: `1px solid ${item.color}30`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: `0 10px 25px ${item.color}30`,
                                            background: `linear-gradient(135deg, ${item.color}20, ${item.color}30)`
                                        }
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
                                            <Box sx={{
                                                color: item.color,
                                                mb: 1,
                                                fontSize: { xs: '1.5rem', sm: '2rem' }
                                            }}>
                                                {item.icon}
                                            </Box>
                                        </motion.div>

                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: 'white',
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
                                            {item.unit}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: item.color,
                                                fontWeight: 'bold',
                                                mt: 0.5,
                                                fontSize: { xs: '0.7rem', sm: '0.8rem' }
                                            }}
                                        >
                                            {item.label}
                                        </Typography>

                                        {showProgress && (
                                            <Box sx={{ mt: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={item.percent}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: item.color,
                                                            borderRadius: 3,
                                                            boxShadow: `0 0 10px ${item.color}50`
                                                        }
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'rgba(255,255,255,0.6)',
                                                        fontSize: '0.6rem',
                                                        mt: 0.5,
                                                        display: 'block'
                                                    }}
                                                >
                                                    {Math.round(item.percent)}% {t('ofTarget')}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </motion.div>
    );
};

NutritionCard.propTypes = {
    calories: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    protein: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    carbs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    targetCalories: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    showProgress: PropTypes.bool,
    compact: PropTypes.bool
};

export default NutritionCard;
