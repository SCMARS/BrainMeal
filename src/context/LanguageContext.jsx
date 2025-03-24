import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('ru'); // Default language

    const translations = {
        ru: {
            // Общие
            welcome: 'Добро пожаловать',
            login: 'Войти',
            register: 'Регистрация',
            logout: 'Выйти',
            email: 'Email',
            password: 'Пароль',
            submit: 'Отправить',
            cancel: 'Отмена',
            save: 'Сохранить',
            delete: 'Удалить',
            edit: 'Редактировать',
            
            // Навигация
            home: 'Главная',
            mealPlan: 'План питания',
            recipes: 'Рецепты',
            analytics: 'Аналитика',
            profile: 'Профиль',
            settings: 'Настройки',
            education: 'Обучение',

            // Образовательный контент
            articles: 'Статьи',
            videos: 'Видео',
            courses: 'Курсы',
            tips: 'Советы',
            readMore: 'Читать далее',
            watchNow: 'Смотреть',
            enrollNow: 'Записаться',
            instructor: 'Инструктор',
            duration: 'Длительность',
            level: 'Уровень',

            // Планирование питания
            addMeal: 'Добавить прием пищи',
            breakfast: 'Завтрак',
            lunch: 'Обед',
            dinner: 'Ужин',
            snack: 'Перекус',
            calories: 'Калории',
            protein: 'Белки',
            carbs: 'Углеводы',
            fats: 'Жиры',
            calorieStats: 'Статистика калорий',
            targetCalories: 'Целевые калории',
            consumedCalories: 'Потреблено калорий',
            remainingCalories: 'Осталось калорий',

            // Рецепты
            addRecipe: 'Добавить рецепт',
            ingredients: 'Ингредиенты',
            instructions: 'Инструкции',
            prepTime: 'Время подготовки',
            cookTime: 'Время приготовления',
            servings: 'Порции',
            difficulty: 'Сложность',

            // Аналитика
            caloriesConsumed: 'Потреблено калорий',
            macroDistribution: 'Распределение макронутриентов',
            weeklyProgress: 'Недельный прогресс',
            monthlyProgress: 'Месячный прогресс',
            goals: 'Цели',
            actual: 'Фактически',

            // Уведомления
            success: 'Успешно',
            error: 'Ошибка',
            warning: 'Предупреждение',
            info: 'Информация',

            // Калькулятор калорий
            calorieCalculator: 'Калькулятор калорий',
            age: 'Возраст',
            gender: 'Пол',
            male: 'Мужской',
            female: 'Женский',
            weight: 'Вес (кг)',
            height: 'Рост (см)',
            activityLevel: 'Уровень активности',
            sedentary: 'Сидячий образ жизни',
            light: 'Легкая активность',
            moderate: 'Умеренная активность',
            active: 'Активный образ жизни',
            veryActive: 'Очень активный образ жизни',
            goal: 'Цель',
            loseWeight: 'Снижение веса',
            maintainWeight: 'Поддержание веса',
            gainWeight: 'Набор массы',
            calculate: 'Рассчитать',
            results: 'Результаты',
            bmr: 'Базовый обмен веществ',
            tdee: 'Общий расход энергии',
            caloriesPerDay: 'калорий в день',

            // Настройки
            appearance: 'Внешний вид',
            darkMode: 'Темная тема',
            language: 'Язык',
            notifications: 'Уведомления',
            pushNotifications: 'Push-уведомления',
            emailUpdates: 'Email-обновления',
            account: 'Аккаунт',
            changePassword: 'Изменить пароль',
            deleteAccount: 'Удалить аккаунт',

            // Достижения
            achievements: 'Достижения',
            totalAchievements: 'Всего достижений',
            completedAchievements: 'Получено достижений',
            completionRate: 'Процент выполнения',
            completed: 'Получено',
            inProgress: 'В процессе',
            firstMealPlan: 'Первый план питания',
            firstMealPlanDesc: 'Создайте свой первый план питания',
            weeklyStreak: 'Еженедельная серия',
            weeklyStreakDesc: 'Следуйте плану питания 7 дней подряд',
            recipeMaster: 'Мастер рецептов',
            recipeMasterDesc: 'Создайте 10 собственных рецептов',
            nutritionExpert: 'Эксперт по питанию',
            nutritionExpertDesc: 'Изучите 5 статей о питании',
            socialButterfly: 'Социальная бабочка',
            socialButterflyDesc: 'Поделитесь 5 рецептами с сообществом',
            goalAchiever: 'Достижение целей',
            goalAchieverDesc: 'Достигните своей первой цели по питанию',
            mealPlanning: 'Планирование питания',
            consistency: 'Регулярность',
            cooking: 'Готовка',
            social: 'Социальное',

            // Календарь
            calendar: 'Календарь',
            mealName: 'Название приема пищи',
            mealType: 'Тип приема пищи',
            time: 'Время',
            selectedDate: 'Выбранная дата',
            noMeals: 'Нет приемов пищи',

            // Список покупок
            shoppingList: 'Список покупок',
            itemName: 'Название товара',
            quantity: 'Количество',
            add: 'Добавить',
            dairy: 'Молочные продукты',
            bakery: 'Хлебобулочные изделия',
            fruits: 'Фрукты',
            vegetables: 'Овощи',
            meat: 'Мясо',
            other: 'Другое',

            // GetStarted
            getStartedSubtitle: 'Ваш умный помощник в планировании питания',
            mealPlanningDesc: 'Создавайте и отслеживайте свой план питания',
            recipesDesc: 'Изучайте и сохраняйте любимые рецепты',
            analyticsDesc: 'Анализируйте свой прогресс и достижения',
            socialDesc: 'Делитесь опытом с единомышленниками',
            getStarted: 'Начать',
            goalsSection: 'Раздел целей',
            loginAction: 'Войти в систему',
            mealPlanSection: 'Раздел планирования питания',
        },
        en: {
            // General
            welcome: 'Welcome',
            login: 'Login',
            register: 'Register',
            logout: 'Logout',
            email: 'Email',
            password: 'Password',
            submit: 'Submit',
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',

            // Navigation
            home: 'Home',
            mealPlan: 'Meal Plan',
            recipes: 'Recipes',
            analytics: 'Analytics',
            profile: 'Profile',
            settings: 'Settings',
            education: 'Education',

            // Educational content
            articles: 'Articles',
            videos: 'Videos',
            courses: 'Courses',
            tips: 'Tips',
            readMore: 'Read More',
            watchNow: 'Watch Now',
            enrollNow: 'Enroll Now',
            instructor: 'Instructor',
            duration: 'Duration',
            level: 'Level',

            // Meal planning
            addMeal: 'Add Meal',
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snack: 'Snack',
            calories: 'Calories',
            protein: 'Protein',
            carbs: 'Carbs',
            fats: 'Fats',
            calorieStats: 'Calorie Statistics',
            targetCalories: 'Target Calories',
            consumedCalories: 'Consumed Calories',
            remainingCalories: 'Remaining Calories',

            // Recipes
            addRecipe: 'Add Recipe',
            ingredients: 'Ingredients',
            instructions: 'Instructions',
            prepTime: 'Prep Time',
            cookTime: 'Cook Time',
            servings: 'Servings',
            difficulty: 'Difficulty',

            // Analytics
            caloriesConsumed: 'Calories Consumed',
            macroDistribution: 'Macro Distribution',
            weeklyProgress: 'Weekly Progress',
            monthlyProgress: 'Monthly Progress',
            goals: 'Goals',
            actual: 'Actual',

            // Notifications
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information',

            // Calorie Calculator
            calorieCalculator: 'Calorie Calculator',
            age: 'Age',
            gender: 'Gender',
            male: 'Male',
            female: 'Female',
            weight: 'Weight (kg)',
            height: 'Height (cm)',
            activityLevel: 'Activity Level',
            sedentary: 'Sedentary',
            light: 'Light Activity',
            moderate: 'Moderate Activity',
            active: 'Active',
            veryActive: 'Very Active',
            goal: 'Goal',
            loseWeight: 'Lose Weight',
            maintainWeight: 'Maintain Weight',
            gainWeight: 'Gain Weight',
            calculate: 'Calculate',
            results: 'Results',
            bmr: 'Basal Metabolic Rate',
            tdee: 'Total Daily Energy Expenditure',
            caloriesPerDay: 'calories per day',

            // Settings
            appearance: 'Appearance',
            darkMode: 'Dark Mode',
            language: 'Language',
            notifications: 'Notifications',
            pushNotifications: 'Push Notifications',
            emailUpdates: 'Email Updates',
            account: 'Account',
            changePassword: 'Change Password',
            deleteAccount: 'Delete Account',

            // Achievements
            achievements: 'Achievements',
            totalAchievements: 'Total Achievements',
            completedAchievements: 'Completed Achievements',
            completionRate: 'Completion Rate',
            completed: 'Completed',
            inProgress: 'In Progress',
            firstMealPlan: 'First Meal Plan',
            firstMealPlanDesc: 'Create your first meal plan',
            weeklyStreak: 'Weekly Streak',
            weeklyStreakDesc: 'Follow your meal plan for 7 days in a row',
            recipeMaster: 'Recipe Master',
            recipeMasterDesc: 'Create 10 of your own recipes',
            nutritionExpert: 'Nutrition Expert',
            nutritionExpertDesc: 'Read 5 nutrition articles',
            socialButterfly: 'Social Butterfly',
            socialButterflyDesc: 'Share 5 recipes with the community',
            goalAchiever: 'Goal Achiever',
            goalAchieverDesc: 'Achieve your first nutrition goal',
            mealPlanning: 'Meal Planning',
            consistency: 'Consistency',
            cooking: 'Cooking',
            social: 'Social',
            goals: 'Goals',
            goalsSection: 'Goals Section',
            login: 'Login',
            loginAction: 'Sign In',
            mealPlan: 'Meal Plan',
            mealPlanSection: 'Meal Planning Section',
        },
        uk: {
            // Загальні
            welcome: 'Ласкаво просимо',
            login: 'Увійти',
            register: 'Реєстрація',
            logout: 'Вийти',
            email: 'Email',
            password: 'Пароль',
            submit: 'Надіслати',
            cancel: 'Скасувати',
            save: 'Зберегти',
            delete: 'Видалити',
            edit: 'Редагувати',
            
            // Навігація
            home: 'Головна',
            mealPlan: 'План харчування',
            recipes: 'Рецепти',
            analytics: 'Аналітика',
            profile: 'Профіль',
            settings: 'Налаштування',
            education: 'Навчання',

            // Освітній контент
            articles: 'Статті',
            videos: 'Відео',
            courses: 'Курси',
            tips: 'Поради',
            readMore: 'Читати далі',
            watchNow: 'Дивитися',
            enrollNow: 'Записатися',
            instructor: 'Інструктор',
            duration: 'Тривалість',
            level: 'Рівень',

            // Планування харчування
            addMeal: 'Додати прийом їжі',
            breakfast: 'Сніданок',
            lunch: 'Обід',
            dinner: 'Вечеря',
            snack: 'Перекус',
            calories: 'Калорії',
            protein: 'Білки',
            carbs: 'Вуглеводи',
            fats: 'Жири',
            calorieStats: 'Статистика калорій',
            targetCalories: 'Цільові калорії',
            consumedCalories: 'Спожито калорій',
            remainingCalories: 'Осталось калорій',

            // Рецепти
            addRecipe: 'Додати рецепт',
            ingredients: 'Інгредієнти',
            instructions: 'Інструкції',
            prepTime: 'Час підготовки',
            cookTime: 'Час приготування',
            servings: 'Порції',
            difficulty: 'Складність',

            // Аналітика
            caloriesConsumed: 'Спожито калорій',
            macroDistribution: 'Розподіл макронутрієнтів',
            weeklyProgress: 'Тижневий прогрес',
            monthlyProgress: 'Місячний прогрес',
            goals: 'Цілі',
            actual: 'Фактично',

            // Сповіщення
            success: 'Успішно',
            error: 'Помилка',
            warning: 'Попередження',
            info: 'Інформація',

            // Калькулятор калорій
            calorieCalculator: 'Калькулятор калорій',
            age: 'Вік',
            gender: 'Стать',
            male: 'Чоловік',
            female: 'Жінка',
            weight: 'Вага (кг)',
            height: 'Зріст (см)',
            activityLevel: 'Рівень активності',
            sedentary: 'Сидячий спосіб життя',
            light: 'Легка активність',
            moderate: 'Помірна активність',
            active: 'Активний спосіб життя',
            veryActive: 'Дуже активний спосіб життя',
            goal: 'Мета',
            loseWeight: 'Схуднення',
            maintainWeight: 'Підтримка ваги',
            gainWeight: 'Набір маси',
            calculate: 'Розрахувати',
            results: 'Результати',
            bmr: 'Базовий обмін речовин',
            tdee: 'Загальна витрата енергії',
            caloriesPerDay: 'калорій на день',

            // Графіки та аналітика
            dailyCalories: 'Щоденні калорії',
            weeklyCalories: 'Тижневі калорії',
            monthlyCalories: 'Місячні калорії',
            macroBreakdown: 'Розподіл макронутрієнтів',
            proteinIntake: 'Споживання білків',
            carbsIntake: 'Споживання вуглеводів',
            fatsIntake: 'Споживання жирів',
            recommendedIntake: 'Рекомендоване споживання',
            actualIntake: 'Фактичне споживання',
            mealPlan: 'План харчування',
            generatePlan: 'Згенерувати план',
            weeklyPlan: 'Тижневий план',
            portions: 'Порції',
            mealTime: 'Час прийому їжі',
            totalCalories: 'Загальні калорії',
            totalProtein: 'Загальний білок',
            totalCarbs: 'Загальні вуглеводи',
            totalFats: 'Загальні жири',

            // Налаштування
            appearance: 'Зовнішній вигляд',
            darkMode: 'Темна тема',
            language: 'Мова',
            notifications: 'Сповіщення',
            pushNotifications: 'Push-сповіщення',
            emailUpdates: 'Email-оновлення',
            account: 'Обліковий запис',
            changePassword: 'Змінити пароль',
            deleteAccount: 'Видалити обліковий запис',

            // Досягнення
            achievements: 'Досягнення',
            totalAchievements: 'Всього досягнень',
            completedAchievements: 'Отримано досягнень',
            completionRate: 'Відсоток виконання',
            completed: 'Отримано',
            inProgress: 'В процесі',
            firstMealPlan: 'Перший план харчування',
            firstMealPlanDesc: 'Створіть свій перший план харчування',
            weeklyStreak: 'Тижнева серія',
            weeklyStreakDesc: 'Дотримуйтесь плану харчування 7 днів поспіль',
            recipeMaster: 'Майстер рецептів',
            recipeMasterDesc: 'Створіть 10 власних рецептів',
            nutritionExpert: 'Експерт з харчування',
            nutritionExpertDesc: 'Прочитайте 5 статей про харчування',
            socialButterfly: 'Соціальна метелик',
            socialButterflyDesc: 'Поділіться 5 рецептами зі спільнотою',
            goalAchiever: 'Досягнення цілей',
            goalAchieverDesc: 'Досягніть своєї першої цілі щодо харчування',
            mealPlanning: 'Планування харчування',
            consistency: 'Регулярність',
            cooking: 'Готування',
            social: 'Соціальне',
            goals: 'Цілі',
            goalsSection: 'Розділ цілей',
            login: 'Увійти',
            loginAction: 'Увійти в систему',
            mealPlan: 'План харчування',
            mealPlanSection: 'Розділ планування харчування',
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    const switchLanguage = (newLanguage) => {
        if (translations[newLanguage]) {
            setLanguage(newLanguage);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, switchLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}; 