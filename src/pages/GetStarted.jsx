import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Card,
    CardContent,
    Fade,
    Slide,
    Zoom,
    useTheme,
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const GetStarted = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const theme = useTheme();
    const [showContent, setShowContent] = useState(false);

    React.useEffect(() => {
        setShowContent(true);
    }, []);

    const features = [
        {
            title: t('mealPlanning'),
            description: t('mealPlanningDesc'),
            icon: '🍽️',
            delay: 0.2,
        },
        {
            title: t('recipes'),
            description: t('recipesDesc'),
            icon: '📖',
            delay: 0.4,
        },
        {
            title: t('analytics'),
            description: t('analyticsDesc'),
            icon: '📊',
            delay: 0.6,
        },
        {
            title: t('social'),
            description: t('socialDesc'),
            icon: '👥',
            delay: 0.8,
        },
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 2,
            }}
        >
            <Container maxWidth="lg">
                <Fade in={showContent} timeout={1000}>
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '2.5rem', md: '4rem' },
                                fontWeight: 'bold',
                                color: 'white',
                                mb: 2,
                                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                            }}
                        >
                            BrainMeal
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                color: 'white',
                                mb: 4,
                                opacity: 0.9,
                            }}
                        >
                            {t('getStartedSubtitle')}
                        </Typography>
                    </Box>
                </Fade>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Slide
                                direction="up"
                                in={showContent}
                                timeout={1000}
                                style={{ transitionDelay: `${feature.delay * 1000}ms` }}
                            >
                                <Card
                                    sx={{
                                        height: '100%',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <Typography
                                            variant="h2"
                                            sx={{
                                                mb: 2,
                                                fontSize: '3rem',
                                            }}
                                        >
                                            {feature.icon}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 2,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Slide>
                        </Grid>
                    ))}
                </Grid>

                <Zoom in={showContent} timeout={1000} style={{ transitionDelay: '1000ms' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 2,
                            mt: 8,
                        }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{
                                bgcolor: 'white',
                                color: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'grey.100',
                                },
                            }}
                        >
                            {t('getStarted')}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{
                                borderColor: 'white',
                                color: 'white',
                                '&:hover': {
                                    borderColor: 'white',
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                },
                            }}
                        >
                            {t('login')}
                        </Button>
                    </Box>
                </Zoom>
            </Container>
        </Box>
    );
};

export default GetStarted; 