import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Switch,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Slider,
    Divider,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
    Paper,
    Avatar,
    Badge,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Chip,
    Alert,
    Snackbar,
    styled,
    CircularProgress,
    Popover
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    Language as LanguageIcon,
    Palette as PaletteIcon,
    Security as SecurityIcon,
    AccountCircle as AccountIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Restore as RestoreIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    VolumeUp as VolumeIcon,
    VolumeOff as VolumeOffIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Accessibility as AccessibilityIcon,
    TextFields as TextFieldsIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    MotionPhotosOff as MotionPhotosOffIcon,
    Visibility as ScreenReaderIcon,
    Contrast as ContrastIcon,
    Animation as AnimationIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useSubscription } from '../context/SubscriptionContext';

const MotionCard = motion(Card);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);

const ScrollableContainer = styled(Box)(({ theme }) => ({
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
        background: theme.palette.primary.main,
        borderRadius: '4px',
        '&:hover': {
            background: theme.palette.primary.dark,
        },
    },
    '&::-webkit-scrollbar-thumb:active': {
        background: theme.palette.primary.dark,
    },
    paddingRight: '8px',
    marginRight: '-8px',
}));

const SettingSection = ({ title, icon, children }) => {
    const theme = useTheme();
    return (
        <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: `${theme.palette.primary.main}15`,
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {children}
            </CardContent>
        </MotionCard>
    );
};

const SettingItem = ({ title, description, icon, action, value, type = 'switch' }) => {
    const theme = useTheme();
    return (
        <ListItem
            sx={{
                mb: 1,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                    background: 'rgba(255,255,255,0.1)'
                }
            }}
        >
            <ListItemIcon>
                {icon}
            </ListItemIcon>
            <ListItemText
                primary={title}
                secondary={description}
            />
            <ListItemSecondaryAction>
                {type === 'switch' && (
                    <Switch
                        edge="end"
                        checked={value}
                        onChange={action}
                        color="primary"
                    />
                )}
                {type === 'button' && (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={action}
                        startIcon={value ? <CheckCircleIcon /> : <ErrorIcon />}
                    >
                        {value ? 'Enabled' : 'Disabled'}
                    </Button>
                )}
            </ListItemSecondaryAction>
        </ListItem>
    );
};

// Удалены ColorPicker и DEFAULT_SETTINGS - теперь используется SettingsContext

