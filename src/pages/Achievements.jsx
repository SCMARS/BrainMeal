import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    LinearProgress,
    Chip,
    useTheme,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    Fab,
    Tabs,
    Tab,
    Fade,
    Zoom,
    Grow
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMealPlan } from '../context/MealPlanContext';
import { useLanguage } from '../context/LanguageContext';
import { useAchievements } from '../context/AchievementsContext';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionLimit from '../components/SubscriptionLimit';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ScheduleIcon from '@mui/icons-material/Schedule';

const AchievementCard = ({ achievement, onCardClick }) => {
    const { t } = useLanguage();
    const theme = useTheme();

    const progressPercentage = achievement.total > 0
        ? Math.round((achievement.progress / achievement.total) * 100)
        : 0;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card
                onClick={onCardClick}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    background: achievement.completed
                        ? `linear-gradient(135deg, #ff6b35, #ff8c42)`
                        : `linear-gradient(135deg, rgba(26, 26, 26, 0.8), rgba(45, 24, 16, 0.8))`,
                    border: `2px solid ${achievement.completed ? '#ff6b35' : 'rgba(255, 107, 53, 0.3)'}`,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                        boxShadow: `0 0 20px ${achievement.completed ? '#ff6b35' : 'rgba(255, 107, 53, 0.5)'}`,
                        transform: 'translateY(-5px)',
                        '& .achievement-icon': {
                            transform: 'scale(1.2) rotate(10deg)',
                        }
                    }
                }}
            >
                <Box sx={{
                    position: 'relative',
                    height: 160,
                    background: achievement.completed
                        ? 'linear-gradient(135deg, #ff6b35, #ff8c42)'
                        : 'linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(45, 24, 16, 0.9))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Box
                        className="achievement-icon"
                        sx={{
                            fontSize: '4rem',
                            transition: 'all 0.3s ease',
                            filter: achievement.completed ? 'none' : 'grayscale(100%)',
                            opacity: achievement.completed ? 1 : 0.6
                        }}
                    >
                        {achievement.icon || (achievement.completed ? '🏆' : '🔒')}
                    </Box>

                    {/* Редкость достижения */}
                    <Chip
                        label={achievement.rarity || 'common'}
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: achievement.rarity === 'legendary' ? '#ffd700' :
                                           achievement.rarity === 'epic' ? '#9c27b0' :
                                           achievement.rarity === 'rare' ? '#2196f3' :
                                           achievement.rarity === 'uncommon' ? '#4caf50' : '#757575',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    />
                </Box>

                <CardContent sx={{ flexGrow: 1, color: 'white' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: 'white' }}>
                            {achievement.titleKey ? t(achievement.titleKey) : achievement.title}
                        </Typography>
                        <Chip
                            label={achievement.completed ? t('completed') : t('inProgress')}
                            color={achievement.completed ? 'success' : 'warning'}
                            size="small"
                            sx={{
                                fontWeight: 'bold',
                                boxShadow: theme.shadows[1]
                            }}
                        />
                    </Box>

                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                        {achievement.descriptionKey ? t(achievement.descriptionKey) : achievement.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Chip
                            label={t(achievement.category)}
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(255, 107, 53, 0.2)',
                                color: '#ff6b35',
                                border: '1px solid #ff6b35'
                            }}
                        />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Прогресс: {achievement.progress}/{achievement.total}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {progressPercentage}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progressPercentage}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                '& .MuiLinearProgress-bar': {
                                    background: 'linear-gradient(90deg, #ff6b35, #ff8c42)',
                                    borderRadius: 4,
                                    boxShadow: '0 0 10px rgba(255, 107, 53, 0.5)'
                                }
                            }}
                        />
                    </Box>

                    {achievement.points && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Chip
                                label={`${achievement.points} очков`}
                                size="small"
                                sx={{
                                    backgroundColor: '#ffd700',
                                    color: '#000',
                                    fontWeight: 'bold'
                                }}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

const StatCard = ({ title, value, icon, color }) => {
    const theme = useTheme();

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette[color].light}15, ${theme.palette[color].main}15)`,
                border: `1px solid ${theme.palette[color].light}30`
            }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {icon}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            {title}
                        </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ color: theme.palette[color].main }}>
                        {value}
                    </Typography>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const Achievements = () => {
    const theme = useTheme();
    const { t } = useLanguage();
    const { meals } = useMealPlan();
    const { achievements, stats, loading: achievementsLoading } = useAchievements();
    const { hasFeature } = useSubscription();
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const achievementsRef = useRef(null);

    // Обработчик скролла
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setShowScrollTop(scrollTop > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Функция прокрутки вверх
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Достижения теперь управляются через AchievementsContext

    // Показываем диалог при получении нового достижения
    useEffect(() => {
        const newlyCompleted = achievements.filter(a => a.completed && !a.wasShown);
        if (newlyCompleted.length > 0) {
            const latestAchievement = newlyCompleted[newlyCompleted.length - 1];
            setSelectedAchievement(latestAchievement);
            setOpenDialog(true);
        }
    }, [achievements]);

    const handleCategoryChange = (event, newValue) => {
        setSelectedCategory(newValue);
    };

    const filteredAchievements = selectedCategory === 'all'
        ? achievements
        : achievements.filter(a => a.category === selectedCategory);

    const categories = [
        { value: 'all', label: 'Все категории' },
        { value: 'meal_planning', label: 'Планирование питания' },
        { value: 'profile', label: 'Профиль' },
        { value: 'consistency', label: 'Постоянство' },
        { value: 'nutrition', label: 'Питание' },
        { value: 'health', label: 'Здоровье' },
        { value: 'variety', label: 'Разнообразие' },
        { value: 'social', label: 'Социальное' },
        { value: 'loyalty', label: 'Лояльность' }
    ];

    // Проверяем доступ к достижениям
    if (!hasFeature('achievements')) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3
            }}>
                <SubscriptionLimit
                    feature="achievements"
                    title={t('achievementsNotAvailable')}
                    description={t('upgradeToAccessAchievements')}
                />
            </Box>
        );
    }

    return (
        <Box sx={{
            p: 3,
            height: '100vh',
            overflowY: 'auto',
            position: 'relative',
            '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
            },
            '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                    background: '#555',
                },
            },
            '&::-webkit-scrollbar-corner': {
                background: '#f1f1f1',
            }
        }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {t('achievements')}
                </Typography>
            </motion.div>

            {/* Статистика достижений */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title={t('totalAchievements')}
                        value={stats.totalAchievements}
                        icon={<EmojiEventsIcon sx={{ color: theme.palette.primary.main }} />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title={t('completed')}
                        value={stats.completedCount}
                        icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title={t('completionRate')}
                        value={`${stats.completionRate}%`}
                        icon={<TrendingUpIcon sx={{ color: theme.palette.info.main }} />}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title={t('points')}
                        value={stats.totalPoints}
                        icon={<StarIcon sx={{ color: '#ffd700' }} />}
                        color="warning"
                    />
                </Grid>
            </Grid>

            {/* Категории */}
            <Box sx={{ mb: 4 }}>
                <Tabs
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': {
                            minWidth: 'auto',
                            px: 2,
                            py: 1,
                            mx: 0.5,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.primary.main,
                            },
                            '&.Mui-selected': {
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                            }
                        }
                    }}
                >
                    {categories.map((category) => (
                        <Tab
                            key={category.value}
                            value={category.value}
                            label={category.label}
                        />
                    ))}
                </Tabs>
            </Box>

            {/* Список достижений */}
            <Grid container spacing={3} ref={achievementsRef}>
                <AnimatePresence>
                    {filteredAchievements.map((achievement) => (
                        <Grid item key={achievement.id} xs={12} sm={6} md={4}>
                            <AchievementCard
                                achievement={achievement}
                                onCardClick={() => {
                                    setSelectedAchievement(achievement);
                                    setOpenDialog(true);
                                }}
                            />
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>

            {/* Диалог достижения */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}15)`,
                        border: `2px solid ${theme.palette.primary.main}`,
                        borderRadius: 2
                    }
                }}
            >
                {selectedAchievement && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <EmojiEventsIcon sx={{ mr: 1, color: 'primary.main', fontSize: 40 }} />
                                </motion.div>
                                <Typography variant="h5" sx={{ color: 'primary.main' }}>
                                    {selectedAchievement.title}
                                </Typography>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5, repeat: 2 }}
                                >
                                    <Box sx={{ fontSize: 80, color: 'primary.main', mb: 2 }}>
                                        {selectedAchievement.icon}
                                    </Box>
                                </motion.div>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    {selectedAchievement.description}
                                </Typography>
                                {selectedAchievement.reward && (
                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                                        <Typography variant="subtitle1" color="primary.main">
                                            {t('Reward')}:
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedAchievement.reward}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>

            {/* Кнопка прокрутки вверх */}
            {showScrollTop && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                >
                    <Fab
                        color="primary"
                        aria-label="scroll to top"
                        onClick={scrollToTop}
                        sx={{
                            position: 'fixed',
                            bottom: 16,
                            right: 16,
                            zIndex: 1000
                        }}
                    >
                        <KeyboardArrowUpIcon />
                    </Fab>
                </motion.div>
            )}
        </Box>
    );
};

export default Achievements;