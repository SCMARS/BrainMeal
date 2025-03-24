import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GlobalStyles,
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
    Container,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Article as ArticleIcon,
    PlayCircle as VideoIcon,
    School as CourseIcon,
    Lightbulb as TipIcon,
    StarBorder as SpecialtyIcon,
    Check as CheckIcon,
    Person as InstructorIcon,
    Timer as DurationIcon,
    LabelImportant as CategoryIcon,
    WaterDrop as WaterDropIcon,
    Psychology as PsychologyIcon,
    AccessTime as TimerIcon,
} from '@mui/icons-material';
import {useLanguage} from "@/context/LanguageContext.jsx";





const AnimatedCard = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
    >
        {children}
    </motion.div>
);

export default function EnhancedEducation() {
    const { t } = useLanguage();
    const [tabValue, setTabValue] = useState(0);
    const theme = useTheme();


    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Обработчик смены вкладок
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Глобальные стили, чтобы убрать возможные отступы у body/html
    const globalStyles = (
        <GlobalStyles
            styles={{
                'html, body': {
                    margin: 0,
                    padding: 0,
                    background: `linear-gradient(135deg, #1c1c1c 0%, #2e2e2e 50%, #FF5722 100%)`,
                    fontFamily: 'Roboto, sans-serif',
                }
            }}
        />
    );

    // --------------------
    // Данные для вкладок
    // --------------------
    // Примерные статьи
    const articles = [
        {
            id: 1,
            title: 'Harvard Health Publishing: The truth about fats',
            description: 'An in-depth look at which fats are healthy, which are harmful, and how to balance your diet.',
            author: 'Harvard Health',
            readTime: '8 min read',
            category: 'Nutrition Science',
            image: 'https://www.health.harvard.edu/media/content/images/cr/GettyImages-1262070063.jpg',
            link: 'https://www.health.harvard.edu/staying-healthy/the-truth-about-fats'
        },
        {
            id: 2,
            title: 'Mayo Clinic: Stress Management',
            description: 'Learn practical strategies for dealing with stress and improving your mental well-being.',
            author: 'Mayo Clinic Staff',
            readTime: '10 min read',
            category: 'Mental Wellness',
            image: 'https://www.mayoclinic.org/-/media/kcms/gbs/patient-consumer/images/2019/12/18/19/23/stress-relief.jpg',
            link: 'https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress/art-20046037'
        },
        {
            id: 3,
            title: 'Johns Hopkins Medicine: Intermittent Fasting',
            description: 'Explore the science behind intermittent fasting and its effects on health.',
            author: 'Johns Hopkins Medicine',
            readTime: '6 min read',
            category: 'Nutrition Timing',
            image: 'https://www.hopkinsmedicine.org/sebin/o/g/Intermittent-Fasting.jpg',
            link: 'https://www.hopkinsmedicine.org/health/wellness-and-prevention/intermittent-fasting'
        },
        {
            id: 4,
            title: 'WHO: Physical Activity Guidelines',
            description: 'Global recommendations on how to stay active for better health.',
            author: 'World Health Organization',
            readTime: '5 min read',
            category: 'Physical Activity',
            image: 'https://www.who.int/images/default-source/health-topics/physical-activity/physical-activity.jpg',
            link: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity'
        },
        {
            id: 5,
            title: 'Cleveland Clinic: Plant-Based Diet Benefits',
            description: 'Why a plant-based diet can be beneficial and how to start transitioning.',
            author: 'Cleveland Clinic Staff',
            readTime: '7 min read',
            category: 'Nutrition Science',
            image: 'https://health.clevelandclinic.org/wp-content/uploads/sites/3/2019/11/plantBasedDiet-856557164-770x553-650x428.jpg',
            link: 'https://health.clevelandclinic.org/why-plant-based-diets-are-good-for-you/'
        },
        {
            id: 6,
            title: 'NIH: Sleep and Mental Health',
            description: 'How sleep impacts mental health and strategies to improve your sleep quality.',
            author: 'National Institutes of Health',
            readTime: '9 min read',
            category: 'Mental Wellness',
            image: 'https://www.nimh.nih.gov/sites/default/files/images/health-topic-images/sleep/sleep-and-mental-health_1775600115_1200x675.jpg',
            link: 'https://www.nimh.nih.gov/health/topics/sleep'
        }
    ];

    // Примерные видео
    const videos = [
        {
            id: 1,
            title: 'Metabolic Mastery',
            description: 'Deep dive into metabolism and energy optimization. (YouTube)',
            thumbnail: 'https://img.youtube.com/vi/M1VW2s4-xX4/0.jpg',
            instructor: 'Dr. Sarah Williams',
            duration: '45 mins',
            difficulty: 'Intermediate',
            skills: [
                'Understanding Metabolic Processes',
                'Energy Efficiency Techniques',
                'Nutrition Optimization'
            ],
            link: 'https://www.youtube.com/watch?v=M1VW2s4-xX4'
        },
        {
            id: 2,
            title: 'Hydration Science',
            description: 'Advanced strategies for optimal hydration and performance. (YouTube)',
            thumbnail: 'https://img.youtube.com/vi/3-GY0zfeyks/0.jpg',
            instructor: 'Michael Thompson',
            duration: '30 mins',
            difficulty: 'Beginner',
            skills: [
                'Hydration Fundamentals',
                'Performance Hydration Strategies',
                'Recovery Techniques'
            ],
            link: 'https://www.youtube.com/watch?v=3-GY0zfeyks'
        },
        {
            id: 3,
            title: 'TED Talk: The surprising science of motivation',
            description: 'Dan Pink examines the puzzle of motivation. (TED)',
            thumbnail: 'https://img.youtube.com/vi/rrkrvAUbU9Y/0.jpg',
            instructor: 'Dan Pink',
            duration: '18 mins',
            difficulty: 'All Levels',
            skills: [
                'Motivation Strategies',
                'Workplace Psychology',
                'Goal Setting'
            ],
            link: 'https://www.ted.com/talks/dan_pink_the_surprising_science_of_motivation'
        },
        {
            id: 4,
            title: 'Yoga for Stress Relief',
            description: 'Beginner-friendly yoga session to reduce stress and anxiety. (YouTube)',
            thumbnail: 'https://img.youtube.com/vi/v7AYKMP6rOE/0.jpg',
            instructor: 'Yoga with Adriene',
            duration: '25 mins',
            difficulty: 'Beginner',
            skills: [
                'Stress Management',
                'Flexibility',
                'Mind-Body Connection'
            ],
            link: 'https://www.youtube.com/watch?v=v7AYKMP6rOE'
        },
        {
            id: 5,
            title: 'HIIT Workout at Home',
            description: 'High-intensity interval training without equipment. (YouTube)',
            thumbnail: 'https://img.youtube.com/vi/ml6cT4AZdqI/0.jpg',
            instructor: 'Self Fitness',
            duration: '20 mins',
            difficulty: 'Intermediate',
            skills: [
                'Cardio Improvement',
                'Fat Burning',
                'Stamina Building'
            ],
            link: 'https://www.youtube.com/watch?v=ml6cT4AZdqI'
        },
        {
            id: 6,
            title: 'Mindful Breathing Techniques',
            description: 'Simple breathing exercises for relaxation. (YouTube)',
            thumbnail: 'https://img.youtube.com/vi/Wemm-i6XHr8/0.jpg',
            instructor: 'Headspace',
            duration: '10 mins',
            difficulty: 'All Levels',
            skills: [
                'Mindfulness',
                'Anxiety Reduction',
                'Focus Enhancement'
            ],
            link: 'https://www.youtube.com/watch?v=Wemm-i6XHr8'
        }
    ];

    // Примерные курсы
    const courses = [
        {
            id: 1,
            title: 'Peak Performance Nutrition',
            description: 'Comprehensive course on nutrition for optimal health and performance. (Udemy)',
            image: 'https://img-c.udemycdn.com/course/750x422/2022264_8586_4.jpg',
            duration: '6 weeks',
            level: 'Advanced',
            curriculum: [
                'Metabolic Assessment',
                'Personalized Nutrition Planning',
                'Performance Nutrition Strategies'
            ],
            link: 'https://www.udemy.com/course/nutrition-for-peak-performance/'
        },
        {
            id: 2,
            title: 'Mental Resilience Training',
            description: 'Master mental strategies for peak performance and wellness. (Coursera)',
            image: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets2/topics/psych-topic-banner.png',
            duration: '4 weeks',
            level: 'Intermediate',
            curriculum: [
                'Stress Management Techniques',
                'Cognitive Performance Enhancement',
                'Mindset Optimization'
            ],
            link: 'https://www.coursera.org/learn/mental-resilience'
        },
        {
            id: 3,
            title: 'Full-Body Strength and Conditioning',
            description: 'Learn effective workout routines and exercise science. (Udemy)',
            image: 'https://img-c.udemycdn.com/course/750x422/2365890_4f43_3.jpg',
            duration: '8 weeks',
            level: 'Beginner',
            curriculum: [
                'Resistance Training Fundamentals',
                'Progressive Overload Principles',
                'Injury Prevention'
            ],
            link: 'https://www.udemy.com/course/full-body-strength-and-conditioning/'
        },
        {
            id: 4,
            title: 'Mindfulness Meditation Specialization',
            description: 'Reduce stress, improve focus and emotional regulation. (Coursera)',
            image: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets2/topics/meditation.jpg',
            duration: '5 weeks',
            level: 'All Levels',
            curriculum: [
                'Foundations of Mindfulness',
                'Guided Meditation Practices',
                'Applying Mindfulness Daily'
            ],
            link: 'https://www.coursera.org/specializations/mindfulness-meditation'
        },
        {
            id: 5,
            title: 'Healthy Cooking Masterclass',
            description: 'Learn to cook nutritious meals easily. (Udemy)',
            image: 'https://img-c.udemycdn.com/course/750x422/1597116_17d4_6.jpg',
            duration: '3 weeks',
            level: 'Beginner',
            curriculum: [
                'Meal Prep Essentials',
                'Macro & Micro Nutrients',
                'Healthy Recipe Library'
            ],
            link: 'https://www.udemy.com/course/healthy-cooking-masterclass/'
        },
        {
            id: 6,
            title: 'Yoga and Pilates Fusion',
            description: 'Improve flexibility, core strength, and balance. (Coursera)',
            image: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets2/topics/yoga.jpg',
            duration: '6 weeks',
            level: 'Intermediate',
            curriculum: [
                'Yoga Basics',
                'Pilates Core Work',
                'Fusion Flows'
            ],
            link: 'https://www.coursera.org/learn/yoga-and-pilates-fusion'
        }
    ];

    // Примерные советы
    const tips = [
        {
            id: 1,
            title: 'Hydration Optimization',
            description: 'Strategic hydration techniques for peak performance and wellness.',
            category: 'Hydration Science',
            icon: <WaterDropIcon />
        },
        {
            id: 2,
            title: 'Metabolic Meal Timing',
            description: 'Maximize nutrition absorption and metabolic efficiency.',
            category: 'Nutrition Timing',
            icon: <TimerIcon />
        },
        {
            id: 3,
            title: 'Stress-Nutrition Correlation',
            description: 'Dietary strategies to manage stress and improve mental resilience.',
            category: 'Mental Wellness',
            icon: <PsychologyIcon />
        },
        {
            id: 4,
            title: 'Daily Walking Habit',
            description: 'How a 30-minute walk can boost overall health and reduce stress.',
            category: 'Physical Activity',
            icon: <CategoryIcon />
        },
        {
            id: 5,
            title: 'Mindful Breathing Breaks',
            description: 'Short breathing exercises to refocus and reduce anxiety during the day.',
            category: 'Mindfulness',
            icon: <PsychologyIcon />
        },
        {
            id: 6,
            title: 'Sleep Hygiene Routine',
            description: 'Tips to establish a consistent bedtime routine for better rest.',
            category: 'Sleep Health',
            icon: <TimerIcon />
        }
    ];

    // --------------------
    // Анимации для контейнера
    // --------------------
    const containerVariants = {
        hidden: { opacity: 0, x: 100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                when: 'beforeChildren',
                staggerChildren: 0.1
            }
        },
        exit: { opacity: 0, x: -100 }
    };

    // --------------------
    // Рендер карточек
    // --------------------
    const renderArticleCard = (article) => (
        <AnimatedCard key={article.id}>
            <Card
                sx={{
                    backgroundColor: '#1c1c1c',
                    color: '#fff',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 3
                }}
            >
                {article.image && (
                    <CardMedia
                        component="img"
                        height="200"
                        image={article.image}
                        alt={article.title}
                    />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        {article.title}
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ opacity: 0.8 }}>
                        {article.description}
                    </Typography>
                    <Stack spacing={1}>
                        <Box display="flex" alignItems="center">
                            <InstructorIcon sx={{ mr: 1, color: '#FF9800' }} />
                            <Typography variant="body2">{article.author}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <DurationIcon sx={{ mr: 1, color: '#FF9800' }} />
                            <Typography variant="body2">{article.readTime}</Typography>
                        </Box>
                        <Chip
                            icon={<CategoryIcon />}
                            label={article.category}
                            size="small"
                            sx={{ backgroundColor: '#FF5722', color: '#fff' }}
                        />
                    </Stack>
                    {article.link && (
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                mt: 2,
                                backgroundColor: '#FF5722',
                                '&:hover': {
                                    backgroundColor: '#FF9800'
                                }
                            }}
                            onClick={() => window.open(article.link, '_blank')}
                        >
                            {t('readMore')}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </AnimatedCard>
    );

    const renderVideoCard = (video) => (
        <AnimatedCard key={video.id}>
            <Card
                sx={{
                    backgroundColor: '#1c1c1c',
                    color: '#fff',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 3
                }}
            >
                {video.thumbnail && (
                    <CardMedia
                        component="img"
                        height="200"
                        image={video.thumbnail}
                        alt={video.title}
                    />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        {video.title}
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ opacity: 0.8 }}>
                        {video.description}
                    </Typography>
                    <Stack spacing={1}>
                        <Box display="flex" alignItems="center">
                            <InstructorIcon sx={{ mr: 1, color: '#FF9800' }} />
                            <Typography variant="body2">{video.instructor}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <DurationIcon sx={{ mr: 1, color: '#FF9800' }} />
                            <Typography variant="body2">{video.duration}</Typography>
                        </Box>
                        <Chip
                            icon={<SpecialtyIcon />}
                            label={video.difficulty}
                            size="small"
                            sx={{ backgroundColor: '#FF5722', color: '#fff' }}
                        />
                    </Stack>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                        Skills You&#39;ll Learn:
                    </Typography>
                    <Stack spacing={0.5}>
                        {video.skills.map((skill, index) => (
                            <Box key={index} display="flex" alignItems="center">
                                <CheckIcon fontSize="small" sx={{ mr: 1, color: '#FF9800' }} />
                                <Typography variant="body2">{skill}</Typography>
                            </Box>
                        ))}
                    </Stack>
                    {video.link && (
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                mt: 2,
                                backgroundColor: '#FF5722',
                                '&:hover': {
                                    backgroundColor: '#FF9800'
                                }
                            }}
                            onClick={() => window.open(video.link, '_blank')}
                        >
                            {t('watchNow')}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </AnimatedCard>
    );

    const renderCourseCard = (course) => (
        <AnimatedCard key={course.id}>
            <Card
                sx={{
                    backgroundColor: '#1c1c1c',
                    color: '#fff',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 3
                }}
            >
                {course.image && (
                    <CardMedia
                        component="img"
                        height="200"
                        image={course.image}
                        alt={course.title}
                    />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        {course.title}
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ opacity: 0.8 }}>
                        {course.description}
                    </Typography>
                    <Stack spacing={1}>
                        <Box display="flex" alignItems="center">
                            <DurationIcon sx={{ mr: 1, color: '#FF9800' }} />
                            <Typography variant="body2">{course.duration}</Typography>
                        </Box>
                        <Chip
                            icon={<SpecialtyIcon />}
                            label={course.level}
                            size="small"
                            sx={{ backgroundColor: '#FF5722', color: '#fff' }}
                        />
                    </Stack>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                        Curriculum Highlights:
                    </Typography>
                    <Stack spacing={0.5}>
                        {course.curriculum.map((item, index) => (
                            <Box key={index} display="flex" alignItems="center">
                                <CheckIcon fontSize="small" sx={{ mr: 1, color: '#FF9800' }} />
                                <Typography variant="body2">{item}</Typography>
                            </Box>
                        ))}
                    </Stack>
                    {course.link && (
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                mt: 2,
                                backgroundColor: '#FF5722',
                                '&:hover': {
                                    backgroundColor: '#FF9800'
                                }
                            }}
                            onClick={() => window.open(course.link, '_blank')}
                        >
                            {t('enrollNow')}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </AnimatedCard>
    );

    const renderTips = () => (
        <motion.div
            key="tipsList"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <List
                sx={{
                    width: '100%',
                    maxWidth: isMobile ? '100%' : 700,
                    margin: 'auto'
                }}
            >
                {tips.map((tip) => (
                    <motion.div
                        key={tip.id}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <ListItem
                            sx={{
                                backgroundColor: '#1c1c1c',
                                color: '#fff',
                                flexDirection: isSmallMobile ? 'column' : 'row',
                                alignItems: isSmallMobile ? 'flex-start' : 'center',
                                mb: 2,
                                borderRadius: 1,
                                boxShadow: 2,
                                padding: 2
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: isSmallMobile ? '100%' : 'auto',
                                    display: 'flex',
                                    justifyContent: isSmallMobile ? 'center' : 'flex-start',
                                    mb: isSmallMobile ? 1 : 0
                                }}
                            >
                                {React.cloneElement(tip.icon, {
                                    sx: { color: '#FF9800', fontSize: '2rem' }
                                })}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography
                                        align={isSmallMobile ? 'center' : 'left'}
                                        variant="h6"
                                        sx={{ color: '#fff' }}
                                    >
                                        {tip.title}
                                    </Typography>
                                }
                                secondary={
                                    <>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                opacity: 0.8,
                                                display: 'block',
                                                textAlign: isSmallMobile ? 'center' : 'left',
                                                mt: isSmallMobile ? 1 : 0
                                            }}
                                        >
                                            {tip.description}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: isSmallMobile ? 'center' : 'flex-start',
                                                mt: 1
                                            }}
                                        >
                                            <Chip
                                                icon={<CategoryIcon />}
                                                label={tip.category}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#FF5722',
                                                    color: '#fff'
                                                }}
                                            />
                                        </Box>
                                    </>
                                }
                            />
                        </ListItem>
                    </motion.div>
                ))}
            </List>
        </motion.div>
    );

    // --------------------
    // Рендер контента в зависимости от вкладки
    // --------------------
    const renderContent = () => {
        const gridItemSize = isSmallMobile ? 12 : isMobile ? 6 : 4;

        switch (tabValue) {
            case 0:
                return (
                    <motion.div
                        key="articles"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <Grid container spacing={isMobile ? 2 : 3} justifyContent="center">
                            {articles.map((article) => (
                                <Grid item xs={12} sm={gridItemSize} key={article.id}>
                                    {renderArticleCard(article)}
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>
                );
            case 1:
                return (
                    <motion.div
                        key="videos"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <Grid container spacing={isMobile ? 2 : 3} justifyContent="center">
                            {videos.map((video) => (
                                <Grid item xs={12} sm={gridItemSize} key={video.id}>
                                    {renderVideoCard(video)}
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        key="courses"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <Grid container spacing={isMobile ? 2 : 3} justifyContent="center">
                            {courses.map((course) => (
                                <Grid item xs={12} sm={gridItemSize} key={course.id}>
                                    {renderCourseCard(course)}
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>
                );
            case 3:
                return renderTips();
            default:
                return null;
        }
    };

    // --------------------
    // Итоговая разметка
    // --------------------
    return (
        <>
            {globalStyles}
            <Box
                sx={{
                    // Красивый тёмный фон с градиентом и оранжевым оттенком
                    background: `linear-gradient(135deg, #1c1c1c 0%, #2e2e2e 50%, #FF5722 100%)`,
                    backgroundAttachment: 'fixed', // фиксированный фон (по желанию)
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    minHeight: '100vh',
                    color: '#fff',
                    pt: isMobile ? 2 : 4,
                    pb: 4
                }}
            >
                <Container
                    maxWidth="lg"
                    disableGutters
                    sx={{
                        backgroundColor: 'transparent',
                        margin: '0 auto',
                        px: isSmallMobile ? 1 : 2
                    }}
                >
                    {/* Заголовок */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography
                            variant={isMobile ? "h4" : "h3"}
                            component="h1"
                            align="center"
                            gutterBottom
                            sx={{
                                fontWeight: 'bold',
                                fontSize: isSmallMobile ? '1.8rem' : 'inherit',
                                background: `linear-gradient(45deg, #FF5722 30%, #FF9800 90%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 3
                            }}
                        >
                            {t('educationHub')}
                        </Typography>
                    </motion.div>

                    {/* Карточка с Tabs */}
                    <Card
                        sx={{
                            mb: isMobile ? 2 : 4,
                            boxShadow: 3,
                            backgroundColor: '#1c1c1c'
                        }}
                    >
                        <CardContent>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                variant={isMobile ? "scrollable" : "fullWidth"}
                                scrollButtons={isMobile}
                                allowScrollButtonsMobile
                                sx={{
                                    '& .MuiTab-root': {
                                        color: '#fff',
                                        fontSize: isSmallMobile ? '0.8rem' : 'inherit',
                                        padding: isSmallMobile ? '6px 8px' : 'inherit',
                                        minWidth: isSmallMobile ? 'auto' : 'inherit',
                                        '&.Mui-selected': {
                                            color: '#FF5722'
                                        }
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#FF5722'
                                    }
                                }}
                            >
                                <Tab icon={<ArticleIcon />} label={t('articles')} iconPosition="start" />
                                <Tab icon={<VideoIcon />} label={t('videos')} iconPosition="start" />
                                <Tab icon={<CourseIcon />} label={t('courses')} iconPosition="start" />
                                <Tab icon={<TipIcon />} label={t('tips')} iconPosition="start" />
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Анимированный контент под вкладками */}
                    <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
                </Container>
            </Box>
        </>
    );
}

