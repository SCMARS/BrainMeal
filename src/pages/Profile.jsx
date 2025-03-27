import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const defaultUserData = {
    weight: '',
    height: '',
    age: '',
    gender: '',
    activityLevel: 'moderate',
    dietType: 'basic',
    calorieTarget: '',
    targetWeight: '',
    mealFrequency: '3',
    dietRestrictions: [],
    allergies: [],
    preferredCuisines: [],
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: '',
    proteinTarget: ''
};

const activityLevels = [
    { value: 'sedentary', factor: 1.2 },
    { value: 'light', factor: 1.375 },
    { value: 'moderate', factor: 1.55 },
    { value: 'active', factor: 1.725 },
    { value: 'extreme', factor: 1.9 }
];

const translations = {
    en: {
        profileSettings: "Profile Settings",
        profileDescription: "Please provide your information to create a personalized meal plan.",
        personalInformation: "Personal Information",
        weight: "Weight (kg) *",
        height: "Height (cm) *",
        age: "Age *",
        gender: "Gender *",
        selectGender: "Select gender",
        male: "Male",
        female: "Female",
        other: "Other",
        activityLevel: "Activity Level",
        dietType: "Diet Type",
        basic: "Basic",
        balancedNutrition: "Balanced nutrition for everyday",
        weightLoss: "Weight Loss",
        weightLossDesc: "Calorie deficit for healthy weight loss",
        weightGain: "Weight Gain",
        weightGainDesc: "Calorie surplus for muscle building",
        highProtein: "High Protein",
        highProteinDesc: "Protein-focused nutrition for athletes",
        dietPreferences: "Diet Preferences",
        calorieTarget: "Calorie Target (kcal/day)",
        mealFrequency: "Meal Frequency",
        dietaryRestrictions: "Dietary Restrictions",
        allergies: "Allergies",
        preferredCuisines: "Preferred Cuisines",
        currentMealHabits: "Current Meal Habits",
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        snacks: "Snacks",
        generateMealPlan: "Generate Meal Plan",
        generating: "Generating...",
        logout: "Logout",
        theme: "Theme",
        dark: "Dark",
        light: "Light",
        language: "Language",
        describeMeals: "Describe your typical meals below to help us better understand your preferences.",
        sedentary: "Sedentary (little or no exercise)",
        lightlyActive: "Lightly active (light exercise 1-3 days/week)",
        moderatelyActive: "Moderately active (moderate exercise 3-5 days/week)",
        veryActive: "Very active (hard exercise 6-7 days/week)",
        extremelyActive: "Extremely active (very hard exercise & physical job)"
    },
    uk: {
        profileSettings: "Налаштування профілю",
        profileDescription: "Будь ласка, надайте вашу інформацію для створення персоналізованого плану харчування.",
        personalInformation: "Особиста інформація",
        weight: "Вага (кг) *",
        height: "Зріст (см) *",
        age: "Вік *",
        gender: "Стать *",
        selectGender: "Оберіть стать",
        male: "Чоловіча",
        female: "Жіноча",
        other: "Інше",
        activityLevel: "Рівень активності",
        dietType: "Тип дієти",
        basic: "Базова",
        balancedNutrition: "Збалансоване харчування для кожного дня",
        weightLoss: "Схуднення",
        weightLossDesc: "Дефіцит калорій для здорового схуднення",
        weightGain: "Набір ваги",
        weightGainDesc: "Надлишок калорій для набору м'язової маси",
        highProtein: "Багато білка",
        highProteinDesc: "Харчування з високим вмістом білка для спортсменів",
        dietPreferences: "Дієтичні переваги",
        calorieTarget: "Цільові калорії (ккал/день)",
        mealFrequency: "Кількість прийомів їжі",
        dietaryRestrictions: "Дієтичні обмеження",
        allergies: "Алергії",
        preferredCuisines: "Улюблені кухні",
        currentMealHabits: "Поточні звички харчування",
        breakfast: "Сніданок",
        lunch: "Обід",
        dinner: "Вечеря",
        snacks: "Перекуси",
        generateMealPlan: "Створити план харчування",
        generating: "Генерація...",
        logout: "Вийти",
        theme: "Тема",
        dark: "Темна",
        light: "Світла",
        language: "Мова",
        describeMeals: "Опишіть ваші типові прийоми їжі нижче, щоб ми краще зрозуміли ваші уподобання.",
        sedentary: "Малорухливий (мало або зовсім немає фізичних навантажень)",
        lightlyActive: "Легка активність (легкі фізичні вправи 1-3 дні на тиждень)",
        moderatelyActive: "Помірна активність (помірні фізичні вправи 3-5 днів на тиждень)",
        veryActive: "Висока активність (інтенсивні фізичні вправи 6-7 днів на тиждень)",
        extremelyActive: "Надзвичайна активність (дуже інтенсивні вправи і фізична робота)"
    }
};

