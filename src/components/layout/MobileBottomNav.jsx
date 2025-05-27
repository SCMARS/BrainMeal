import React from 'react';
import { motion } from 'framer-motion';
import {
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Restaurant as RestaurantIcon,
    Timeline as TimelineIcon,
    EmojiEvents as EmojiEventsIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    CalendarToday as CalendarIcon,
    CreditCard as SubscriptionIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const MobileBottomNav = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();

    const navItems = [
        { label: t('Dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
        { label: t('Meal Plan'), icon: <RestaurantIcon />, path: '/meal-plan' },
        { label: t('Analytics'), icon: <TimelineIcon />, path: '/analytics' },
        { label: t('Achievements'), icon: <EmojiEventsIcon />, path: '/achievements' },
        { label: t('Profile'), icon: <PersonIcon />, path: '/profile' }
    ];

    const getCurrentValue = () => {
        const currentPath = location.pathname;
        const currentIndex = navItems.findIndex(item => item.path === currentPath);

        // Дополнительная логика для маршрутов, которые должны подсвечивать определенные вкладки
        if (currentIndex !== -1) {
            return currentIndex;
        }

        // Маршруты, которые должны подсвечивать вкладку "Profile"
        if (['/settings', '/subscription'].includes(currentPath)) {
            return navItems.findIndex(item => item.path === '/profile');
        }

        // Маршруты, которые должны подсвечивать вкладку "Meal Plan"
        if (['/detailed-meal-planner', '/calendar'].includes(currentPath)) {
            return navItems.findIndex(item => item.path === '/meal-plan');
        }

        return 0; // По умолчанию Dashboard
    };

    const handleChange = (event, newValue) => {
        const targetPath = navItems[newValue]?.path;
        if (targetPath) {
            if (import.meta.env.DEV) {
                console.log('🔄 MobileBottomNav Navigation:', {
                    from: location.pathname,
                    to: targetPath,
                    newValue,
                    navItem: navItems[newValue]
                });
            }

            // Принудительная навигация
            try {
                navigate(targetPath, { replace: false });
                if (import.meta.env.DEV) {
                    console.log('✅ Navigation successful to:', targetPath);
                }
            } catch (error) {
                console.error('❌ Navigation error:', error);
            }
        } else {
            console.warn('⚠️ No target path found for index:', newValue);
        }
    };

    // Debug info only in development
    if (import.meta.env.DEV) {
        console.log('🔍 MobileBottomNav Debug:', {
            isMobile,
            currentPath: location.pathname,
            currentValue: getCurrentValue(),
            navItems: navItems.map(item => ({ label: item.label, path: item.path }))
        });
    }

    if (!isMobile) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
        >
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: theme.zIndex.appBar,
                    background: 'linear-gradient(135deg, #1a1a1a 95%, #2d1810 100%)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255, 107, 53, 0.3)',
                    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
                }}
                elevation={3}
            >
                <BottomNavigation
                    value={getCurrentValue()}
                    onChange={handleChange}
                    sx={{
                        background: 'transparent',
                        height: 70,
                        '& .MuiBottomNavigationAction-root': {
                            color: 'rgba(255, 255, 255, 0.6)',
                            transition: 'all 0.3s ease',
                            '&.Mui-selected': {
                                color: '#ff6b35',
                                transform: 'scale(1.1)',
                                '& .MuiBottomNavigationAction-label': {
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }
                            },
                            '&:hover': {
                                color: '#ff8c42',
                                transform: 'scale(1.05)'
                            },
                            '& .MuiBottomNavigationAction-label': {
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                transition: 'all 0.3s ease'
                            }
                        }
                    }}
                >
                    {navItems.map((item, index) => (
                        <motion.div
                            key={item.path}
                            whileTap={{ scale: 0.95 }}
                            style={{ width: '100%' }}
                        >
                            <BottomNavigationAction
                                label={item.label}
                                icon={
                                    <motion.div
                                        animate={{
                                            scale: getCurrentValue() === index ? [1, 1.2, 1] : 1,
                                            rotate: getCurrentValue() === index ? [0, 10, -10, 0] : 0
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            repeat: getCurrentValue() === index ? Infinity : 0,
                                            repeatDelay: 2
                                        }}
                                    >
                                        {item.icon}
                                    </motion.div>
                                }
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (import.meta.env.DEV) {
                                        console.log('🖱️ Direct click on:', item.label, item.path);
                                    }
                                    handleChange(e, index);
                                }}
                                sx={{
                                    minWidth: 'auto',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    '&.Mui-selected': {
                                        background: 'rgba(255, 107, 53, 0.1)',
                                        borderRadius: 2,
                                        margin: '4px 2px',
                                        boxShadow: '0 0 15px rgba(255, 107, 53, 0.3)'
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 107, 53, 0.05)'
                                    }
                                }}
                            />
                        </motion.div>
                    ))}
                </BottomNavigation>
            </Paper>
        </motion.div>
    );
};

export default MobileBottomNav;
