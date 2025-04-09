import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({
        en: {
            // Navigation
            home: 'Home',
            dashboard: 'Dashboard',
            profile: 'Profile',
            settings: 'Settings',
            logout: 'Logout',
            login: 'Login',
            register: 'Register',
            
            // Common
            save: 'Save',
            cancel: 'Cancel',
            edit: 'Edit',
            delete: 'Delete',
            confirm: 'Confirm',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            warning: 'Warning',
            info: 'Info',
            
            // Profile
            personalInfo: 'Personal Information',
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
            address: 'Address',
            bio: 'Bio',
            updateProfile: 'Update Profile',
            profileUpdated: 'Profile updated successfully',
            
            // Goals
            goals: 'Goals',
            goalsSection: 'Goals Section',
            setGoals: 'Set Goals',
            weightGoal: 'Weight Goal',
            fitnessGoal: 'Fitness Goal',
            nutritionGoal: 'Nutrition Goal',
            
            // Meal Plan
            mealPlan: 'Meal Plan',
            mealPlanSection: 'Meal Planning Section',
            generatePlan: 'Generate Plan',
            weeklyPlan: 'Weekly Plan',
            dailyPlan: 'Daily Plan',
            recommendedIntake: 'Recommended Intake',
            actualIntake: 'Actual Intake',
            
            // Preferences
            preferences: 'Preferences',
            dietaryRestrictions: 'Dietary Restrictions',
            allergies: 'Allergies',
            favoriteCuisines: 'Favorite Cuisines',
            cooking: 'Cooking',
            social: 'Social',
            
            // Authentication
            loginAction: 'Sign In',
            registerAction: 'Sign Up',
            emailPlaceholder: 'Enter your email',
            passwordPlaceholder: 'Enter your password',
            forgotPassword: 'Forgot Password?',
            rememberMe: 'Remember Me',
            noAccount: "Don't have an account?",
            haveAccount: 'Already have an account?',
            
            // Settings
            accountSettings: 'Account Settings',
            notificationSettings: 'Notification Settings',
            appearanceSettings: 'Appearance Settings',
            languageSettings: 'Language Settings',
            privacySettings: 'Privacy Settings',
            darkMode: 'Dark Mode',
            notifications: 'Notifications',
            sound: 'Sound',
            emailNotifications: 'Email Notifications',
            twoFactorAuth: 'Two-Factor Authentication',
            dataCollection: 'Data Collection',
            autoSave: 'Auto Save',
            fontSize: 'Font Size',
            themeColor: 'Theme Color',
            timezone: 'Timezone',
            dateFormat: 'Date Format',
            timeFormat: 'Time Format',
            highContrast: 'High Contrast Mode',
            reducedMotion: 'Reduced Motion',
            screenReader: 'Screen Reader Support',
            exportSettings: 'Export Settings',
            importSettings: 'Import Settings',
            resetSettings: 'Reset to Default',
            saveChanges: 'Save Changes',
            changesSaved: 'Changes saved successfully',
            errorSaving: 'Error saving changes',
            accountType: 'Account Type',
            memberSince: 'Member Since'
        },
        ru: {
            // Navigation
            home: 'Главная',
            dashboard: 'Панель управления',
            profile: 'Профиль',
            settings: 'Настройки',
            logout: 'Выйти',
            login: 'Войти',
            register: 'Регистрация',
            
            // Common
            save: 'Сохранить',
            cancel: 'Отмена',
            edit: 'Редактировать',
            delete: 'Удалить',
            confirm: 'Подтвердить',
            loading: 'Загрузка...',
            error: 'Ошибка',
            success: 'Успешно',
            warning: 'Предупреждение',
            info: 'Информация',
            
            // Profile
            personalInfo: 'Личная информация',
            name: 'Имя',
            email: 'Email',
            phone: 'Телефон',
            address: 'Адрес',
            bio: 'О себе',
            updateProfile: 'Обновить профиль',
            profileUpdated: 'Профиль успешно обновлен',
            
            // Goals
            goals: 'Цели',
            goalsSection: 'Раздел целей',
            setGoals: 'Установить цели',
            weightGoal: 'Цель по весу',
            fitnessGoal: 'Фитнес цель',
            nutritionGoal: 'Цель по питанию',
            
            // Meal Plan
            mealPlan: 'План питания',
            mealPlanSection: 'Раздел планирования питания',
            generatePlan: 'Сгенерировать план',
            weeklyPlan: 'Недельный план',
            dailyPlan: 'Ежедневный план',
            recommendedIntake: 'Рекомендуемое потребление',
            actualIntake: 'Фактическое потребление',
            
            // Preferences
            preferences: 'Предпочтения',
            dietaryRestrictions: 'Диетические ограничения',
            allergies: 'Аллергии',
            favoriteCuisines: 'Любимые кухни',
            cooking: 'Готовка',
            social: 'Социальное',
            
            // Authentication
            loginAction: 'Войти в систему',
            registerAction: 'Зарегистрироваться',
            emailPlaceholder: 'Введите email',
            passwordPlaceholder: 'Введите пароль',
            forgotPassword: 'Забыли пароль?',
            rememberMe: 'Запомнить меня',
            noAccount: 'Нет аккаунта?',
            haveAccount: 'Уже есть аккаунт?',
            
            // Settings
            accountSettings: 'Настройки аккаунта',
            notificationSettings: 'Настройки уведомлений',
            appearanceSettings: 'Настройки внешнего вида',
            languageSettings: 'Настройки языка',
            privacySettings: 'Настройки конфиденциальности',
            darkMode: 'Темная тема',
            notifications: 'Уведомления',
            sound: 'Звук',
            emailNotifications: 'Email уведомления',
            twoFactorAuth: 'Двухфакторная аутентификация',
            dataCollection: 'Сбор данных',
            autoSave: 'Автосохранение',
            fontSize: 'Размер шрифта',
            themeColor: 'Цвет темы',
            timezone: 'Часовой пояс',
            dateFormat: 'Формат даты',
            timeFormat: 'Формат времени',
            highContrast: 'Высокая контрастность',
            reducedMotion: 'Уменьшенная анимация',
            screenReader: 'Поддержка экранного диктора',
            exportSettings: 'Экспорт настроек',
            importSettings: 'Импорт настроек',
            resetSettings: 'Сбросить настройки',
            saveChanges: 'Сохранить изменения',
            changesSaved: 'Изменения успешно сохранены',
            errorSaving: 'Ошибка при сохранении',
            accountType: 'Тип аккаунта',
            memberSince: 'Участник с'
        }
    });

    const switchLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
    }, []);

    const t = (key) => {
        return translations[language]?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, switchLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}; 