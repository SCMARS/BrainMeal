import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import './styles/Profile.css';

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

    // Основное состояние пользователя
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

    // Загружаем сохраненные данные пользователя
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
                    <div className="brainmeal-form-field diet-specific-field">
                        <label className="brainmeal-label">Target Weight (kg)</label>
                        <input
                            type="number"
                            name="targetWeight"
                            className="brainmeal-input"
                            placeholder="Specify your target weight"
                            value={userData.targetWeight}
                            onChange={handleChange}
                        />
                        <small className="brainmeal-field-hint">
                            Recommended: no more than 0.5-1 kg loss per week
                        </small>
                    </div>
                );
            case 'weightgain':
                return (
                    <div className="brainmeal-form-field">
                        <label className="brainmeal-label">{t.activityLevel}</label>
                        <select
                            name="activityLevel"
                            className="brainmeal-select"
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
                    <div className="brainmeal-form-field diet-specific-field">
                        <label className="brainmeal-label">Protein Target (g/day)</label>
                        <input
                            type="number"
                            name="proteinTarget"
                            className="brainmeal-input"
                            placeholder="Daily protein target"
                            value={userData.proteinTarget}
                            onChange={handleChange}
                        />
                        <small className="brainmeal-field-hint">
                            Recommended: 1.6-2.2g per kg of body weight
                        </small>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`brainmeal-container ${darkMode ? 'theme-dark' : 'theme-light'}`}>
            <header className="brainmeal-header">
                <div className="brainmeal-logo">
                    <div className="brainmeal-logo-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z" />
                        </svg>
                    </div>
                    <h1 className="brainmeal-app-title">BrainMeal</h1>
                </div>
                <div className="header-controls">
                    {/* Переключение темы */}
                    <button onClick={toggleTheme} className="theme-toggle-button">
                        {darkMode ? t.light : t.dark}
                    </button>
                    {/* Выбор языка */}
                    <select
                        value={language}
                        onChange={(e) => changeLanguage(e.target.value)}
                        className="language-select"
                    >
                        <option value="en">EN</option>
                        <option value="uk">UK</option>
                    </select>
                    <button onClick={logout} className="brainmeal-logout-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        {t.logout}
                    </button>
                </div>
            </header>

            <main className="brainmeal-content">
                <h2 className="brainmeal-section-title">{t.profileSettings}</h2>
                <p className="brainmeal-description">{t.profileDescription}</p>

                {error && <div className="brainmeal-error">{error}</div>}

                <form className="brainmeal-form">
                    {/* Personal Information */}
                    <section className="brainmeal-form-section">
                        <h3 className="brainmeal-subsection-title">{t.personalInformation}</h3>
                        <div className="brainmeal-form-row">
                            <div className="brainmeal-form-field">
                                <label className="brainmeal-label">{t.weight}</label>
                                <input
                                    type="number"
                                    name="weight"
                                    className="brainmeal-input"
                                    placeholder="Enter your weight"
                                    value={userData.weight}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="brainmeal-form-field">
                                <label className="brainmeal-label">{t.height}</label>
                                <input
                                    type="number"
                                    name="height"
                                    className="brainmeal-input"
                                    placeholder="Enter your height"
                                    value={userData.height}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="brainmeal-form-row">
                            <div className="brainmeal-form-field">
                                <label className="brainmeal-label">{t.age}</label>
                                <input
                                    type="number"
                                    name="age"
                                    className="brainmeal-input"
                                    placeholder="Enter your age"
                                    value={userData.age}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="brainmeal-form-field">
                                <label className="brainmeal-label">{t.gender}</label>
                                <select
                                    name="gender"
                                    className="brainmeal-select"
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

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">{t.activityLevel}</label>
                            <select
                                name="activityLevel"
                                className="brainmeal-select"
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
                    <section className="brainmeal-form-section">
                        <h3 className="brainmeal-subsection-title">{t.dietType}</h3>
                        <div className="brainmeal-diet-options">
                            <div className={`brainmeal-diet-option ${userData.dietType === 'basic' ? 'selected' : ''}`}
                                 onClick={() => handleDietChange('basic')}>
                                <div className="brainmeal-diet-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3 3a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                                    </svg>
                                </div>
                                <h4 className="brainmeal-diet-title">{t.basic}</h4>
                                <p className="brainmeal-diet-description">{t.balancedNutrition}</p>
                            </div>

                            <div className={`brainmeal-diet-option ${userData.dietType === 'weightloss' ? 'selected' : ''}`}
                                 onClick={() => handleDietChange('weightloss')}>
                                <div className="brainmeal-diet-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h4 className="brainmeal-diet-title">{t.weightLoss}</h4>
                                <p className="brainmeal-diet-description">{t.weightLossDesc}</p>
                            </div>

                            <div className={`brainmeal-diet-option ${userData.dietType === 'weightgain' ? 'selected' : ''}`}
                                 onClick={() => handleDietChange('weightgain')}>
                                <div className="brainmeal-diet-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h4 className="brainmeal-diet-title">{t.weightGain}</h4>
                                <p className="brainmeal-diet-description">{t.weightGainDesc}</p>
                            </div>

                            <div className={`brainmeal-diet-option ${userData.dietType === 'protein' ? 'selected' : ''}`}
                                 onClick={() => handleDietChange('protein')}>
                                <div className="brainmeal-diet-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                    </svg>
                                </div>
                                <h4 className="brainmeal-diet-title">{t.highProtein}</h4>
                                <p className="brainmeal-diet-description">{t.highProteinDesc}</p>
                            </div>
                        </div>
                        {renderDietSpecificFields()}
                    </section>

                    {/* Diet Preferences */}
                    <section className="brainmeal-form-section">
                        <h3 className="brainmeal-subsection-title">{t.dietPreferences}</h3>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">{t.calorieTarget}</label>
                            <input
                                type="number"
                                name="calorieTarget"
                                className="brainmeal-input"
                                placeholder="Auto-calculated based on your data"
                                value={userData.calorieTarget}
                                onChange={handleChange}
                            />
                            <small className="brainmeal-field-hint">
                                Leave empty for auto-calculation or enter your target
                            </small>
                        </div>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">{t.mealFrequency}</label>
                            <select
                                name="mealFrequency"
                                className="brainmeal-select"
                                value={userData.mealFrequency}
                                onChange={handleChange}
                            >
                                <option value="3">3 meals per day</option>
                                <option value="4">4 meals per day</option>
                                <option value="5">5 meals per day</option>
                                <option value="6">6 meals per day</option>
                            </select>
                        </div>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">{t.dietaryRestrictions}</label>
                            <div className="brainmeal-checkbox-group">
                                {dietaryRestrictions.map(restriction => (
                                    <div key={restriction} className="brainmeal-checkbox-item">
                                        <input
                                            type="checkbox"
                                            id={`restriction-${restriction}`}
                                            name={`restriction-${restriction}`}
                                            checked={userData.dietRestrictions?.includes(restriction) || false}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor={`restriction-${restriction}`}>{restriction}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">{t.allergies}</label>
                            <div className="brainmeal-checkbox-group">
                                {commonAllergies.map(allergy => (
                                    <div key={allergy} className="brainmeal-checkbox-item">
                                        <input
                                            type="checkbox"
                                            id={`allergy-${allergy}`}
                                            name={`allergy-${allergy}`}
                                            checked={userData.allergies?.includes(allergy) || false}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor={`allergy-${allergy}`}>{allergy}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">{t.preferredCuisines}</label>
                            <div className="brainmeal-checkbox-group">
                                {cuisineOptions.map(cuisine => (
                                    <div key={cuisine} className="brainmeal-checkbox-item">
                                        <input
                                            type="checkbox"
                                            id={`cuisine-${cuisine}`}
                                            name={`cuisine-${cuisine}`}
                                            checked={userData.preferredCuisines?.includes(cuisine) || false}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor={`cuisine-${cuisine}`}>{cuisine}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Current Meal Habits */}
                    <section className="brainmeal-form-section">
                        <h3 className="brainmeal-subsection-title">{t.currentMealHabits}</h3>
                        <p className="brainmeal-description">{t.describeMeals}</p>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">{t.breakfast}</label>
                            <textarea
                                name="breakfast"
                                className="brainmeal-textarea"
                                placeholder={`Describe your typical ${t.breakfast.toLowerCase()}`}
                                value={userData.breakfast}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">{t.lunch}</label>
                            <textarea
                                name="lunch"
                                className="brainmeal-textarea"
                                placeholder={`Describe your typical ${t.lunch.toLowerCase()}`}
                                value={userData.lunch}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">{t.dinner}</label>
                            <textarea
                                name="dinner"
                                className="brainmeal-textarea"
                                placeholder={`Describe your typical ${t.dinner.toLowerCase()}`}
                                value={userData.dinner}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">{t.snacks}</label>
                            <textarea
                                name="snacks"
                                className="brainmeal-textarea"
                                placeholder={`Describe your typical ${t.snacks.toLowerCase()}`}
                                value={userData.snacks}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    <div className="brainmeal-form-actions">
                        <button
                            type="button"
                            className="brainmeal-submit-button"
                            onClick={handleGenerateMealPlan}
                            disabled={loading}
                        >
                            {loading ? t.generating : t.generateMealPlan}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Profile;