function Profile() {
    const navigate = useNavigate();
    const location = useLocation();

    const [userData, setUserData] = useState(() => {
        const savedUserData = localStorage.getItem('userData');
        return savedUserData ? JSON.parse(savedUserData) : defaultUserData;
    });
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const t = translations[language];

    // Сохраняем тему, язык и данные пользователя
    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('userData', JSON.stringify(userData));
    }, [userData]);

    // Функция расчета калорий
    const calculateCalories = useCallback(() => {
        const { weight, height, age, gender, dietType, calorieTarget } = userData;
        if (weight && height && age && gender) {
            try {
                let bmr = gender === 'male'
                    ? 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseInt(age) + 5
                    : 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseInt(age) - 161;
                const activity = activityLevels.find(a => a.value === userData.activityLevel);
                const activityFactor = activity ? activity.factor : 1.55;
                let tdee = Math.round(bmr * activityFactor);
                let targetCalories = tdee;
                if (dietType === 'weightloss') {
                    targetCalories = Math.max(1200, tdee - 500);
                } else if (dietType === 'weightgain') {
                    targetCalories = tdee + 500;
                }
                if (!calorieTarget) {
                    setUserData(prev => ({ ...prev, calorieTarget: targetCalories.toString() }));
                }
            } catch (e) {
                console.error("Error calculating calories:", e);
            }
        }
    }, [userData]);

    useEffect(() => {
        calculateCalories();
    }, [calculateCalories]);

    // Логаут
    const logout = () => {
        navigate("/MealPlan", { state: { userData } });
    };

    // Переключение темы
    const toggleTheme = () => {
        setDarkMode(prev => !prev);
    };

    // Смена языка
    const changeLanguage = (lang) => {
        setLanguage(lang);
    };

    // Лейблы для активности
    const getActivityLevelLabel = (value) => {
        const labels = {
            sedentary: t.sedentary,
            light: t.lightlyActive,
            moderate: t.moderatelyActive,
            active: t.veryActive,
            extreme: t.extremelyActive
        };
        return labels[value] || value;
    };

    // Обработка изменений формы
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserData(prev => {
            if (type === 'checkbox') {
                if (name.startsWith('restriction-')) {
                    const restriction = name.replace('restriction-', '');
                    return {
                        ...prev,
                        dietRestrictions: checked
                            ? [...(prev.dietRestrictions || []), restriction]
                            : (prev.dietRestrictions || []).filter(item => item !== restriction)
                    };
                } else if (name.startsWith('allergy-')) {
                    const allergy = name.replace('allergy-', '');
                    return {
                        ...prev,
                        allergies: checked
                            ? [...(prev.allergies || []), allergy]
                            : (prev.allergies || []).filter(item => item !== allergy)
                    };
                }
            }
            return { ...prev, [name]: value };
        });
    };

    // Выбор типа диеты
    const handleDietChange = (diet) => {
        setUserData(prev => ({ ...prev, dietType: diet }));
    };

    // Рендер специфических полей
    const renderDietSpecificFields = () => {
        switch (userData.dietType) {
            case 'weightloss':
                return (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Target Weight (kg)
                        </label>
                        <input
                            type="number"
                            name="targetWeight"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-400 dark:bg-neutral-700 dark:text-gray-100"
                            placeholder="Specify your target weight"
                            value={userData.targetWeight}
                            onChange={handleChange}
                        />
                        <small className="text-xs text-gray-500 dark:text-gray-400">
                            Recommended: no more than 0.5-1 kg loss per week
                        </small>
                    </div>
                );
            case 'weightgain':
                return (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t.activityLevel}
                        </label>
                        <select
                            name="activityLevel"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-400 dark:bg-neutral-700 dark:text-gray-100"
                            value={userData.activityLevel}
                            onChange={handleChange}
                        >
                            {activityLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {getActivityLevelLabel(level.value)}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            case 'protein':
                return (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Protein Target (g/day)
                        </label>
                        <input
                            type="number"
                            name="proteinTarget"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-400 dark:bg-neutral-700 dark:text-gray-100"
                            placeholder="Daily protein target"
                            value={userData.proteinTarget || ''}
                            onChange={handleChange}
                        />
                        <small className="text-xs text-gray-500 dark:text-gray-400">
                            Recommended: 1.6-2.2g per kg of body weight
                        </small>
                    </div>
                );
            default:
                return null;
        }
    };

    // Генерация плана
    const handleGenerateMealPlan = () => {
        const requiredFields = ['weight', 'height', 'age', 'gender'];
        const missingFields = requiredFields.filter(field => !userData[field]);
        if (missingFields.length > 0) {
            setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
            return;
        }
        setLoading(true);
        setError('');
        setTimeout(() => {
            setLoading(false);
            navigate("/meal-plan", { state: { userData } });
        }, 500);


    };

    return (
        // Градиентный фон. Можно менять from/to, если хотите другой цвет
        <div
            className={`
                min-h-screen w-full
                ${darkMode
                ? 'bg-gradient-to-tr from-gray-800 via-gray-900 to-black text-gray-100'
                : 'bg-gradient-to-tr from-orange-50 via-orange-100 to-white text-gray-900'
            }
            `}
        >
            {/* Шапка */}
            <header className="bg-transparent py-4 px-4 md:px-8">
                <nav className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl md:text-2xl font-bold text-orange-700 dark:text-orange-400">
                        BrainMeal
                    </h1>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* Переключатель темы */}
                        <button
                            onClick={toggleTheme}
                            className="px-3 py-1 rounded bg-white/30 dark:bg-gray-700/40 hover:bg-white/50 dark:hover:bg-gray-600/60 text-sm text-gray-900 dark:text-gray-100 transition"
                        >
                            {darkMode ? t.light : t.dark}
                        </button>
                        {/* Смена языка */}
                        <select
                            value={language}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="px-2 py-1 rounded bg-white/30 dark:bg-gray-700/40 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400"
                        >
                            <option value="en">EN</option>
                            <option value="uk">UK</option>
                        </select>
                        {/* Кнопка логаута (или перехода на MealPlan) */}
                        <button
                            onClick={logout}
                            className="px-3 py-1 rounded bg-white/30 dark:bg-gray-700/40 hover:bg-white/50 dark:hover:bg-gray-600/60 text-sm text-gray-900 dark:text-gray-100 transition"
                        >
                            {t.logout}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Основной контент */}
            <main className="max-w-xl mx-auto px-4 md:px-0 py-8">
                <div
                    className={`
                        bg-white dark:bg-neutral-800
                        rounded-xl shadow-lg
                        p-6 md:p-8
                        space-y-6
                        transition-colors
                    `}
                >
                    <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400 mb-2">
                        {t.profileSettings}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t.profileDescription}
                    </p>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Форма */}
                    <form className="space-y-6">
                        {/* Секция «Персональная информация» */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                                {t.personalInformation}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Вес */}
                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t.weight}
                                    </label>
                                    <input
                                        type="number"
                                        name="weight"
                                        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 dark:bg-neutral-700 dark:text-gray-100"
                                        value={userData.weight}
                                        onChange={handleChange}
                                        placeholder="e.g. 70"
                                        required
                                    />
                                </div>
                                {/* Рост */}
                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t.height}
                                    </label>
                                    <input
                                        type="number"
                                        name="height"
                                        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 dark:bg-neutral-700 dark:text-gray-100"
                                        value={userData.height}
                                        onChange={handleChange}
                                        placeholder="e.g. 170"
                                        required
                                    />
                                </div>
                                {/* Возраст */}
                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t.age}
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 dark:bg-neutral-700 dark:text-gray-100"
                                        value={userData.age}
                                        onChange={handleChange}
                                        placeholder="e.g. 30"
                                        required
                                    />
                                </div>
                                {/* Пол */}
                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t.gender}
                                    </label>
                                    <select
                                        name="gender"
                                        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 dark:bg-neutral-700 dark:text-gray-100"
                                        value={userData.gender}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">{t.selectGender}</option>
                                        <option value="male">{t.male}</option>
                                        <option value="female">{t.female}</option>
                                        <option value="other">{t.other}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Выбор типа диеты */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                                {t.dietType}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['basic', 'weightloss', 'weightgain', 'protein'].map(diet => (
                                    <button
                                        key={diet}
                                        type="button"
                                        onClick={() => handleDietChange(diet)}
                                        className={`
                                            flex flex-col items-center justify-center
                                            p-3 rounded transition
                                            text-sm font-semibold
                                            ${
                                            userData.dietType === diet
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-orange-100'
                                        }
                                        `}
                                    >
                                        <span>{t[diet]}</span>
                                        <span className="text-xs opacity-70 mt-1">
                                            {t[`${diet}Desc`]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {/* Дополнительные поля в зависимости от типа диеты */}
                            {renderDietSpecificFields()}
                        </div>

                        {/* Текущие привычки питания */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                                {t.currentMealHabits}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t.breakfast}
                                    </label>
                                    <input
                                        type="text"
                                        name="breakfast"
                                        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 dark:bg-neutral-700 dark:text-gray-100"
                                        placeholder="e.g. Oatmeal with fruits"
                                        value={userData.breakfast}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t.lunch}
                                    </label>
                                    <input
                                        type="text"
                                        name="lunch"
                                        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 dark:bg-neutral-700 dark:text-gray-100"
                                        placeholder="e.g. Grilled chicken salad"
                                        value={userData.lunch}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t.dinner}
                                    </label>
                                    <input
                                        type="text"
                                        name="dinner"
                                        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 dark:bg-neutral-700 dark:text-gray-100"
                                        placeholder="e.g. Steamed fish and veggies"
                                        value={userData.dinner}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t.snacks}
                                    </label>
                                    <input
                                        type="text"
                                        name="snacks"
                                        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 dark:bg-neutral-700 dark:text-gray-100"
                                        placeholder="e.g. Nuts, fruits"
                                        value={userData.snacks}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Кнопка генерации плана */}
                        <div className="flex justify-center mt-4">
                            <button
                                type="button"
                                onClick={handleGenerateMealPlan}
                                disabled={loading}
                                className={`
                                    px-6 py-2 rounded-full font-bold
                                    transition-colors duration-300
                                    ${
                                    loading
                                        ? 'bg-orange-300 cursor-not-allowed text-gray-100'
                                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                                }
                                `}
                            >
                                {loading ? t.generating : t.generateMealPlan}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default Profile;















