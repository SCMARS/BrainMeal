import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

    // Инициализация темы и языка из localStorage или location.state
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

    // Сохранение настроек темы и языка в localStorage
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

    // Загрузка сохранённых данных пользователя из localStorage
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
        switch (value) {
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

    // Автоматический расчёт калорий на основе введённых данных
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
        switch (userData.dietType) {
            case 'weightloss':
                return (
                    <div className="mt-4 p-4 bg-orange-100 rounded-lg shadow-md">
                        <label className="block font-semibold mb-1">Target Weight (kg)</label>
                        <input
                            type="number"
                            name="targetWeight"
                            placeholder="Specify your target weight"
                            value={userData.targetWeight}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <small className="text-sm text-gray-600">Recommended: no more than 0.5-1 kg loss per week</small>
                    </div>
                );
            case 'weightgain':
                return (
                    <div className="mt-4 p-4 bg-orange-100 rounded-lg shadow-md">
                        <label className="block font-semibold mb-1">{t.activityLevel}</label>
                        <select
                            name="activityLevel"
                            value={userData.activityLevel}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                    <div className="mt-4 p-4 bg-orange-100 rounded-lg shadow-md">
                        <label className="block font-semibold mb-1">Protein Target (g/day)</label>
                        <input
                            type="number"
                            name="proteinTarget"
                            placeholder="Daily protein target"
                            value={userData.proteinTarget}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <small className="text-sm text-gray-600">Recommended: 1.6-2.2g per kg of body weight</small>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-500`}>
            <header className="flex items-center justify-between p-4 bg-orange-600 shadow-lg">
                <div className="text-2xl font-bold animate-pulse">BrainMeal</div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleTheme}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-400 rounded-md transition-transform transform hover:scale-105"
                    >
                        {darkMode ? t.light : t.dark}
                    </button>
                    <select
                        value={language}
                        onChange={(e) => changeLanguage(e.target.value)}
                        className="p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                        <option value="en">EN</option>
                        <option value="uk">UK</option>
                    </select>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-500 hover:bg-red-400 rounded-md transition-transform transform hover:scale-105"
                    >
                        {t.logout}
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">{t.profileSettings}</h2>
                    <p className="text-lg text-gray-300">{t.profileDescription}</p>
                </div>

                {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

                <form className="space-y-6">
                    <section className="p-4 bg-gray-800 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">{t.personalInformation}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1">{t.weight}</label>
                                <input
                                    type="number"
                                    name="weight"
                                    placeholder="Enter your weight"
                                    value={userData.weight}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">{t.height}</label>
                                <input
                                    type="number"
                                    name="height"
                                    placeholder="Enter your height"
                                    value={userData.height}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block mb-1">{t.age}</label>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Enter your age"
                                    value={userData.age}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">{t.gender}</label>
                                <select
                                    name="gender"
                                    value={userData.gender}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                                value={userData.activityLevel}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                            >
                                {activityLevels.map(level => (
                                    <option key={level.value} value={level.value}>
                                        {getActivityLevelLabel(level.value)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    <section className="p-4 bg-gray-800 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">{t.dietType}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => handleDietChange('basic')}
                                className="p-4 bg-orange-500 hover:bg-orange-400 rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                            >
                                <h4 className="text-lg font-bold">{t.basic}</h4>
                                <p className="text-sm">{t.balancedNutrition}</p>
                            </div>
                            <div
                                onClick={() => handleDietChange('weightloss')}
                                className="p-4 bg-orange-500 hover:bg-orange-400 rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                            >
                                <h4 className="text-lg font-bold">{t.weightLoss}</h4>
                                <p className="text-sm">{t.weightLossDesc}</p>
                            </div>
                            <div
                                onClick={() => handleDietChange('weightgain')}
                                className="p-4 bg-orange-500 hover:bg-orange-400 rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                            >
                                <h4 className="text-lg font-bold">{t.weightGain}</h4>
                                <p className="text-sm">{t.weightGainDesc}</p>
                            </div>
                            <div
                                onClick={() => handleDietChange('protein')}
                                className="p-4 bg-orange-500 hover:bg-orange-400 rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                            >
                                <h4 className="text-lg font-bold">{t.highProtein}</h4>
                                <p className="text-sm">{t.highProteinDesc}</p>
                            </div>
                        </div>
                        {renderDietSpecificFields()}
                    </section>

                    <section className="p-4 bg-gray-800 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">{t.dietPreferences}</h3>
                        <div className="mb-4">
                            <label className="block mb-1">{t.calorieTarget}</label>
                            <input
                                type="number"
                                name="calorieTarget"
                                placeholder="Auto-calculated based on your data"
                                value={userData.calorieTarget}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                            <small className="text-sm text-gray-400">Leave empty for auto-calculation or enter your target</small>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">{t.mealFrequency}</label>
                            <select
                                name="mealFrequency"
                                value={userData.mealFrequency}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                                    <div key={restriction} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`restriction-${restriction}`}
                                            name={`restriction-${restriction}`}
                                            checked={userData.dietRestrictions?.includes(restriction) || false}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-orange-500"
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
                                    <div key={allergy} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`allergy-${allergy}`}
                                            name={`allergy-${allergy}`}
                                            checked={userData.allergies?.includes(allergy) || false}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-orange-500"
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
                                    <div key={cuisine} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`cuisine-${cuisine}`}
                                            name={`cuisine-${cuisine}`}
                                            checked={userData.preferredCuisines?.includes(cuisine) || false}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-orange-500"
                                        />
                                        <label htmlFor={`cuisine-${cuisine}`}>{cuisine}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="p-4 bg-gray-800 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">{t.currentMealHabits}</h3>
                        <p className="mb-4 text-gray-400">{t.describeMeals}</p>
                        <div className="mb-4">
                            <label className="block mb-1">{t.breakfast}</label>
                            <textarea
                                name="breakfast"
                                placeholder={`Describe your typical ${t.breakfast.toLowerCase()}`}
                                value={userData.breakfast}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">{t.lunch}</label>
                            <textarea
                                name="lunch"
                                placeholder={`Describe your typical ${t.lunch.toLowerCase()}`}
                                value={userData.lunch}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">{t.dinner}</label>
                            <textarea
                                name="dinner"
                                placeholder={`Describe your typical ${t.dinner.toLowerCase()}`}
                                value={userData.dinner}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">{t.snacks}</label>
                            <textarea
                                name="snacks"
                                placeholder={`Describe your typical ${t.snacks.toLowerCase()}`}
                                value={userData.snacks}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                    </section>
                </form>
            </main>

            <footer className="flex-none bg-orange-600 bg-opacity-80 p-4">
                <button
                    type="button"
                    onClick={handleGenerateMealPlan}
                    disabled={loading}
                    className="w-full py-3 text-lg font-semibold bg-orange-500 hover:bg-orange-400 rounded-md transition-transform transform hover:scale-105"
                >
                    {loading ? t.generating : t.generateMealPlan}
                </button>
            </footer>
        </div>
    );
};

export default Profile;



