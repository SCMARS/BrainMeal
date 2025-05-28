import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Typography,
    useTheme,
    Divider,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Drawer,
    AppBar,
    Toolbar,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionStatus from './SubscriptionStatus';
import {
    Dashboard as DashboardIcon,
    Restaurant as RestaurantIcon,
    Timeline as TimelineIcon,
    EmojiEvents as EmojiEventsIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    Logout as LogoutIcon,
    Language as LanguageIcon,
    Star as StarIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
    const theme = useTheme();
    const { t, toggleLanguage } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'error'
    });

    const menuItems = [
        { text: t('Dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
        { text: t('Meal Plan'), icon: <RestaurantIcon />, path: '/meal-plan' },
        { text: t('Analytics'), icon: <TimelineIcon />, path: '/analytics' },
        { text: t('Achievements'), icon: <EmojiEventsIcon />, path: '/achievements' },
        { text: t('Subscription'), icon: <StarIcon />, path: '/subscription' },
        { text: t('Profile'), icon: <PersonIcon />, path: '/profile' },
        { text: t('Settings'), icon: <SettingsIcon />, path: '/settings' }
    ];

    useEffect(() => {
        // Reset loading state when location changes
        setLoading(false);
    }, [location]);

    const handleClick = (path) => {
        if (loading) return; // Prevent multiple clicks

        try {
            setLoading(true);
            setError(null);

            // Check if the path exists in the menu items
            const isValidPath = menuItems.some(item => item.path === path);
            if (!isValidPath) {
                throw new Error('Invalid navigation path');
            }

            // Close mobile drawer if open
            if (isMobile) {
                handleDrawerToggle();
            }

            // Add a small delay for smooth transition
            setTimeout(() => {
                navigate(path);
            }, 150);
        } catch (error) {
            console.error('Navigation error:', error);
            setError(error.message);
            setSnackbar({
                open: true,
                message: error.message,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (loading) return; // Prevent multiple clicks

        try {
            setLoading(true);
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            setError(error.message);
            setSnackbar({
                open: true,
                message: error.message,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const menuItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    const drawer = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                borderRight: `1px solid ${theme.palette.divider}`,
                boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                backgroundColor: `${theme.palette.background.paper}80`
            }}
        >
            <Box sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}20, transparent)`,
                borderBottom: `1px solid ${theme.palette.primary.light}30`
            }}>
                <Typography variant="h6" noWrap component="div">
                    BrainMeal
                </Typography>
                {isMobile && (
                    <IconButton onClick={handleDrawerToggle}>
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Box>

            <Box
                className="custom-scroll"
                sx={{
                    overflow: 'auto',
                    flexGrow: 1,
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#ff6b35 rgba(26, 26, 26, 0.3)'
                }}
            >
                <List>
                    <AnimatePresence>
                        {menuItems.map((item) => (
                            <motion.div
                                key={item.path}
                                variants={menuItemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.2 }}
                            >
                                <ListItemButton
                                    selected={location.pathname === item.path}
                                    onClick={() => handleClick(item.path)}
                                    disabled={loading}
                                    sx={{
                                        '&.Mui-selected': {
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main}20, transparent)`,
                                            borderLeft: `3px solid ${theme.palette.primary.main}`,
                                        },
                                        '&:hover': {
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main}10, transparent)`,
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                    {loading && location.pathname === item.path && (
                                        <CircularProgress size={20} sx={{ ml: 1 }} />
                                    )}
                                </ListItemButton>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </List>
            </Box>

            {/* Статус подписки */}
            <Box sx={{ p: 2 }}>
                <SubscriptionStatus compact={true} />
            </Box>

            <Divider />

            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        src={user?.photoURL}
                        sx={{ width: 40, height: 40, mr: 2 }}
                    >
                        {user?.displayName?.[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">
                            {user?.displayName || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user?.email}
                        </Typography>
                    </Box>
                    <IconButton onClick={handleMenuClick}>
                        <MenuIcon />
                    </IconButton>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => { toggleLanguage(); handleMenuClose(); }}>
                        <ListItemIcon>
                            <LanguageIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('Switch Language')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('Logout')}</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );

    return (
        <>
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        transition: theme.transitions.create(['width', 'margin'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                    },
                }}
            >
                <AnimatePresence>
                    {drawer}
                </AnimatePresence>
            </Drawer>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

Sidebar.propTypes = {
    mobileOpen: PropTypes.bool.isRequired,
    handleDrawerToggle: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired
};

export default Sidebar;