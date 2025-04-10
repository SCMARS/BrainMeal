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
            memberSince: 'Member Since',
            
            // Achievements
            achievements: 'Achievements',
            totalAchievements: 'Total Achievements',
            completedAchievements: 'Completed',
            completionRate: 'Completion Rate',
            completed: 'Completed',
            inProgress: 'In Progress',
            allCategories: 'All Categories',
            beginner: 'Beginner',
            consistency: 'Consistency',
            nutrition: 'Nutrition',
            health: 'Health',
            control: 'Control',
            mastery: 'Mastery',
            lifestyle: 'Lifestyle',
            firstMealPlan: 'First Meal Plan',
            firstMealPlanDesc: 'Create your first meal plan',
            firstMeal: 'First Meal',
            firstMealDesc: 'Add your first meal to the plan',
            regularMeals: 'Regular Meals',
            regularMealsDesc: 'Eat 3 meals a day for 7 days',
            mealVariety: 'Meal Variety',
            mealVarietyDesc: 'Try 10 different dishes in a week',
            balancedNutrition: 'Balanced Nutrition',
            balancedNutritionDesc: 'Follow the balance of BCA in 5 days',
            healthySnacks: 'Healthy Snacks',
            healthySnacksDesc: 'Make 5 healthy snacks (less than 200 calories)',
            calorieControl: 'Calorie Control',
            calorieControlDesc: 'Follow the calorie norm in 5 days',
            monthlyStreak: 'Monthly Streak',
            monthlyStreakDesc: 'Plan your meals for 30 days in a row',
            mealMaster: 'Meal Master',
            mealMasterDesc: 'Try 50 different dishes',
            perfectBalance: 'Perfect Balance',
            perfectBalanceDesc: 'Follow the perfect balance of BCA (30/40/30) for 3 days',
            caloriePerfection: 'Calorie Perfection',
            caloriePerfectionDesc: 'Follow the calorie norm with an accuracy of 50 calories for 3 days',
            earlyBird: 'Early Bird',
            earlyBirdDesc: 'Eat between 6-9 AM 5 days',
            nightOwl: 'Night Owl',
            nightOwlDesc: 'Eat between 18-21 PM 5 days',
            reward: 'Reward'
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
            memberSince: 'Участник с',
            
            // Achievements
            achievements: 'Достижения',
            totalAchievements: 'Всего достижений',
            completedAchievements: 'Завершено',
            completionRate: 'Процент выполнения',
            completed: 'Завершено',
            inProgress: 'В процессе',
            allCategories: 'Все категории',
            beginner: 'Начинающий',
            consistency: 'Последовательность',
            nutrition: 'Питание',
            health: 'Здоровье',
            control: 'Контроль',
            mastery: 'Мастерство',
            lifestyle: 'Образ жизни',
            firstMealPlan: 'Первый план питания',
            firstMealPlanDesc: 'Создайте свой первый план питания',
            firstMeal: 'Первая еда',
            firstMealDesc: 'Добавьте первую еду в план',
            regularMeals: 'Регулярное питание',
            regularMealsDesc: 'Питайтесь 3 раза в день в течение 7 дней',
            mealVariety: 'Разнообразие блюд',
            mealVarietyDesc: 'Попробуйте 10 разных блюд за неделю',
            balancedNutrition: 'Сбалансированное питание',
            balancedNutritionDesc: 'Соблюдайте баланс БЖУ в течение 5 дней',
            healthySnacks: 'Здоровые перекусы',
            healthySnacksDesc: 'Сделайте 5 здоровых перекусов (менее 200 калорий)',
            calorieControl: 'Контроль калорий',
            calorieControlDesc: 'Соблюдайте норму калорий в течение 5 дней',
            monthlyStreak: 'Месячная последовательность',
            monthlyStreakDesc: 'Планируйте питание 30 дней подряд',
            mealMaster: 'Мастер блюд',
            mealMasterDesc: 'Попробуйте 50 разных блюд',
            perfectBalance: 'Идеальный баланс',
            perfectBalanceDesc: 'Соблюдайте идеальное соотношение БЖУ (30/40/30) 3 дня',
            caloriePerfection: 'Идеальный контроль калорий',
            caloriePerfectionDesc: 'Соблюдайте норму калорий с точностью до 50 калорий 3 дня',
            earlyBird: 'Ранняя пташка',
            earlyBirdDesc: 'Завтракайте между 6-9 утра 5 дней',
            nightOwl: 'Ночная сова',
            nightOwlDesc: 'Ужинайте между 18-21 вечера 5 дней',
            reward: 'Награда'
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