import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Home as HomeIcon,
    Restaurant as RestaurantIcon,
    Book as BookIcon,
    Analytics as AnalyticsIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    Settings as SettingsIcon,
    EmojiEvents as EmojiEventsIcon,
    CalendarToday as CalendarIcon,
    ShoppingCart as ShoppingCartIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const drawerWidth = 240;

const menuItems = [
    { text: 'home', icon: <HomeIcon />, path: '/' },
    { text: 'mealPlan', icon: <RestaurantIcon />, path: '/meal-plan' },
    { text: 'recipes', icon: <BookIcon />, path: '/recipes' },
    { text: 'analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'social', icon: <PeopleIcon />, path: '/social' },
    { text: 'education', icon: <SchoolIcon />, path: '/education' },
    { text: 'settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'achievements', icon: <EmojiEventsIcon />, path: '/achievements' },
    { text: 'calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'shoppingList', icon: <ShoppingCartIcon />, path: '/shopping-list' },
];

export default function Layout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { t } = useLanguage();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    BrainMeal
                </Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => handleNavigation(item.path)}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={t(item.text)} />
                    </ListItem>
                ))}
                {currentUser && (
                    <ListItem button onClick={() => handleNavigation('/profile')}>
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary={t('profile')} />
                    </ListItem>
                )}
                {currentUser && (
                    <ListItem button onClick={logout}>
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary={t('logout')} />
                    </ListItem>
                )}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        BrainMeal
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                {isMobile ? (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                        sx={{
                            display: { xs: 'block', sm: 'none' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth,
                            },
                        }}
                    >
                        {drawer}
                    </Drawer>
                ) : (
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth,
                            },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                )}
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
} 