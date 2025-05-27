import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import {
    loadUserSettings,
    saveUserSettings,
    updateLanguage,
    updateNotificationSettings,
    updateAppSettings,
    updateProfileSettings,
    updateMealPlanSettings,
    resetUserSettings,
    exportUserSettings,
    importUserSettings,
    DEFAULT_SETTINGS
} from '../services/settingsService';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const { user } = useAuth();
    const { switchLanguage } = useLanguage();
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Загрузка настроек при входе пользователя
    useEffect(() => {
        if (user?.uid) {
            loadSettings();
        } else {
            setSettings(DEFAULT_SETTINGS);
        }
    }, [user?.uid]);

    // Загрузка настроек
    const loadSettings = async () => {
        try {
            setLoading(true);
            const userSettings = await loadUserSettings(user.uid);
            setSettings(userSettings);
            
            // Применяем язык из настроек
            if (userSettings.language) {
                switchLanguage(userSettings.language);
            }
            
            setError(null);
        } catch (err) {
            console.error('Error loading settings:', err);
            setError('Ошибка загрузки настроек');
        } finally {
            setLoading(false);
        }
    };

    // Сохранение всех настроек
    const saveSettings = async (newSettings) => {
        try {
            setLoading(true);
            const savedSettings = await saveUserSettings(user.uid, newSettings);
            setSettings(savedSettings);
            setError(null);
            return savedSettings;
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Ошибка сохранения настроек');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Обновление языка
    const changeLanguage = async (language) => {
        try {
            setLoading(true);
            await updateLanguage(user.uid, language);
            
            // Обновляем локальное состояние
            setSettings(prev => ({
                ...prev,
                language
            }));
            
            // Применяем язык в контексте
            switchLanguage(language);
            
            setError(null);
            return language;
        } catch (err) {
            console.error('Error changing language:', err);
            setError('Ошибка изменения языка');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Обновление настроек уведомлений
    const updateNotifications = async (notifications) => {
        try {
            setLoading(true);
            const updatedNotifications = await updateNotificationSettings(user.uid, notifications);
            
            setSettings(prev => ({
                ...prev,
                notifications: updatedNotifications
            }));
            
            setError(null);
            return updatedNotifications;
        } catch (err) {
            console.error('Error updating notifications:', err);
            setError('Ошибка обновления уведомлений');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Обновление настроек приложения
    const updateApp = async (appSettings) => {
        try {
            setLoading(true);
            const updatedAppSettings = await updateAppSettings(user.uid, appSettings);
            
            setSettings(prev => ({
                ...prev,
                app: updatedAppSettings
            }));
            
            setError(null);
            return updatedAppSettings;
        } catch (err) {
            console.error('Error updating app settings:', err);
            setError('Ошибка обновления настроек приложения');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Обновление настроек профиля
    const updateProfile = async (profileSettings) => {
        try {
            setLoading(true);
            const updatedProfileSettings = await updateProfileSettings(user.uid, profileSettings);
            
            setSettings(prev => ({
                ...prev,
                profile: updatedProfileSettings
            }));
            
            setError(null);
            return updatedProfileSettings;
        } catch (err) {
            console.error('Error updating profile settings:', err);
            setError('Ошибка обновления настроек профиля');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Обновление настроек планирования питания
    const updateMealPlan = async (mealPlanSettings) => {
        try {
            setLoading(true);
            const updatedMealPlanSettings = await updateMealPlanSettings(user.uid, mealPlanSettings);
            
            setSettings(prev => ({
                ...prev,
                mealPlan: updatedMealPlanSettings
            }));
            
            setError(null);
            return updatedMealPlanSettings;
        } catch (err) {
            console.error('Error updating meal plan settings:', err);
            setError('Ошибка обновления настроек планирования');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Сброс настроек
    const resetSettings = async () => {
        try {
            setLoading(true);
            const resetSettingsData = await resetUserSettings(user.uid);
            setSettings(resetSettingsData);
            
            // Применяем язык по умолчанию
            switchLanguage(resetSettingsData.language);
            
            setError(null);
            return resetSettingsData;
        } catch (err) {
            console.error('Error resetting settings:', err);
            setError('Ошибка сброса настроек');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Экспорт настроек
    const exportSettings = async () => {
        try {
            await exportUserSettings(user.uid);
        } catch (err) {
            console.error('Error exporting settings:', err);
            setError('Ошибка экспорта настроек');
            throw err;
        }
    };

    // Импорт настроек
    const importSettings = async (file) => {
        try {
            setLoading(true);
            const importedSettings = await importUserSettings(user.uid, file);
            setSettings(importedSettings);
            
            // Применяем язык из импортированных настроек
            if (importedSettings.language) {
                switchLanguage(importedSettings.language);
            }
            
            setError(null);
            return importedSettings;
        } catch (err) {
            console.error('Error importing settings:', err);
            setError('Ошибка импорта настроек');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Получение конкретной настройки
    const getSetting = (path) => {
        const keys = path.split('.');
        let value = settings;
        
        for (const key of keys) {
            value = value?.[key];
            if (value === undefined) break;
        }
        
        return value;
    };

    // Обновление конкретной настройки
    const updateSetting = async (path, value) => {
        const keys = path.split('.');
        const newSettings = { ...settings };
        let current = newSettings;
        
        // Навигация к нужному уровню
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        // Установка значения
        current[keys[keys.length - 1]] = value;
        
        return await saveSettings(newSettings);
    };

    const value = {
        settings,
        loading,
        error,
        loadSettings,
        saveSettings,
        changeLanguage,
        updateNotifications,
        updateApp,
        updateProfile,
        updateMealPlan,
        resetSettings,
        exportSettings,
        importSettings,
        getSetting,
        updateSetting
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;