export default function Settings() {
    const theme = useTheme();
    const { t, language, switchLanguage } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateProfile, logout } = useAuth();
    const {
        settings,
        loading: settingsLoading,
        error: settingsError,
        changeLanguage,
        updateNotifications,
        updateApp,
        resetSettings,
        exportSettings,
        importSettings
    } = useSettings();
    const {
        isActive,
        planInfo,
        timeRemaining,
        expiringSoon
    } = useSubscription();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Handle navigation state
    useEffect(() => {
        // Reset scroll position when navigating to settings
        window.scrollTo(0, 0);

        // Cleanup function
        return () => {
            // Any cleanup if needed
        };
    }, [location]);

    // Настройки теперь управляются через SettingsContext

    const handleLanguageChange = async (event) => {
        try {
            const newLanguage = event.target.value;
            await changeLanguage(newLanguage);
            setSnackbar({
                open: true,
                message: t('languageChanged'),
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: t('settingsError'),
                severity: 'error'
            });
        }
    };

    const handleNotificationChange = async (setting) => async (event) => {
        try {
            const value = event.target.checked;
            const newNotifications = {
                ...settings.notifications,
                [setting]: value
            };
            await updateNotifications(newNotifications);
            setSnackbar({
                open: true,
                message: t('settingsSaved'),
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: t('settingsError'),
                severity: 'error'
            });
        }
    };

    const handleAppSettingChange = async (setting) => async (event) => {
        try {
            const value = event.target.checked;
            const newAppSettings = {
                ...settings.app,
                [setting]: value
            };
            await updateApp(newAppSettings);
            setSnackbar({
                open: true,
                message: t('settingsSaved'),
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: t('settingsError'),
                severity: 'error'
            });
        }
    };

    // Удалены ненужные функции handleAccessibilityChange и handleSave

    const handleReset = async () => {
        try {
            await resetSettings();
            setSnackbar({
                open: true,
                message: 'Настройки сброшены к значениям по умолчанию!',
                severity: 'info'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: t('settingsError'),
                severity: 'error'
            });
        }
    };

    const handleExportSettings = async () => {
        try {
            await exportSettings();
            setSnackbar({
                open: true,
                message: 'Настройки экспортированы!',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Ошибка экспорта настроек',
                severity: 'error'
            });
        }
    };

    const handleImportSettings = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                await importSettings(file);
                setSnackbar({
                    open: true,
                    message: 'Настройки импортированы!',
                    severity: 'success'
                });
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: 'Ошибка импорта настроек',
                    severity: 'error'
                });
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setSnackbar({
                open: true,
                message: 'Error during logout',
                severity: 'error'
            });
        }
    };

    if (settingsLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            height: '100vh',
            overflow: 'auto',
            minHeight: '200vh', // Добавляем больше скролла
            paddingBottom: '100px', // Отступ снизу для мобильных
            '&::-webkit-scrollbar': {
                width: '8px',
            },
            '&::-webkit-scrollbar-track': {
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                borderRadius: '4px',
                '&:hover': {
                    background: 'linear-gradient(45deg, #e55a2b, #e8851a)',
                },
            },
        }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <ScrollableContainer>
                <MotionTypography
                    variant="h4"
                    sx={{
                        mb: 4,
                        fontWeight: 'bold',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {t('Settings')}
                </MotionTypography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>


                        {/* Notification Settings */}
                        <SettingSection
                            title={t('notifications')}
                            icon={<NotificationsIcon color="primary" />}
                        >
                            <ScrollableContainer sx={{ maxHeight: '300px' }}>
                                <List>
                                    <SettingItem
                                        title={t('emailNotifications')}
                                        description={t('emailNotificationsDesc')}
                                        icon={<EmailIcon />}
                                        value={settings.notifications?.email || false}
                                        action={handleNotificationChange('email')}
                                    />
                                    <SettingItem
                                        title={t('pushNotifications')}
                                        description={t('pushNotificationsDesc')}
                                        icon={<NotificationsIcon />}
                                        value={settings.notifications?.push || false}
                                        action={handleNotificationChange('push')}
                                    />
                                    <SettingItem
                                        title={t('mealReminders')}
                                        description={t('mealRemindersDesc')}
                                        icon={<VolumeIcon />}
                                        value={settings.notifications?.mealReminders || false}
                                        action={handleNotificationChange('mealReminders')}
                                    />
                                    <SettingItem
                                        title={t('achievementAlerts')}
                                        description={t('achievementAlertsDesc')}
                                        icon={<CheckCircleIcon />}
                                        value={settings.notifications?.achievementAlerts || false}
                                        action={handleNotificationChange('achievementAlerts')}
                                    />
                                </List>
                            </ScrollableContainer>
                        </SettingSection>

                        {/* Appearance Settings */}
                        <SettingSection
                            title={t('appSettings')}
                            icon={<PaletteIcon color="primary" />}
                        >
                            <ScrollableContainer sx={{ maxHeight: '300px' }}>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <DarkModeIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t('darkTheme')}
                                            secondary={t('darkThemeDesc')}
                                        />
                                        <Switch
                                            checked={true}
                                            disabled={true}
                                            color="primary"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <LanguageIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t('language')}
                                            secondary={t('languageDesc')}
                                        />
                                        <FormControl sx={{ minWidth: 120 }}>
                                            <Select
                                                value={settings.language || 'en'}
                                                onChange={handleLanguageChange}
                                                size="small"
                                                sx={{
                                                    color: 'white',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'rgba(255, 107, 53, 0.5)'
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ff6b35'
                                                    }
                                                }}
                                            >
                                                <MenuItem value="en">🇺 English</MenuItem>
                                                <MenuItem value="ru">🇷 Русский</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </ListItem>
                                    <SettingItem
                                        title={t('sounds')}
                                        description={t('soundsDesc')}
                                        icon={<VolumeIcon />}
                                        value={settings.app?.soundEnabled || false}
                                        action={handleAppSettingChange('soundEnabled')}
                                    />
                                    <SettingItem
                                        title={t('animations')}
                                        description={t('animationsDesc')}
                                        icon={<AnimationIcon />}
                                        value={settings.app?.animationsEnabled || false}
                                        action={handleAppSettingChange('animationsEnabled')}
                                    />
                                </List>
                            </ScrollableContainer>
                        </SettingSection>

                        {/* Account Settings */}
                        <SettingSection
                            title={t('accountSettings')}
                            icon={<AccountIcon color="primary" />}
                        >
                            <ScrollableContainer sx={{ maxHeight: '300px' }}>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <PersonIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t('userProfile')}
                                            secondary={user?.email || t('notSpecified')}
                                        />
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => navigate('/profile')}
                                            sx={{
                                                borderColor: '#ff6b35',
                                                color: '#ff6b35',
                                                '&:hover': {
                                                    borderColor: '#ff8c42',
                                                    backgroundColor: 'rgba(255, 107, 53, 0.1)'
                                                }
                                            }}
                                        >
                                            {t('edit')}
                                        </Button>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <SecurityIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t('security')}
                                            secondary={t('passwordManagement')}
                                        />
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            disabled
                                            sx={{
                                                borderColor: 'rgba(255, 107, 53, 0.3)',
                                                color: 'rgba(255, 107, 53, 0.5)'
                                            }}
                                        >
                                            {t('comingSoon')}
                                        </Button>
                                    </ListItem>
                                </List>
                            </ScrollableContainer>
                        </SettingSection>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        {/* Quick Actions */}
                        <MotionCard
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            sx={{
                                mb: 3,
                                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                                    Быстрые действия
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<RestoreIcon />}
                                        onClick={handleReset}
                                        fullWidth
                                        disabled={settingsLoading}
                                        sx={{
                                            borderColor: '#ff6b35',
                                            color: '#ff6b35',
                                            '&:hover': {
                                                borderColor: '#ff8c42',
                                                backgroundColor: 'rgba(255, 107, 53, 0.1)'
                                            }
                                        }}
                                    >
                                        {settingsLoading ? <CircularProgress size={24} /> : 'Сбросить настройки'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<DownloadIcon />}
                                        onClick={handleExportSettings}
                                        fullWidth
                                        sx={{
                                            borderColor: '#ff6b35',
                                            color: '#ff6b35',
                                            '&:hover': {
                                                borderColor: '#ff8c42',
                                                backgroundColor: 'rgba(255, 107, 53, 0.1)'
                                            }
                                        }}
                                    >
                                        Экспорт настроек
                                    </Button>
                                    <input
                                        accept=".json"
                                        style={{ display: 'none' }}
                                        id="import-settings"
                                        type="file"
                                        onChange={handleImportSettings}
                                    />
                                    <label htmlFor="import-settings">
                                        <Button
                                            variant="outlined"
                                            startIcon={<UploadIcon />}
                                            component="span"
                                            fullWidth
                                            sx={{
                                                borderColor: '#ff6b35',
                                                color: '#ff6b35',
                                                '&:hover': {
                                                    borderColor: '#ff8c42',
                                                    backgroundColor: 'rgba(255, 107, 53, 0.1)'
                                                }
                                            }}
                                        >
                                            Импорт настроек
                                        </Button>
                                    </label>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleLogout}
                                        fullWidth
                                        sx={{
                                            borderColor: '#f44336',
                                            color: '#f44336',
                                            '&:hover': {
                                                borderColor: '#f66',
                                                backgroundColor: 'rgba(244, 67, 54, 0.1)'
                                            }
                                        }}
                                    >
                                        {t('logout')}
                                    </Button>
                                </Box>
                            </CardContent>
                        </MotionCard>

                        {/* Account Info */}
                        <MotionCard
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        badgeContent={
                                            <Chip
                                                size="small"
                                                label={isActive ? (planInfo.nameKey ? t(planInfo.nameKey).split(' ')[0] : planInfo.name.split(' ')[0]) : "Free"}
                                                color={isActive ? "primary" : "default"}
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    backgroundColor: isActive ? '#ff6b35' : 'rgba(255,255,255,0.2)',
                                                    color: 'white'
                                                }}
                                            />
                                        }
                                    >
                                        <Avatar
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                background: isActive
                                                    ? 'linear-gradient(45deg, #ff6b35, #f7931e)'
                                                    : 'linear-gradient(45deg, #666, #888)'
                                            }}
                                            src={user?.photoURL}
                                        >
                                            {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                                        </Avatar>
                                    </Badge>
                                    <Box sx={{ ml: 2 }}>
                                        <Typography variant="h6">
                                            {user?.displayName || 'Пользователь'}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {user?.email}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 2 }} />

                                {/* Тип аккаунта */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                        {t('accountType')}:
                                    </Typography>
                                    <Chip
                                        size="medium"
                                        label={isActive ? (planInfo.nameKey ? t(planInfo.nameKey) : planInfo.name) : t('freeAccount')}
                                        sx={{
                                            backgroundColor: isActive ? '#ff6b3520' : 'rgba(255,255,255,0.1)',
                                            color: isActive ? '#ff6b35' : 'rgba(255,255,255,0.7)',
                                            border: `1px solid ${isActive ? '#ff6b3550' : 'rgba(255,255,255,0.2)'}`,
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>

                                {/* Статус подписки */}
                                {isActive && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                            {t('subscriptionStatus')}:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                size="small"
                                                label={expiringSoon ? t('expiringSoon') : t('active')}
                                                color={expiringSoon ? "warning" : "success"}
                                                sx={{ fontSize: '0.75rem' }}
                                            />
                                            <Typography variant="caption" color="textSecondary">
                                                {t('validUntil')} {timeRemaining}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {/* Дата регистрации */}
                                <Typography variant="body2" color="textSecondary">
                                    {t('memberSince')}: {new Date(user?.metadata?.creationTime).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                                </Typography>

                                {/* Кнопка управления подпиской */}
                                <Box sx={{ mt: 2 }}>
                                    <Button
                                        variant={isActive ? "outlined" : "contained"}
                                        fullWidth
                                        onClick={() => navigate('/subscription')}
                                        sx={{
                                            background: isActive
                                                ? 'transparent'
                                                : 'linear-gradient(45deg, #ff6b35, #f7931e)',
                                            borderColor: '#ff6b35',
                                            color: isActive ? '#ff6b35' : 'white',
                                            '&:hover': {
                                                background: isActive
                                                    ? 'rgba(255, 107, 53, 0.1)'
                                                    : 'linear-gradient(45deg, #e55a2b, #e8851a)',
                                                borderColor: '#ff8c42'
                                            }
                                        }}
                                    >
                                        {isActive ? t('manageSubscription') : t('getPremium')}
                                    </Button>
                                </Box>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                </Grid>
            </ScrollableContainer>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                >
                    <Alert
                        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}
