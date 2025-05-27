import { useState } from 'react';
import {
    Box,
    CssBaseline,
    useTheme,
    useMediaQuery,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Avatar
} from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Sidebar from '../Sidebar';
import MobileBottomNav from './MobileBottomNav';

const drawerWidth = 240;

export default function Layout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const location = useLocation();
    const { user } = useAuth();
    const { t } = useLanguage();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Получаем название текущей страницы
    const getPageTitle = () => {
        const path = location.pathname;
        switch (path) {
            case '/dashboard': return t('Dashboard');
            case '/meal-plan': return t('Meal Plan');
            case '/analytics': return t('Analytics');
            case '/achievements': return t('Achievements');
            case '/profile': return t('Profile');
            case '/settings': return t('Settings');
            case '/subscription': return t('Subscription');
            case '/detailed-meal-planner': return t('Detailed Meal Planner');
            case '/calendar': return t('Calendar');
            case '/payment-result': return t('Payment Result');
            default: return 'BrainMeal';
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* Мобильный AppBar */}
            {isMobile && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <AppBar
                        position="fixed"
                        sx={{
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1810 25%, #4a2c17 50%, #ff6b35 75%, #ff8c42 100%)',
                            backdropFilter: 'blur(20px)',
                            borderBottom: '1px solid rgba(255, 107, 53, 0.3)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                            zIndex: theme.zIndex.drawer + 1,
                        }}
                    >
                        <Toolbar sx={{
                            justifyContent: 'space-between',
                            px: { xs: 2, sm: 3 }
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <IconButton
                                        color="inherit"
                                        aria-label="open drawer"
                                        edge="start"
                                        onClick={handleDrawerToggle}
                                        sx={{
                                            mr: 2,
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            '&:hover': {
                                                background: 'rgba(255, 107, 53, 0.2)',
                                                transform: 'scale(1.1)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Typography
                                        variant="h6"
                                        noWrap
                                        component="div"
                                        sx={{
                                            background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 'bold',
                                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                        }}
                                    >
                                        {getPageTitle()}
                                    </Typography>
                                </motion.div>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <IconButton
                                        color="inherit"
                                        sx={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            '&:hover': {
                                                background: 'rgba(255, 107, 53, 0.2)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <NotificationsIcon />
                                    </IconButton>
                                </motion.div>

                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <Avatar
                                        src={user?.photoURL}
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            border: '2px solid rgba(255, 107, 53, 0.5)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: '#ff6b35',
                                                boxShadow: '0 0 15px rgba(255, 107, 53, 0.5)'
                                            }
                                        }}
                                    >
                                        {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                                    </Avatar>
                                </motion.div>
                            </Box>
                        </Toolbar>
                    </AppBar>
                </motion.div>
            )}

            <Sidebar
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
                isMobile={isMobile}
            />

            <Box
                component="main"
                className="scroll-container"
                sx={{
                    flexGrow: 1,
                    p: { xs: 0, sm: 3 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    mt: { xs: '64px', sm: 0 }, // Отступ сверху для мобильного AppBar
                    mb: { xs: '70px', sm: 0 }, // Отступ снизу для мобильного BottomNav
                    position: 'relative',
                    minHeight: { xs: 'calc(100vh - 134px)', sm: '100vh' }, // Учитываем высоту AppBar и BottomNav
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                {children}
            </Box>

            {/* Мобильный нижний навбар */}
            <MobileBottomNav />
        </Box>
    );
}