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

    // Initialize theme and language from localStorage or location.state
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

    // Save theme and language settings to localStorage
    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        // Apply scroll styling to the document body
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
        document.body.style.minHeight = '100vh';

        // Apply theme color to the document body
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.body.style.backgroundColor = '#1a202c';
            document.body.style.color = '#f7fafc';
        } else {
            document.body.classList.remove('dark-mode');
            document.body.style.backgroundColor = '#f7fafc';
            document.body.style.color = '#1a202c';
        }

        // Clean up function
        return () => {
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.body.style.minHeight = '';
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
            document.body.classList.remove('dark-mode');
        };
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
    // Add a state for scroll animation
    const [isScrolling, setIsScrolling] = useState(false);

    // Load saved user data from localStorage
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

        // Smooth scroll to top when component mounts
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

        // Add a smooth scroll to the next section after selection
        setTimeout(() => {
            const dietSection = document.getElementById('diet-preferences');
            if (dietSection) {
                dietSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    };

    // Automatic calorie calculation based on input data
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

    // Implement smooth scrolling for form navigation
    const scrollToSection = (sectionId) => {
        setIsScrolling(true);
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => setIsScrolling(false), 1000);
        } else {
            setIsScrolling(false);
        }
    };

    const handleGenerateMealPlan = async () => {
        try {
            setLoading(true);
            // Add animation class for the button
            const button = document.getElementById('generate-button');
            if (button) button.classList.add('loading-animation');

            // Scroll to bottom smoothly with a nicer animation
            setIsScrolling(true);
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });

            // Small delay to allow scrolling to complete
            await new Promise(resolve => setTimeout(resolve, 800));

            // Save user data to localStorage
            localStorage.setItem('userData', JSON.stringify(userData));

            // Navigate to meal plan page with user data
            navigate("/meal-plan", {
                state: {
                    userData,
                    darkMode,
                    language
                }
            });
        } catch (error) {
            console.error('Error generating meal plan:', error);
            setError('Failed to generate meal plan. Please try again.');
            const button = document.getElementById('generate-button');
            if (button) button.classList.remove('loading-animation');
        } finally {
            setLoading(false);
            setIsScrolling(false);
        }
    };

    const renderDietSpecificFields = () => {
        switch (userData.dietType) {
            case 'weightloss':
                return (
                    <div className="mt-4 p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg shadow-md transition-all duration-300">
                        <label className="block font-semibold mb-1">Target Weight (kg)</label>
                        <input
                            type="number"
                            name="targetWeight"
                            placeholder="Specify your target weight"
                            value={userData.targetWeight}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                        />
                        <small className="text-sm text-gray-600 dark:text-gray-300">Recommended: no more than 0.5-1 kg loss per week</small>
                    </div>
                );
            case 'weightgain':
                return (
                    <div className="mt-4 p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg shadow-md transition-all duration-300">
                        <label className="block font-semibold mb-1">{t.activityLevel}</label>
                        <select
                            name="activityLevel"
                            value={userData.activityLevel}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
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
                    <div className="mt-4 p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg shadow-md transition-all duration-300">
                        <label className="block font-semibold mb-1">Protein Target (g/day)</label>
                        <input
                            type="number"
                            name="proteinTarget"
                            placeholder="Daily protein target"
                            value={userData.proteinTarget}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                        />
                        <small className="text-sm text-gray-600 dark:text-gray-300">Recommended: 1.6-2.2g per kg of body weight</small>
                    </div>
                );
            default:
                return null;
        }
    };

    // Quick navigation buttons
    const QuickNav = () => (
        <div className="sticky top-20 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg shadow-md mb-6 flex flex-wrap gap-2 transition-all duration-300">
            <button onClick={() => scrollToSection('personal-info')}
                    className="px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                Personal Info
            </button>
            <button onClick={() => scrollToSection('diet-type')}
                    className="px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                Diet Type
            </button>
            <button onClick={() => scrollToSection('diet-preferences')}
                    className="px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                Preferences
            </button>
            <button onClick={() => scrollToSection('meal-habits')}
                    className="px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                Meal Habits
            </button>
            <button onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
                    className="px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                Generate
            </button>
        </div>
    );

    return (
        <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-500`}>
            {/* Custom scroll styling */}
            <style jsx="true">{`
                /* Custom scrollbar */
                ::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                
                ::-webkit-scrollbar-track {
                    background: ${darkMode ? '#2d3748' : '#f7fafc'};
                    border-radius: 5px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: ${darkMode ? '#4a5568' : '#e2e8f0'};
                    border-radius: 5px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: ${darkMode ? '#718096' : '#cbd5e0'};
                }
                
                /* Scroll animations */
                .scroll-indicator {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    background-color: #ed8936;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(237, 137, 54, 0.5);
                    opacity: ${isScrolling ? 0 : 1};
                    transition: all 0.3s ease;
                    z-index: 9999;
                }
                
                .scroll-indicator:hover {
                    transform: scale(1.1);
                }
                
                .loading-animation {
                    position: relative;
                    overflow: hidden;
                }
                
                .loading-animation::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.2),
                        transparent
                    );
                    animation: loading 1.5s infinite;
                }
                
                @keyframes loading {
                    0% {
                        left: -100%;
                    }
                    100% {
                        left: 100%;
                    }
                }
                
                /* Form transitions */
                .form-section {
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
                
                .form-section:hover {
                    transform: translateY(-5px);
                }
                
                /* Card animations */
                .diet-card {
                    transition: all 0.3s ease;
                }
                
                .diet-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                
                .active-diet-card {
                    position: relative;
                }
                
                .active-diet-card::before {
                    content: '';
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: #48bb78;
                    border: 2px solid white;
                    z-index: 10;
                }
                
                /* Input highlight effects */
                .input-highlight {
                    transition: all 0.2s ease;
                }
                
                .input-highlight:focus {
                    box-shadow: 0 0 0 3px rgba(237, 137, 54, 0.3);
                    transform: translateY(-2px);
                }
            `}</style>

            <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-lg transition-all duration-500">
                <div className="text-2xl font-bold text-white animate-pulse">BrainMeal</div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleTheme}
                        className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {darkMode ? t.light : t.dark}
                    </button>
                    <select
                        value={language}
                        onChange={(e) => changeLanguage(e.target.value)}
                        className="p-2 rounded-md bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 cursor-pointer"
                        aria-label="Change language"
                    >
                        <option value="en">EN</option>
                        <option value="uk">UK</option>
                    </select>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        {t.logout}
                    </button>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 space-y-8 overflow-y-auto">
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-orange-500">{t.profileSettings}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{t.profileDescription}</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md shadow-md animate-bounce">
                        {error}
                    </div>
                )}

                <QuickNav />

                <form className="space-y-8">
                    <section id="personal-info" className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 form-section">
                        <h3 className="text-xl font-semibold mb-4 text-orange-500 flex items-center">
                            <span className="inline-block w-8 h-8 mr-2 bg-orange-500 text-white rounded-full flex items-center justify-center">1</span>
                            {t.personalInformation}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.weight}</label>
                                <input
                                    type="number"
                                    name="weight"
                                    placeholder="Enter your weight"
                                    value={userData.weight}
                                    onChange={handleChange}
                                    required
                                    className="input-highlight w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.height}</label>
                                <input
                                    type="number"
                                    name="height"
                                    placeholder="Enter your height"
                                    value={userData.height}
                                    onChange={handleChange}
                                    required
                                    className="input-highlight w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.age}</label>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Enter your age"
                                    value={userData.age}
                                    onChange={handleChange}
                                    required
                                    className="input-highlight w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.gender}</label>
                                <select
                                    name="gender"
                                    value={userData.gender}
                                    onChange={handleChange}
                                    required
                                    className="input-highlight w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                >
                                    <option value="">{t.selectGender}</option>
                                    <option value="male">{t.male}</option>
                                    <option value="female">{t.female}</option>
                                    <option value="other">{t.other}</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.activityLevel}</label>
                            <select
                                name="activityLevel"
                                value={userData.activityLevel}
                                onChange={handleChange}
                                className="input-highlight w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                            >
                                {activityLevels.map(level => (
                                    <option key={level.value} value={level.value}>
                                        {getActivityLevelLabel(level.value)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => scrollToSection('diet-type')}
                            className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
                        >
                            Continue to Diet Type <span className="ml-2">→</span>
                        </button>
                    </section>

                    <section id="diet-type" className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 form-section">
                        <h3 className="text-xl font-semibold mb-4 text-orange-500 flex items-center">
                            <span className="inline-block w-8 h-8 mr-2 bg-orange-500 text-white rounded-full flex items-center justify-center">2</span>
                            {t.dietType}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                            <div
                                className={`diet-card p-6 rounded-lg shadow-md cursor-pointer ${userData.dietType === 'basic' ? 'active-diet-card bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}
                                onClick={() => handleDietChange('basic')}
                            >
                                <h4 className="text-lg font-semibold text-orange-500 mb-2">{t.basic}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{t.balancedNutrition}</p>
                            </div>

                            <div
                                className={`diet-card p-6 rounded-lg shadow-md cursor-pointer ${userData.dietType === 'weightloss' ? 'active-diet-card bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}
                                onClick={() => handleDietChange('weightloss')}
                            >
                                <h4 className="text-lg font-semibold text-orange-500 mb-2">{t.weightLoss}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{t.weightLossDesc}</p>
                            </div>

                            <div
                                className={`diet-card p-6 rounded-lg shadow-md cursor-pointer ${userData.dietType === 'weightgain' ? 'active-diet-card bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}
                                onClick={() => handleDietChange('weightgain')}
                            >
                                <h4 className="text-lg font-semibold text-orange-500 mb-2">{t.weightGain}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{t.weightGainDesc}</p>
                            </div>

                            <div
                                className={`diet-card p-6 rounded-lg shadow-md cursor-pointer ${userData.dietType === 'protein' ? 'active-diet-card bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}
                                onClick={() => handleDietChange('protein')}
                            >
                                <h4 className="text-lg font-semibold text-orange-500 mb-2">{t.highProtein}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{t.highProteinDesc}</p>
                            </div>
                        </div>

                        {renderDietSpecificFields()}
                    </section>

                    <section id="diet-preferences" className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 form-section">
                        <h3 className="text-xl font-semibold mb-4 text-orange-500 flex items-center">
                            <span className="inline-block w-8 h-8 mr-2 bg-orange-500 text-white rounded-full flex items-center justify-center">3</span>
                            {t.dietPreferences}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.calorieTarget}</label>
                                <input
                                    type="number"
                                    name="calorieTarget"
                                    placeholder="Daily calorie target"
                                    value={userData.calorieTarget}
                                    onChange={handleChange}
                                    className="input-highlight w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.mealFrequency}</label>
                                <select
                                    name="mealFrequency"
                                    value={userData.mealFrequency}
                                    onChange={handleChange}
                                    className="input-highlight w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                >
                                    <option value="3">3 meals per day</option>
                                    <option value="4">4 meals per day</option>
                                    <option value="5">5 meals per day</option>
                                    <option value="6">6 meals per day</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.dietaryRestrictions}</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {dietaryRestrictions.map(restriction => (
                                    <div key={restriction} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`restriction-${restriction}`}
                                            name={`restriction-${restriction}`}
                                            checked={userData.dietRestrictions?.includes(restriction) || false}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 dark:border-gray-600 rounded"
                                        />
                                        <label htmlFor={`restriction-${restriction}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            {restriction}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.allergies}</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {commonAllergies.map(allergy => (
                                    <div key={allergy} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`allergy-${allergy}`}
                                            name={`allergy-${allergy}`}
                                            checked={userData.allergies?.includes(allergy) || false}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 dark:border-gray-600 rounded"
                                        />
                                        <label htmlFor={`allergy-${allergy}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            {allergy}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.preferredCuisines}</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {cuisineOptions.map(cuisine => (
                                    <div key={cuisine} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`cuisine-${cuisine}`}
                                            name={`cuisine-${cuisine}`}
                                            checked={userData.preferredCuisines?.includes(cuisine) || false}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 dark:border-gray-600 rounded"
                                        />
                                        <label htmlFor={`cuisine-${cuisine}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            {cuisine}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => scrollToSection('meal-habits')}
                            className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
                        >
                            Continue to Meal Habits <span className="ml-2">→</span>
                        </button>
                    </section>

                    <section id="meal-habits" className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 form-section">
                        <h3 className="text-xl font-semibold mb-4 text-orange-500 flex items-center">
                            <span className="inline-block w-8 h-8 mr-2 bg-orange-500 text-white rounded-full flex items-center justify-center">4</span>
                            {t.currentMealHabits}
                        </h3>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">{t.describeMeals}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.breakfast}</label>
                                <textarea
                                    name="breakfast"
                                    placeholder="What do you typically eat for breakfast?"
                                    value={userData.breakfast}
                                    onChange={handleChange}
                                    rows="2"
                                    className="input-highlight w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.lunch}</label>
                                <textarea
                                    name="lunch"
                                    placeholder="What do you typically eat for lunch?"
                                    value={userData.lunch}
                                    onChange={handleChange}
                                    rows="2"
                                    className="input-highlight w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.dinner}</label>
                                <textarea
                                    name="dinner"
                                    placeholder="What do you typically eat for dinner?"
                                    value={userData.dinner}
                                    onChange={handleChange}
                                    rows="2"
                                    className="input-highlight w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.snacks}</label>
                                <textarea
                                    name="snacks"
                                    placeholder="What snacks do you typically consume?"
                                    value={userData.snacks}
                                    onChange={handleChange}
                                    rows="2"
                                    className="input-highlight w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-center mt-8">
                        <button
                            id="generate-button"
                            type="button"
                            onClick={handleGenerateMealPlan}
                            disabled={loading}
                            className="w-full max-w-md py-4 px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg font-bold rounded-md shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                            {loading ? t.generating : t.generateMealPlan}
                        </button>
                    </div>
                </form>
            </main>

            {/* Scroll to top button */}
            {!isScrolling && (
                <div
                    className="scroll-indicator"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Scroll to top"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </div>
            )}

            <footer className="bg-gray-100 dark:bg-gray-800 p-4 text-center text-gray-600 dark:text-gray-300 transition-colors duration-500 mt-12">
                <p>&copy; {new Date().getFullYear()} BrainMeal. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Profile;