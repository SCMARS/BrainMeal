import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    LinearProgress,
    Chip,
    Tooltip,
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

const AchievementCard = ({ title, description, progress, image, isCompleted, category }) => {
    const { t } = useLanguage();
    
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
                component="img"
                height="140"
                image={image}
                alt={title}
                sx={{ opacity: isCompleted ? 1 : 0.5 }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="h2">
                        {title}
                    </Typography>
                    <Chip 
                        label={isCompleted ? t('completed') : t('inProgress')} 
                        color={isCompleted ? 'success' : 'primary'} 
                        size="small"
                    />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {description}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    {t(category)}
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" align="right">
                        {progress}%
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

const Achievements = () => {
    const { t } = useLanguage();

    // Пример данных достижений
    const achievements = [
        {
            id: 1,
            title: t('firstMealPlan'),
            description: t('firstMealPlanDesc'),
            progress: 100,
            image: '/images/achievements/meal-plan.jpg',
            isCompleted: true,
            category: 'mealPlanning'
        },
        {
            id: 2,
            title: t('weeklyStreak'),
            description: t('weeklyStreakDesc'),
            progress: 60,
            image: '/images/achievements/streak.jpg',
            isCompleted: false,
            category: 'consistency'
        },
        {
            id: 3,
            title: t('recipeMaster'),
            description: t('recipeMasterDesc'),
            progress: 30,
            image: '/images/achievements/recipes.jpg',
            isCompleted: false,
            category: 'cooking'
        },
        {
            id: 4,
            title: t('nutritionExpert'),
            description: t('nutritionExpertDesc'),
            progress: 45,
            image: '/images/achievements/nutrition.jpg',
            isCompleted: false,
            category: 'education'
        },
        {
            id: 5,
            title: t('socialButterfly'),
            description: t('socialButterflyDesc'),
            progress: 20,
            image: '/images/achievements/social.jpg',
            isCompleted: false,
            category: 'social'
        },
        {
            id: 6,
            title: t('goalAchiever'),
            description: t('goalAchieverDesc'),
            progress: 75,
            image: '/images/achievements/goals.jpg',
            isCompleted: false,
            category: 'goals'
        }
    ];

    const stats = {
        totalAchievements: achievements.length,
        completedAchievements: achievements.filter(a => a.isCompleted).length,
        completionRate: Math.round((achievements.filter(a => a.isCompleted).length / achievements.length) * 100)
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {t('achievements')}
            </Typography>

            {/* Статистика достижений */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('totalAchievements')}
                            </Typography>
                            <Typography variant="h3">
                                {stats.totalAchievements}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('completedAchievements')}
                            </Typography>
                            <Typography variant="h3">
                                {stats.completedAchievements}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t('completionRate')}
                            </Typography>
                            <Typography variant="h3">
                                {stats.completionRate}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Список достижений */}
            <Grid container spacing={3}>
                {achievements.map((achievement) => (
                    <Grid item key={achievement.id} xs={12} sm={6} md={4}>
                        <AchievementCard {...achievement} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Achievements; 