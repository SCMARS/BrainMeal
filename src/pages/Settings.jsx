import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    Select,
    MenuItem,
    Button,
    Divider,
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
    const { t, language, switchLanguage } = useLanguage();
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(true);

    const handleLanguageChange = (event) => {
        switchLanguage(event.target.value);
    };

    const handleSaveSettings = () => {
        // Здесь будет логика сохранения настроек
        console.log('Settings saved');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {t('settings')}
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {t('appearance')}
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={darkMode}
                                onChange={(e) => setDarkMode(e.target.checked)}
                            />
                        }
                        label={t('darkMode')}
                    />
                    <Box sx={{ mt: 2 }}>
                        <Typography gutterBottom>{t('language')}</Typography>
                        <Select
                            value={language}
                            onChange={handleLanguageChange}
                            sx={{ minWidth: 200 }}
                        >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="ru">Русский</MenuItem>
                            <MenuItem value="uk">Українська</MenuItem>
                        </Select>
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {t('notifications')}
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notifications}
                                onChange={(e) => setNotifications(e.target.checked)}
                            />
                        }
                        label={t('pushNotifications')}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={emailUpdates}
                                onChange={(e) => setEmailUpdates(e.target.checked)}
                            />
                        }
                        label={t('emailUpdates')}
                    />
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {t('account')}
                    </Typography>
                    <Button variant="outlined" color="primary" sx={{ mr: 2 }}>
                        {t('changePassword')}
                    </Button>
                    <Button variant="outlined" color="error">
                        {t('deleteAccount')}
                    </Button>
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveSettings}
                >
                    {t('save')}
                </Button>
            </Box>
        </Box>
    );
};

export default Settings; 