import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const features = [
        {
            title: t('mealPlan'),
            description: 'Plan your meals and track your nutrition goals',
            path: '/meal-plan',
        },
        {
            title: t('recipes'),
            description: 'Discover and save your favorite recipes',
            path: '/recipes',
        },
        {
            title: t('analytics'),
            description: 'Track your progress and analyze your nutrition',
            path: '/analytics',
        },
        {
            title: t('social'),
            description: 'Connect with other users and share your journey',
            path: '/social',
        },
    ];

    return (
        <Box>
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 8,
                    mb: 6,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h2" component="h1" gutterBottom>
                    Welcome to BrainMeal
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom>
                    Your personal nutrition assistant
                </Typography>
                {!currentUser && (
                    <Box sx={{ mt: 4 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{ mr: 2 }}
                        >
                            {t('register')}
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            size="large"
                            onClick={() => navigate('/login')}
                        >
                            {t('login')}
                        </Button>
                    </Box>
                )}
            </Box>

            <Grid container spacing={4}>
                {features.map((feature) => (
                    <Grid item xs={12} sm={6} md={3} key={feature.title}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    transition: 'transform 0.2s',
                                },
                            }}
                            onClick={() => navigate(feature.path)}
                        >
                            <CardContent>
                                <Typography variant="h6" component="h3" gutterBottom>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {feature.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

