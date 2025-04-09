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
    Contrast as ContrastIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

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

const ColorPicker = ({ value, onChange }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const colors = [
        '#1976d2', // Blue
        '#2e7d32', // Green
        '#ed6c02', // Orange
        '#d32f2f', // Red
        '#9c27b0', // Purple
        '#0288d1', // Light Blue
        '#388e3c', // Dark Green
        '#f57c00', // Dark Orange
        '#c62828', // Dark Red
        '#7b1fa2', // Dark Purple
    ];

    const open = Boolean(anchorEl);
    const id = open ? 'color-picker-popover' : undefined;

    return (
        <>
            <IconButton
                onClick={handleClick}
                sx={{
                    width: 40,
                    height: 40,
                    border: `2px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    background: value,
                    '&:hover': {
                        background: value,
                        opacity: 0.8
                    }
                }}
            />
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, width: 200 }}>
                    {colors.map((color) => (
                        <IconButton
                            key={color}
                            onClick={() => {
                                onChange({ target: { value: color } });
                                handleClose();
                            }}
                            sx={{
                                width: 30,
                                height: 30,
                                background: color,
                                '&:hover': {
                                    background: color,
                                    opacity: 0.8
                                }
                            }}
                        />
                    ))}
                </Box>
            </Popover>
        </>
    );
};

const DEFAULT_SETTINGS = {
    notifications: true,
    darkMode: false,
    language: 'en',
    sound: true,
    emailNotifications: true,
    twoFactorAuth: false,
    dataCollection: true,
    autoSave: true,
    fontSize: 16,
    themeColor: '#1976d2',
    notificationFrequency: 'daily',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReader: false
    }
};

export default function Settings() {
    const theme = useTheme();
    const { t, language, switchLanguage } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateProfile, logout } = useAuth();
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [isLoading, setIsLoading] = useState(true);

    // Handle navigation state
    useEffect(() => {
        // Reset scroll position when navigating to settings
        window.scrollTo(0, 0);
        
        // Cleanup function
        return () => {
            // Any cleanup if needed
        };
    }, [location]);

    // Load settings from localStorage on mount
    useEffect(() => {
        const loadSettings = () => {
            try {
                const savedSettings = localStorage.getItem('userSettings');
                if (savedSettings) {
                    const parsedSettings = JSON.parse(savedSettings);
                    setSettings(prev => ({
                        ...DEFAULT_SETTINGS,
                        ...parsedSettings
                    }));
                    
                    // Apply theme if it exists
                    if (parsedSettings.darkMode !== undefined) {
                        document.body.classList.toggle('dark-mode', parsedSettings.darkMode);
                    }
                    
                    // Apply language if it exists
                    if (parsedSettings.language) {
                        switchLanguage(parsedSettings.language);
                    }
                }
            } catch (error) {
                console.error('Error loading settings:', error);
                setSnackbar({
                    open: true,
                    message: 'Error loading settings',
                    severity: 'error'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, [switchLanguage]);

    // Save settings to localStorage when they change
    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem('userSettings', JSON.stringify(settings));
            } catch (error) {
                console.error('Error saving settings:', error);
                setSnackbar({
                    open: true,
                    message: 'Error saving settings',
                    severity: 'error'
                });
            }
        }
    }, [settings, isLoading]);

    const handleSettingChange = (setting) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        setSettings(prev => {
            const newSettings = {
                ...prev,
                [setting]: value
            };

            // Handle special cases
            if (setting === 'darkMode') {
                document.body.classList.toggle('dark-mode', value);
            }
            if (setting === 'language') {
                switchLanguage(value);
            }
            if (setting === 'fontSize') {
                document.documentElement.style.fontSize = `${value}px`;
            }

            return newSettings;
        });

        setSnackbar({
            open: true,
            message: 'Setting updated successfully',
            severity: 'success'
        });
    };

    const handleAccessibilityChange = (setting) => (event) => {
        const value = event.target.checked;
        
        setSettings(prev => ({
            ...prev,
            accessibility: {
                ...prev.accessibility,
                [setting]: value
            }
        }));

        // Apply accessibility settings
        if (setting === 'reducedMotion') {
            document.body.classList.toggle('reduced-motion', value);
        }
        if (setting === 'highContrast') {
            document.body.classList.toggle('high-contrast', value);
        }
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            // Here you would typically save settings to backend
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            
            setSnackbar({
                open: true,
                message: 'Settings saved successfully!',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error saving settings',
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS);
        document.body.classList.remove('dark-mode', 'reduced-motion', 'high-contrast');
        document.documentElement.style.fontSize = '16px';
        switchLanguage('en');
        
        setSnackbar({
            open: true,
            message: 'Settings reset to default!',
            severity: 'info'
        });
    };

    const handleExportSettings = () => {
        const settingsStr = JSON.stringify(settings, null, 2);
        const blob = new Blob([settingsStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'brainmeal-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportSettings = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedSettings = JSON.parse(e.target.result);
                    setSettings(prev => ({
                        ...DEFAULT_SETTINGS,
                        ...importedSettings
                    }));
                    setSnackbar({
                        open: true,
                        message: 'Settings imported successfully!',
                        severity: 'success'
                    });
                } catch (error) {
                    setSnackbar({
                        open: true,
                        message: 'Error importing settings',
                        severity: 'error'
                    });
                }
            };
            reader.readAsText(file);
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

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
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
                        {/* Account Settings */}
                        <SettingSection
                            title={t('Account Settings')}
                            icon={<AccountIcon color="primary" />}
                        >
                            <ScrollableContainer sx={{ maxHeight: '300px' }}>
                                <List>
                                    <SettingItem
                                        title={t('Email Notifications')}
                                        description={t('Receive email updates about your account')}
                                        icon={<EmailIcon />}
                                        value={settings.emailNotifications}
                                        action={handleSettingChange('emailNotifications')}
                                    />
                                    <SettingItem
                                        title={t('Two-Factor Authentication')}
                                        description={t('Add an extra layer of security to your account')}
                                        icon={<LockIcon />}
                                        value={settings.twoFactorAuth}
                                        action={handleSettingChange('twoFactorAuth')}
                                    />
                                    <SettingItem
                                        title={t('Data Collection')}
                                        description={t('Help us improve by sharing anonymous usage data')}
                                        icon={<PersonIcon />}
                                        value={settings.dataCollection}
                                        action={handleSettingChange('dataCollection')}
                                    />
                                </List>
                            </ScrollableContainer>
                        </SettingSection>

                        {/* Notification Settings */}
                        <SettingSection
                            title={t('Notification Settings')}
                            icon={<NotificationsIcon color="primary" />}
                        >
                            <ScrollableContainer sx={{ maxHeight: '300px' }}>
                                <List>
                                    <SettingItem
                                        title={t('Push Notifications')}
                                        description={t('Receive push notifications on your device')}
                                        icon={<NotificationsIcon />}
                                        value={settings.notifications}
                                        action={handleSettingChange('notifications')}
                                    />
                                    <SettingItem
                                        title={t('Sound')}
                                        description={t('Play sound for notifications')}
                                        icon={settings.sound ? <VolumeIcon /> : <VolumeOffIcon />}
                                        value={settings.sound}
                                        action={handleSettingChange('sound')}
                                    />
                                </List>
                            </ScrollableContainer>
                        </SettingSection>

                        {/* Appearance Settings */}
                        <SettingSection
                            title={t('Appearance')}
                            icon={<PaletteIcon color="primary" />}
                        >
                            <ScrollableContainer sx={{ maxHeight: '300px' }}>
                                <List>
                                    <SettingItem
                                        title={t('Dark Mode')}
                                        description={t('Switch between light and dark theme')}
                                        icon={settings.darkMode ? <DarkModeIcon /> : <LightModeIcon />}
                                        value={settings.darkMode}
                                        action={handleSettingChange('darkMode')}
                                    />
                                    <ListItem>
                                        <ListItemIcon>
                                            <LanguageIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t('Language')}
                                            secondary={t('Select your preferred language')}
                                        />
                                        <FormControl sx={{ minWidth: 120 }}>
                                            <Select
                                                value={settings.language}
                                                onChange={handleSettingChange('language')}
                                                size="small"
                                            >
                                                <MenuItem value="en">English</MenuItem>
                                                <MenuItem value="ru">Русский</MenuItem>
                                                <MenuItem value="es">Español</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </ListItem>
                                </List>
                            </ScrollableContainer>
                        </SettingSection>

                        {/* Accessibility Settings */}
                        <SettingSection
                            title={t('Accessibility')}
                            icon={<AccessibilityIcon color="primary" />}
                        >
                            <ScrollableContainer sx={{ maxHeight: '300px' }}>
                                <List>
                                    <SettingItem
                                        title={t('High Contrast Mode')}
                                        description={t('Increase contrast for better visibility')}
                                        icon={<ContrastIcon />}
                                        value={settings.accessibility.highContrast}
                                        action={handleAccessibilityChange('highContrast')}
                                    />
                                    <SettingItem
                                        title={t('Reduced Motion')}
                                        description={t('Reduce animations and transitions')}
                                        icon={<MotionPhotosOffIcon />}
                                        value={settings.accessibility.reducedMotion}
                                        action={handleAccessibilityChange('reducedMotion')}
                                    />
                                    <SettingItem
                                        title={t('Screen Reader Support')}
                                        description={t('Optimize for screen readers')}
                                        icon={<ScreenReaderIcon />}
                                        value={settings.accessibility.screenReader}
                                        action={handleAccessibilityChange('screenReader')}
                                    />
                                </List>
                            </ScrollableContainer>
                        </SettingSection>

                        {/* Display Settings */}
                        <SettingSection
                            title={t('Display')}
                            icon={<PaletteIcon color="primary" />}
                        >
                            <ScrollableContainer sx={{ maxHeight: '300px' }}>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <TextFieldsIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t('Font Size')}
                                            secondary={t('Adjust the size of text')}
                                        />
                                        <Slider
                                            value={settings.fontSize}
                                            onChange={handleSettingChange('fontSize')}
                                            min={12}
                                            max={24}
                                            step={1}
                                            marks
                                            valueLabelDisplay="auto"
                                            sx={{ width: 200 }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <PaletteIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t('Theme Color')}
                                            secondary={t('Choose your preferred color')}
                                        />
                                        <ColorPicker
                                            value={settings.themeColor}
                                            onChange={handleSettingChange('themeColor')}
                                        />
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
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    {t('Quick Actions')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={handleSave}
                                        fullWidth
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <CircularProgress size={24} /> : t('Save Changes')}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<RestoreIcon />}
                                        onClick={handleReset}
                                        fullWidth
                                    >
                                        {t('Reset to Default')}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<DownloadIcon />}
                                        onClick={handleExportSettings}
                                        fullWidth
                                    >
                                        {t('Export Settings')}
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
                                        >
                                            {t('Import Settings')}
                                        </Button>
                                    </label>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleLogout}
                                        fullWidth
                                    >
                                        {t('Logout')}
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
                                                label="Pro"
                                                color="primary"
                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                            />
                                        }
                                    >
                                        <Avatar
                                            sx={{ width: 64, height: 64 }}
                                            src={user?.photoURL}
                                        >
                                            {user?.displayName?.[0]}
                                        </Avatar>
                                    </Badge>
                                    <Box sx={{ ml: 2 }}>
                                        <Typography variant="h6">
                                            {user?.displayName || 'User'}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {user?.email}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                    {t('Account Type')}: <Chip size="small" label="Premium" color="primary" />
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {t('Member Since')}: {new Date(user?.metadata?.creationTime).toLocaleDateString()}
                                </Typography>
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
    );
}
