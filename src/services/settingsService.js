import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';

// Настройки по умолчанию
export const DEFAULT_SETTINGS = {
    // Язык
    language: 'en', // только 'en' и 'ru'
    
    // Тема (только темная)
    theme: 'dark',
    
    // Уведомления
    notifications: {
        email: true,
        push: true,
        mealReminders: true,
        achievementAlerts: true,
        weeklyReports: false
    },
    
    // Настройки приложения
    app: {
        autoSave: true,
        soundEnabled: true,
        animationsEnabled: true,
        compactMode: false
    },
    
    // Настройки профиля
    profile: {
        showEmail: false,
        showProgress: true,
        showAchievements: true
    },
    
    // Настройки планирования
    mealPlan: {
        defaultMealsPerDay: 3,
        includeSnacks: true,
        autoGenerateWeekly: false,
        preferredMealTimes: {
            breakfast: '08:00',
            lunch: '13:00',
            dinner: '19:00'
        }
    },
    
    // Метаданные
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

// Загрузка настроек пользователя
export const loadUserSettings = async (userId) => {
    try {
        const userSettingsRef = doc(db, 'userSettings', userId);
        const docSnap = await getDoc(userSettingsRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('📊 Loaded settings from Firebase');
            
            // Объединяем с настройками по умолчанию для обратной совместимости
            return {
                ...DEFAULT_SETTINGS,
                ...data,
                notifications: {
                    ...DEFAULT_SETTINGS.notifications,
                    ...(data.notifications || {})
                },
                app: {
                    ...DEFAULT_SETTINGS.app,
                    ...(data.app || {})
                },
                profile: {
                    ...DEFAULT_SETTINGS.profile,
                    ...(data.profile || {})
                },
                mealPlan: {
                    ...DEFAULT_SETTINGS.mealPlan,
                    ...(data.mealPlan || {})
                }
            };
        } else {
            // Если настроек нет, создаем базовые
            await initializeUserSettings(userId);
            return DEFAULT_SETTINGS;
        }
    } catch (error) {
        console.error('❌ Error loading settings:', error);
        return DEFAULT_SETTINGS;
    }
};

// Инициализация настроек для нового пользователя
export const initializeUserSettings = async (userId) => {
    try {
        const userSettingsRef = doc(db, 'userSettings', userId);
        await setDoc(userSettingsRef, {
            ...DEFAULT_SETTINGS,
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        console.log('✅ Initialized settings for user:', userId);
    } catch (error) {
        console.error('❌ Error initializing settings:', error);
        throw error;
    }
};

// Сохранение настроек пользователя
export const saveUserSettings = async (userId, settings) => {
    try {
        const userSettingsRef = doc(db, 'userSettings', userId);
        
        const updatedSettings = {
            ...settings,
            userId,
            updatedAt: new Date().toISOString()
        };

        await updateDoc(userSettingsRef, updatedSettings);
        console.log('✅ Settings saved to Firebase');
        
        return updatedSettings;
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        throw error;
    }
};

// Обновление языка
export const updateLanguage = async (userId, language) => {
    try {
        // Проверяем, что язык поддерживается
        if (!['en', 'ru'].includes(language)) {
            throw new Error('Unsupported language');
        }
        
        const userSettingsRef = doc(db, 'userSettings', userId);
        await updateDoc(userSettingsRef, {
            language,
            updatedAt: new Date().toISOString()
        });
        
        // Также сохраняем в localStorage для быстрого доступа
        localStorage.setItem('language', language);
        
        console.log('✅ Language updated to:', language);
        return language;
    } catch (error) {
        console.error('❌ Error updating language:', error);
        throw error;
    }
};

// Обновление настроек уведомлений
export const updateNotificationSettings = async (userId, notifications) => {
    try {
        const userSettingsRef = doc(db, 'userSettings', userId);
        await updateDoc(userSettingsRef, {
            notifications,
            updatedAt: new Date().toISOString()
        });
        
        console.log('✅ Notification settings updated');
        return notifications;
    } catch (error) {
        console.error('❌ Error updating notification settings:', error);
        throw error;
    }
};

// Обновление настроек приложения
export const updateAppSettings = async (userId, appSettings) => {
    try {
        const userSettingsRef = doc(db, 'userSettings', userId);
        await updateDoc(userSettingsRef, {
            app: appSettings,
            updatedAt: new Date().toISOString()
        });
        
        console.log('✅ App settings updated');
        return appSettings;
    } catch (error) {
        console.error('❌ Error updating app settings:', error);
        throw error;
    }
};

// Обновление настроек профиля
export const updateProfileSettings = async (userId, profileSettings) => {
    try {
        const userSettingsRef = doc(db, 'userSettings', userId);
        await updateDoc(userSettingsRef, {
            profile: profileSettings,
            updatedAt: new Date().toISOString()
        });
        
        console.log('✅ Profile settings updated');
        return profileSettings;
    } catch (error) {
        console.error('❌ Error updating profile settings:', error);
        throw error;
    }
};

// Обновление настроек планирования питания
export const updateMealPlanSettings = async (userId, mealPlanSettings) => {
    try {
        const userSettingsRef = doc(db, 'userSettings', userId);
        await updateDoc(userSettingsRef, {
            mealPlan: mealPlanSettings,
            updatedAt: new Date().toISOString()
        });
        
        console.log('✅ Meal plan settings updated');
        return mealPlanSettings;
    } catch (error) {
        console.error('❌ Error updating meal plan settings:', error);
        throw error;
    }
};

// Сброс настроек к значениям по умолчанию
export const resetUserSettings = async (userId) => {
    try {
        const userSettingsRef = doc(db, 'userSettings', userId);
        const resetSettings = {
            ...DEFAULT_SETTINGS,
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await setDoc(userSettingsRef, resetSettings);
        console.log('✅ Settings reset to default');
        
        return resetSettings;
    } catch (error) {
        console.error('❌ Error resetting settings:', error);
        throw error;
    }
};

// Экспорт настроек
export const exportUserSettings = async (userId) => {
    try {
        const settings = await loadUserSettings(userId);
        const exportData = {
            ...settings,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `brainmeal-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Settings exported');
    } catch (error) {
        console.error('❌ Error exporting settings:', error);
        throw error;
    }
};

// Импорт настроек
export const importUserSettings = async (userId, file) => {
    try {
        const text = await file.text();
        const importedSettings = JSON.parse(text);
        
        // Валидация импортированных настроек
        if (!importedSettings.version) {
            throw new Error('Invalid settings file format');
        }
        
        // Удаляем метаданные экспорта
        delete importedSettings.exportedAt;
        delete importedSettings.version;
        
        // Сохраняем импортированные настройки
        const savedSettings = await saveUserSettings(userId, importedSettings);
        
        console.log('✅ Settings imported successfully');
        return savedSettings;
    } catch (error) {
        console.error('❌ Error importing settings:', error);
        throw error;
    }
};
