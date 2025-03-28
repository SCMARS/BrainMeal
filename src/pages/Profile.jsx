import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const defaultTypicalMeals = {
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: ''
};

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

const Profile = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return location.state?.darkMode || false;
    });

    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) {
            return savedLanguage;
        }
        return location.state?.language || 'en';
    });

    const t = translations[language];

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const [userData, setUserData] = useState({
        weight: '',
        age: '',
        gender: '',
        height: '',
        dietType: 'basic',
        mealPreferences: '',
        breakfast: '',
        lunch: '',
        dinner: '',
        snacks: '',
        targetWeight: '',
        targetGain: '',
        proteinTarget: '',
        activityLevel: 'moderate',
        dietRestrictions: [],
        allergies: [],
        mealFrequency: 3,
        calorieTarget: '',
        waterIntake: '',
        preferredCuisines: []
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedData = localStorage.getItem('userData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setUserData(parsedData);
            } catch (e) {
                console.error("Failed to parse saved user data:", e);
            }
        }
    }, []);

    const logout = () => {
        navigate('/login');
    };

    const toggleTheme = () => {
        setDarkMode(prev => !prev);
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
    };

    const getActivityLevelLabel = (value) => {
        switch(value) {
            case 'sedentary': return t.sedentary;
            case 'light': return t.lightlyActive;
            case 'moderate': return t.moderatelyActive;
            case 'active': return t.veryActive;
            case 'extreme': return t.extremelyActive;
            default: return '';
        }
    };

    const activityLevels = [
        { value: 'sedentary', factor: 1.2 },
        { value: 'light', factor: 1.375 },
        { value: 'moderate', factor: 1.55 },
        { value: 'active', factor: 1.725 },
        { value: 'extreme', factor: 1.9 }
    ];

    const dietaryRestrictions = [
        'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low FODMAP', 'Sugar-Free'
    ];

    const commonAllergies = [
        'Nuts', 'Shellfish', 'Eggs', 'Milk', 'Soy', 'Wheat', 'Fish', 'Sesame'
    ];

    const cuisineOptions = [
        'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian',
        'Mediterranean', 'French', 'Thai', 'American', 'Middle Eastern'
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            if (name.startsWith('restriction-')) {
                const restriction = name.replace('restriction-', '');
                setUserData(prev => ({
                    ...prev,
                    dietRestrictions: checked
                        ? [...(prev.dietRestrictions || []), restriction]
                        : (prev.dietRestrictions || []).filter(item => item !== restriction)
                }));
            } else if (name.startsWith('allergy-')) {
                const allergy = name.replace('allergy-', '');
                setUserData(prev => ({
                    ...prev,
                    allergies: checked
                        ? [...(prev.allergies || []), allergy]
                        : (prev.allergies || []).filter(item => item !== allergy)
                }));
            } else if (name.startsWith('cuisine-')) {
                const cuisine = name.replace('cuisine-', '');
                setUserData(prev => ({
                    ...prev,
                    preferredCuisines: checked
                        ? [...(prev.preferredCuisines || []), cuisine]
                        : (prev.preferredCuisines || []).filter(item => item !== cuisine)
                }));
            }
        } else {
            setUserData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleDietChange = (diet) => {
        setUserData(prev => ({
            ...prev,
            dietType: diet
        }));
    };

    useEffect(() => {
        if (userData.weight && userData.height && userData.age && userData.gender) {
            try {
                let bmr = 0;
                if (userData.gender === 'male') {
                    bmr = 10 * parseFloat(userData.weight) +
                        6.25 * parseFloat(userData.height) -
                        5 * parseInt(userData.age) + 5;
                } else if (userData.gender === 'female') {
                    bmr = 10 * parseFloat(userData.weight) +
                        6.25 * parseFloat(userData.height) -
                        5 * parseInt(userData.age) - 161;
                }
                const activity = activityLevels.find(a => a.value === userData.activityLevel);
                const activityFactor = activity ? activity.factor : 1.55;
                let tdee = Math.round(bmr * activityFactor);
                let calorieTarget = tdee;
                if (userData.dietType === 'weightloss') {
                    calorieTarget = Math.max(1200, tdee - 500);
                } else if (userData.dietType === 'weightgain') {
                    calorieTarget = tdee + 500;
                }
                if (!userData.calorieTarget) {
                    setUserData(prev => ({
                        ...prev,
                        calorieTarget: calorieTarget.toString()
                    }));
                }
            } catch (e) {
                console.error("Error calculating calories:", e);
            }
        }
    }, [userData.weight, userData.height, userData.age, userData.gender, userData.dietType, userData.activityLevel, userData.calorieTarget]);

    const handleGenerateMealPlan = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate("/MealPlan");
        }, 500);
    };

    const renderDietSpecificFields = () => {
        switch(userData.dietType) {
            case 'weightloss':
                return (
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">Target Weight (kg)</label>
                        <input
                            type="number"
                            name="targetWeight"
                            className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
                            placeholder="Specify your target weight"
                            value={userData.targetWeight}
                            onChange={handleChange}
                        />
                        <small className="text-sm text-gray-500">Recommended: no more than 0.5-1 kg loss per week</small>
                    </div>
                );
            case 'weightgain':
                return (
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">{t.activityLevel}</label>
                        <select
                            name="activityLevel"
                            className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
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
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">Protein Target (g/day)</label>
                        <input
                            type="number"
                            name="proteinTarget"
                            className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
                            placeholder="Daily protein target"
                            value={userData.proteinTarget}
                            onChange={handleChange}
                        />
                        <small className="text-sm text-gray-500">Recommended: 1.6-2.2g per kg of body weight</small>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        // Применяем класс "dark" если включена тёмная тема. Tailwind будет применять dark: стили к дочерним элементам.
        <div className={`${darkMode ? 'dark' : ''} min-h-screen transition-colors duration-300`}>
            <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
                {/* Header */}
                <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow transition-colors duration-300">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500 rounded-full text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold">BrainMeal</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleTheme}
                            className="px-3 py-2 bg-blue-500 text-white rounded transition-transform transform hover:scale-105"
                        >
                            {darkMode ? t.light : t.dark}
                        </button>
                        <select
                            value={language}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition"
                        >
                            <option value="en">EN</option>
                            <option value="uk">UK</option>
                        </select>
                        <button
                            onClick={logout}
                            className="flex items-center px-3 py-2 bg-red-500 text-white rounded transition-transform transform hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                            </svg>
                            {t.logout}
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-6">
                    <h2 className="text-2xl font-semibold mb-2">{t.profileSettings}</h2>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">{t.profileDescription}</p>

                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

                    <form className="space-y-6">
                        {/* Personal Information */}
                        <section>
                            <h3 className="text-xl font-medium mb-3">{t.personalInformation}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1">{t.weight}</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
                                        placeholder="Enter your weight"
                                        value={userData.weight}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">{t.height}</label>
                                    <input
                                        type="number"
                                        name="height"
                                        className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
                                        placeholder="Enter your height"
                                        value={userData.height}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block mb-1">{t.age}</label>
                                    <input
                                        type="number"
                                        name="age"
                                        className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
                                        placeholder="Enter your age"
                                        value={userData.age}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">{t.gender}</label>
                                    <select
                                        name="gender"
                                        className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
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
                            <div className="mt-4">
                                <label className="block mb-1">{t.activityLevel}</label>
                                <select
                                    name="activityLevel"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
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
                        </section>

                        {/* Diet Type */}
                        <section>
                            <h3 className="text-xl font-medium mb-3">{t.dietType}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div
                                    onClick={() => handleDietChange('basic')}
                                    className={`cursor-pointer p-4 border rounded hover:shadow-lg transition ${userData.dietType === 'basic' ? 'border-blue-500' : 'border-gray-300'}`}
                                >
                                    <div className="mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M3 3a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold">{t.basic}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.balancedNutrition}</p>
                                </div>

                                <div
                                    onClick={() => handleDietChange('weightloss')}
                                    className={`cursor-pointer p-4 border rounded hover:shadow-lg transition ${userData.dietType === 'weightloss' ? 'border-blue-500' : 'border-gray-300'}`}
                                >
                                    <div className="mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold">{t.weightLoss}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.weightLossDesc}</p>
                                </div>

                                <div
                                    onClick={() => handleDietChange('weightgain')}
                                    className={`cursor-pointer p-4 border rounded hover:shadow-lg transition ${userData.dietType === 'weightgain' ? 'border-blue-500' : 'border-gray-300'}`}
                                >
                                    <div className="mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold">{t.weightGain}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.weightGainDesc}</p>
                                </div>

                                <div
                                    onClick={() => handleDietChange('protein')}
                                    className={`cursor-pointer p-4 border rounded hover:shadow-lg transition ${userData.dietType === 'protein' ? 'border-blue-500' : 'border-gray-300'}`}
                                >
                                    <div className="mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold">{t.highProtein}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.highProteinDesc}</p>
                                </div>
                            </div>
                            {renderDietSpecificFields()}
                        </section>

                        {/* Diet Preferences */}
                        <section>
                            <h3 className="text-xl font-medium mb-3">{t.dietPreferences}</h3>
                            <div className="mb-4">
                                <label className="block mb-1">{t.calorieTarget}</label>
                                <input
                                    type="number"
                                    name="calorieTarget"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
                                    placeholder="Auto-calculated based on your data"
                                    value={userData.calorieTarget}
                                    onChange={handleChange}
                                />
                                <small className="text-sm text-gray-500">Leave empty for auto-calculation or enter your target</small>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">{t.mealFrequency}</label>
                                <select
                                    name="mealFrequency"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
                                    value={userData.mealFrequency}
                                    onChange={handleChange}
                                >
                                    <option value="3">3 meals per day</option>
                                    <option value="4">4 meals per day</option>
                                    <option value="5">5 meals per day</option>
                                    <option value="6">6 meals per day</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">{t.dietaryRestrictions}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {dietaryRestrictions.map(restriction => (
                                        <div key={restriction} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`restriction-${restriction}`}
                                                name={`restriction-${restriction}`}
                                                checked={userData.dietRestrictions?.includes(restriction) || false}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`restriction-${restriction}`}>{restriction}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">{t.allergies}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {commonAllergies.map(allergy => (
                                        <div key={allergy} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`allergy-${allergy}`}
                                                name={`allergy-${allergy}`}
                                                checked={userData.allergies?.includes(allergy) || false}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`allergy-${allergy}`}>{allergy}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">{t.preferredCuisines}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {cuisineOptions.map(cuisine => (
                                        <div key={cuisine} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`cuisine-${cuisine}`}
                                                name={`cuisine-${cuisine}`}
                                                checked={userData.preferredCuisines?.includes(cuisine) || false}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`cuisine-${cuisine}`}>{cuisine}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Current Meal Habits */}
                        <section>
                            <h3 className="text-xl font-medium mb-3">{t.currentMealHabits}</h3>
                            <p className="mb-4 text-gray-700 dark:text-gray-300">{t.describeMeals}</p>
                            <div className="mb-4">
                                <label className="block mb-1">{t.breakfast}</label>
                                <textarea
                                    name="breakfast"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
                                    placeholder={`Describe your typical ${t.breakfast.toLowerCase()}`}
                                    value={userData.breakfast}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">{t.lunch}</label>
                                <textarea
                                    name="lunch"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
                                    placeholder={`Describe your typical ${t.lunch.toLowerCase()}`}
                                    value={userData.lunch}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">{t.dinner}</label>
                                <textarea
                                    name="dinner"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
                                    placeholder={`Describe your typical ${t.dinner.toLowerCase()}`}
                                    value={userData.dinner}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">{t.snacks}</label>
                                <textarea
                                    name="snacks"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 transition"
                                    placeholder={`Describe your typical ${t.snacks.toLowerCase()}`}
                                    value={userData.snacks}
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleGenerateMealPlan}
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
                            >
                                {loading ? t.generating : t.generateMealPlan}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default Profile;












