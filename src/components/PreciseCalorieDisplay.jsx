import { Box, Typography, Chip, Tooltip, Grid } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useLanguage } from '../context/LanguageContext';

/**
 * Компонент для точного отображения калорий с расчетами и анализом
 */
const PreciseCalorieDisplay = ({
    calories,
    protein,
    carbs,
    fat,
    targetCalories,
    showCalculated = true,
    showDifference = true,
    size = 'medium'
}) => {
    const { t } = useLanguage();
    const numCalories = Number(calories) || 0;
    const numProtein = Number(protein) || 0;
    const numCarbs = Number(carbs) || 0;
    const numFat = Number(fat) || 0;
    const numTarget = Number(targetCalories) || 0;

    // Рассчитываем калории из макронутриентов
    const calculatedCalories = (numProtein * 4) + (numCarbs * 4) + (numFat * 9);

    // Разница между указанными и рассчитанными калориями
    const calorieDifference = numCalories - calculatedCalories;
    const percentageDifference = calculatedCalories > 0 ? (calorieDifference / calculatedCalories) * 100 : 0;

    // Разница с целевыми калориями
    const targetDifference = numCalories - numTarget;
    const targetPercentage = numTarget > 0 ? (targetDifference / numTarget) * 100 : 0;

    // Определяем точность
    const isAccurate = Math.abs(percentageDifference) <= 5; // ±5% допуск
    const isOnTarget = Math.abs(targetPercentage) <= 5; // ±5% от цели

    const getAccuracyColor = () => {
        if (isAccurate) return '#4caf50';
        if (Math.abs(percentageDifference) <= 10) return '#ff9800';
        return '#f44336';
    };

    const getTargetColor = () => {
        if (isOnTarget) return '#4caf50';
        if (Math.abs(targetPercentage) <= 10) return '#ff9800';
        return '#f44336';
    };

    const getTrendIcon = (difference) => {
        if (difference > 5) return <TrendingUp sx={{ fontSize: 16 }} />;
        if (difference < -5) return <TrendingDown sx={{ fontSize: 16 }} />;
        return <Remove sx={{ fontSize: 16 }} />;
    };

    const formatNumber = (num) => Math.round(num * 10) / 10;

    const textSize = size === 'small' ? 'body2' : size === 'large' ? 'h6' : 'body1';
    const chipSize = size === 'small' ? 'small' : 'medium';

    return (
        <Box sx={{
            p: size === 'small' ? 1 : 2,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)',
            borderRadius: 2,
            border: `1px solid ${getAccuracyColor()}30`
        }}>
            {/* Основные калории */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant={textSize} sx={{ color: 'white', fontWeight: 'bold' }}>
                    {formatNumber(numCalories)} {t('kcal')}
                </Typography>

                {isAccurate ? (
                    <Chip
                        label={t('accurate')}
                        size={chipSize}
                        sx={{
                            backgroundColor: '#4caf5020',
                            color: '#4caf50',
                            fontSize: size === 'small' ? '0.7rem' : '0.75rem'
                        }}
                    />
                ) : (
                    <Tooltip title={`${t('deviation')}: ${formatNumber(percentageDifference)}%`}>
                        <Chip
                            label={`±${formatNumber(Math.abs(percentageDifference))}%`}
                            size={chipSize}
                            sx={{
                                backgroundColor: `${getAccuracyColor()}20`,
                                color: getAccuracyColor(),
                                fontSize: size === 'small' ? '0.7rem' : '0.75rem'
                            }}
                        />
                    </Tooltip>
                )}
            </Box>

            {/* Рассчитанные калории */}
            {showCalculated && (
                <Box sx={{ mb: 1 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}
                    >
                        {t('calculation')}: {formatNumber(calculatedCalories)} {t('kcal')}
                        {getTrendIcon(calorieDifference)}
                        {calorieDifference !== 0 && (
                            <span style={{ color: getAccuracyColor() }}>
                                ({calorieDifference > 0 ? '+' : ''}{formatNumber(calorieDifference)})
                            </span>
                        )}
                    </Typography>
                </Box>
            )}

            {/* Макронутриенты */}
            <Grid container spacing={1} sx={{ mb: showDifference && numTarget > 0 ? 1 : 0 }}>
                <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: '#ff6b35' }}>
                        {t('proteinShort')}: {formatNumber(numProtein)}{t('grams')}
                    </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: '#4caf50' }}>
                        {t('fatShort')}: {formatNumber(numFat)}{t('grams')}
                    </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: '#2196f3' }}>
                        {t('carbsShort')}: {formatNumber(numCarbs)}{t('grams')}
                    </Typography>
                </Grid>
            </Grid>

            {/* Разница с целью */}
            {showDifference && numTarget > 0 && (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    backgroundColor: `${getTargetColor()}10`,
                    borderRadius: 1,
                    border: `1px solid ${getTargetColor()}30`
                }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {t('target')}: {formatNumber(numTarget)} {t('kcal')}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getTrendIcon(targetDifference)}
                        <Typography
                            variant="caption"
                            sx={{
                                color: getTargetColor(),
                                fontWeight: 'bold'
                            }}
                        >
                            {targetDifference > 0 ? '+' : ''}{formatNumber(targetDifference)}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Индикатор точности */}
            {!isAccurate && Math.abs(percentageDifference) > 10 && (
                <Box sx={{ mt: 1 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#f44336',
                            fontSize: '0.7rem',
                            fontStyle: 'italic'
                        }}
                    >
                        ⚠️ {t('checkKBJUCalculations')}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

PreciseCalorieDisplay.propTypes = {
    calories: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    protein: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    carbs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    targetCalories: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showCalculated: PropTypes.bool,
    showDifference: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default PreciseCalorieDisplay;
