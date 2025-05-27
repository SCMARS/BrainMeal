import { Box, Typography, LinearProgress, Chip, Tooltip } from '@mui/material';
import { CheckCircle, Warning, Error } from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * Компонент для отображения точности плана питания по калориям
 */
const AccuracyIndicator = ({ accuracyCheck, compact = false }) => {
    if (!accuracyCheck) {
        return null;
    }

    const { overallAccuracy, accurateDays, totalDays, isHighlyAccurate } = accuracyCheck;

    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 95) return '#4caf50'; // Зеленый
        if (accuracy >= 85) return '#ff9800'; // Оранжевый
        return '#f44336'; // Красный
    };

    const getAccuracyIcon = (accuracy) => {
        if (accuracy >= 95) return <CheckCircle sx={{ color: '#4caf50' }} />;
        if (accuracy >= 85) return <Warning sx={{ color: '#ff9800' }} />;
        return <Error sx={{ color: '#f44336' }} />;
    };

    const getAccuracyText = (accuracy) => {
        if (accuracy >= 95) return 'Отличная точность';
        if (accuracy >= 85) return 'Хорошая точность';
        return 'Требует улучшения';
    };

    if (compact) {
        return (
            <Tooltip title={`Точность: ${overallAccuracy}% (${accurateDays}/${totalDays} дней)`}>
                <Chip
                    icon={getAccuracyIcon(overallAccuracy)}
                    label={`${overallAccuracy}%`}
                    size="small"
                    sx={{
                        backgroundColor: `${getAccuracyColor(overallAccuracy)}20`,
                        color: getAccuracyColor(overallAccuracy),
                        border: `1px solid ${getAccuracyColor(overallAccuracy)}50`
                    }}
                />
            </Tooltip>
        );
    }

    return (
        <Box sx={{
            p: 2,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)',
            borderRadius: 2,
            border: `1px solid ${getAccuracyColor(overallAccuracy)}50`,
            mb: 2
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getAccuracyIcon(overallAccuracy)}
                <Typography 
                    variant="h6" 
                    sx={{ 
                        ml: 1, 
                        color: getAccuracyColor(overallAccuracy),
                        fontWeight: 'bold'
                    }}
                >
                    {getAccuracyText(overallAccuracy)}
                </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Общая точность
                    </Typography>
                    <Typography variant="body2" sx={{ color: getAccuracyColor(overallAccuracy), fontWeight: 'bold' }}>
                        {overallAccuracy}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={overallAccuracy}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: getAccuracyColor(overallAccuracy),
                            borderRadius: 4
                        }
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Точных дней: {accurateDays} из {totalDays}
                </Typography>
                {isHighlyAccurate && (
                    <Chip
                        label="🎯 Высокая точность"
                        size="small"
                        sx={{
                            backgroundColor: '#4caf5020',
                            color: '#4caf50',
                            fontSize: '0.75rem'
                        }}
                    />
                )}
            </Box>

            {accuracyCheck.recommendations && accuracyCheck.recommendations.length > 0 && (
                <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 'bold', mb: 1 }}>
                        Рекомендации:
                    </Typography>
                    {accuracyCheck.recommendations.slice(0, 3).map((rec, index) => (
                        <Typography 
                            key={index} 
                            variant="caption" 
                            sx={{ 
                                display: 'block', 
                                color: 'rgba(255,255,255,0.8)',
                                mb: 0.5,
                                fontSize: '0.75rem'
                            }}
                        >
                            • {rec}
                        </Typography>
                    ))}
                </Box>
            )}
        </Box>
    );
};

AccuracyIndicator.propTypes = {
    accuracyCheck: PropTypes.shape({
        overallAccuracy: PropTypes.number.isRequired,
        accurateDays: PropTypes.number.isRequired,
        totalDays: PropTypes.number.isRequired,
        isHighlyAccurate: PropTypes.bool.isRequired,
        recommendations: PropTypes.arrayOf(PropTypes.string)
    }),
    compact: PropTypes.bool
};

export default AccuracyIndicator;
