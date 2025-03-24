import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Stack,
} from '@mui/material';
import {
    Article as ArticleIcon,
    PlayCircle as VideoIcon,
    School as CourseIcon,
    Lightbulb as TipIcon,
} from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';

export default function Education() {
    const { t } = useLanguage();
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const articles = [
        {
            id: 1,
            title: 'The Basics of Healthy Eating',
            description: 'Learn the fundamental principles of maintaining a balanced diet.',
            image: 'https://via.placeholder.com/300x200',
            readTime: '5 min read',
            tags: ['Nutrition', 'Basics'],
        },
        {
            id: 2,
            title: 'Understanding Macronutrients',
            description: 'A comprehensive guide to proteins, carbs, and fats.',
            image: 'https://via.placeholder.com/300x200',
            readTime: '8 min read',
            tags: ['Nutrition', 'Macronutrients'],
        },
    ];

    const videos = [
        {
            id: 1,
            title: 'Meal Prep 101',
            description: 'Learn how to prepare healthy meals for the week.',
            thumbnail: 'https://via.placeholder.com/300x200',
            duration: '15:30',
            instructor: 'Chef Sarah',
        },
        {
            id: 2,
            title: 'Healthy Cooking Techniques',
            description: 'Master the art of cooking nutritious meals.',
            thumbnail: 'https://via.placeholder.com/300x200',
            duration: '12:45',
            instructor: 'Chef Mike',
        },
    ];

    const courses = [
        {
            id: 1,
            title: 'Nutrition Fundamentals',
            description: 'A comprehensive course on basic nutrition principles.',
            image: 'https://via.placeholder.com/300x200',
            duration: '8 weeks',
            level: 'Beginner',
        },
        {
            id: 2,
            title: 'Advanced Meal Planning',
            description: 'Learn advanced techniques for meal planning and preparation.',
            image: 'https://via.placeholder.com/300x200',
            duration: '10 weeks',
            level: 'Advanced',
        },
    ];

    const tips = [
        {
            id: 1,
            title: 'Stay Hydrated',
            description: 'Drink at least 8 glasses of water daily.',
            category: 'Hydration',
        },
        {
            id: 2,
            title: 'Eat Mindfully',
            description: 'Take time to enjoy your meals and listen to your body.',
            category: 'Mindful Eating',
        },
        {
            id: 3,
            title: 'Plan Ahead',
            description: 'Prepare your meals in advance to stay on track.',
            category: 'Meal Planning',
        },
    ];

    const renderContent = () => {
        switch (tabValue) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        {articles.map((article) => (
                            <Grid item xs={12} md={6} key={article.id}>
                                <Card>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={article.image}
                                        alt={article.title}
                                    />
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {article.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {article.description}
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                            {article.tags.map((tag) => (
                                                <Chip key={tag} label={tag} size="small" />
                                            ))}
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">
                                            {article.readTime}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ mt: 2 }}
                                            fullWidth
                                        >
                                            {t('readMore')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        {videos.map((video) => (
                            <Grid item xs={12} md={6} key={video.id}>
                                <Card>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={video.thumbnail}
                                        alt={video.title}
                                    />
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {video.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {video.description}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {t('instructor')}: {video.instructor}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {t('duration')}: {video.duration}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ mt: 2 }}
                                            fullWidth
                                        >
                                            {t('watchNow')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                );
            case 2:
                return (
                    <Grid container spacing={3}>
                        {courses.map((course) => (
                            <Grid item xs={12} md={6} key={course.id}>
                                <Card>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={course.image}
                                        alt={course.title}
                                    />
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {course.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {course.description}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {t('duration')}: {course.duration}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {t('level')}: {course.level}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ mt: 2 }}
                                            fullWidth
                                        >
                                            {t('enrollNow')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                );
            case 3:
                return (
                    <List>
                        {tips.map((tip) => (
                            <ListItem key={tip.id}>
                                <ListItemIcon>
                                    <TipIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={tip.title}
                                    secondary={
                                        <>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {tip.description}
                                            </Typography>
                                            <Chip
                                                label={tip.category}
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                );
            default:
                return null;
        }
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                {t('education')}
            </Typography>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab
                            icon={<ArticleIcon />}
                            label={t('articles')}
                            iconPosition="start"
                        />
                        <Tab
                            icon={<VideoIcon />}
                            label={t('videos')}
                            iconPosition="start"
                        />
                        <Tab
                            icon={<CourseIcon />}
                            label={t('courses')}
                            iconPosition="start"
                        />
                        <Tab
                            icon={<TipIcon />}
                            label={t('tips')}
                            iconPosition="start"
                        />
                    </Tabs>
                </CardContent>
            </Card>

            {renderContent()}
        </Box>
    );
} 