import { useState, useEffect } from 'react';
import './styles/Profile.css';
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();

    // Основное состояние пользователя с дополнительными параметрами диеты
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
        proteinTarget: '', // Для диеты "protein"
        activityLevel: 'moderate', // Уровень активности
        dietRestrictions: [], // Ограничения в питании
        allergies: [], // Аллергии
        mealFrequency: 3, // Количество приемов пищи в день
        calorieTarget: '', // Целевое количество калорий (авторасчет или ручной ввод)
        waterIntake: '',
        preferredCuisines: [] // Предпочитаемые кухни
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Инициализация сохраненных данных при монтировании компонента
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

    // Опции для расчета калорий с учетом уровня активности
    const activityLevels = [
        { value: 'sedentary', label: 'Sedentary (little or no exercise)', factor: 1.2 },
        { value: 'light', label: 'Lightly active (light exercise 1-3 days/week)', factor: 1.375 },
        { value: 'moderate', label: 'Moderately active (moderate exercise 3-5 days/week)', factor: 1.55 },
        { value: 'active', label: 'Very active (hard exercise 6-7 days/week)', factor: 1.725 },
        { value: 'extreme', label: 'Extremely active (very hard exercise & physical job)', factor: 1.9 }
    ];

    // Список распространенных диетических ограничений
    const dietaryRestrictions = [
        'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low FODMAP', 'Sugar-Free'
    ];

    // Список распространенных аллергенов
    const commonAllergies = [
        'Nuts', 'Shellfish', 'Eggs', 'Milk', 'Soy', 'Wheat', 'Fish', 'Sesame'
    ];

    // Список популярных кухонь
    const cuisineOptions = [
        'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian',
        'Mediterranean', 'French', 'Thai', 'American', 'Middle Eastern'
    ];

    // Универсальный обработчик для инпутов
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

    // Изменение типа диеты
    const handleDietChange = (diet) => {
        setUserData(prev => ({
            ...prev,
            dietType: diet
        }));
    };

    // Автоматический расчет дневной потребности в калориях по формуле Mifflin-St Jeor
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
                // Обновляем поле калорий, если оно не заполнено вручную
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
    }, [userData.weight, userData.height, userData.age, userData.gender, userData.activityLevel, userData.dietType]);

    // Валидация введенных данных
    const validateData = () => {
        const { weight, age, height, gender } = userData;
        if (!weight || !age || !height || !gender) {
            return "Please fill in all required fields: weight, age, height, and gender.";
        }
        if (parseFloat(weight) < 35 || parseFloat(weight) > 300) {
            return "Please enter a valid weight between 35-300 kg.";
        }
        if (parseInt(age) < 15 || parseInt(age) > 120) {
            return "Please enter a valid age between 15-120 years.";
        }
        if (parseFloat(height) < 100 || parseFloat(height) > 250) {
            return "Please enter a valid height between 100-250 cm.";
        }
        if (userData.dietType === 'weightloss') {
            if (!userData.targetWeight) {
                return "Please specify your target weight for the weight loss diet.";
            }
            const currentWeight = parseFloat(userData.weight);
            const targetWeight = parseFloat(userData.targetWeight);
            if (targetWeight >= currentWeight) {
                return "Target weight should be less than your current weight for a weight loss diet.";
            }
            if (targetWeight < currentWeight * 0.75) {
                return "For healthy weight loss, your target should not be less than 75% of your current weight.";
            }
        }
        if (userData.dietType === 'weightgain') {
            if (!userData.targetGain) {
                return "Please specify your target weight gain for the weight gain diet.";
            }
            const targetGain = parseFloat(userData.targetGain);
            if (targetGain <= 0) {
                return "Target gain should be a positive number.";
            }
            if (targetGain > 20) {
                return "For healthy weight gain, your target should not exceed 20 kg.";
            }
        }
        return "";
    };

    // Подготовка данных для отправки нейросети (или API)
    const prepareDataForAPI = () => {
        const apiData = {
            userMetrics: {
                weight: parseFloat(userData.weight),
                age: parseInt(userData.age),
                gender: userData.gender,
                height: parseFloat(userData.height),
                activityLevel: userData.activityLevel
            },
            dietPreferences: {
                dietType: userData.dietType,
                restrictions: userData.dietRestrictions || [],
                allergies: userData.allergies || [],
                cuisinePreferences: userData.preferredCuisines || [],
                mealFrequency: parseInt(userData.mealFrequency)
            },
            goals: {
                calorieTarget: userData.calorieTarget ? parseInt(userData.calorieTarget) : null,
                targetWeight: userData.targetWeight ? parseFloat(userData.targetWeight) : null,
                targetGain: userData.targetGain ? parseFloat(userData.targetGain) : null
            },
            currentMeals: {
                breakfast: userData.breakfast,
                lunch: userData.lunch,
                dinner: userData.dinner,
                snacks: userData.snacks
            }
        };
        return apiData;
    };

    // Генерация плана питания: данные сохраняются, затем переходим на страницу с планом питания,
    // где нейронка (через сервис) получит все подготовленные данные.
    const handleGenerateMealPlan = async () => {
        const validationError = validateData();
        if (validationError) {
            setError(validationError);
            return;
        }
        setLoading(true);
        try {
            // Сохраняем данные пользователя в localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
            // Подготавливаем данные для нейросети/API
            const apiData = prepareDataForAPI();
            localStorage.setItem('preparedData', JSON.stringify(apiData));
            // Переходим на страницу плана питания
            navigate("/MealPlan");
        } catch (err) {
            setError("Failed to generate meal plan: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Отрисовка дополнительных полей для выбранного типа диеты
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
                    <div className="brainmeal-form-field diet-specific-field">
                        <label className="brainmeal-label">Desired Weight Gain (kg)</label>
                        <input
                            type="number"
                            name="targetGain"
                            className="brainmeal-input"
                            placeholder="Specify desired weight gain"
                            value={userData.targetGain}
                            onChange={handleChange}
                        />
                        <small className="brainmeal-field-hint">
                            Recommended: no more than 0.25-0.5 kg gain per week
                        </small>
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
        <div className="brainmeal-container">
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
                <button onClick={logout} className="brainmeal-logout-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Logout
                </button>
            </header>

            <main className="brainmeal-content">
                <h2 className="brainmeal-section-title">Profile Settings</h2>
                <p className="brainmeal-description">
                    Please provide your information to create a personalized meal plan.
                </p>

                {error && <div className="brainmeal-error">{error}</div>}

                <form className="brainmeal-form">
                    {/* Личные данные */}
                    <section className="brainmeal-form-section">
                        <h3 className="brainmeal-subsection-title">Personal Information</h3>
                        <div className="brainmeal-form-row">
                            <div className="brainmeal-form-field">
                                <label className="brainmeal-label">Weight (kg) *</label>
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
                                <label className="brainmeal-label">Height (cm) *</label>
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
                                <label className="brainmeal-label">Age *</label>
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
                                <label className="brainmeal-label">Gender *</label>
                                <select
                                    name="gender"
                                    className="brainmeal-select"
                                    value={userData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Activity Level</label>
                            <select
                                name="activityLevel"
                                className="brainmeal-select"
                                value={userData.activityLevel}
                                onChange={handleChange}
                            >
                                {activityLevels.map(level => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {/* Выбор типа диеты */}
                    <section className="brainmeal-form-section">
                        <h3 className="brainmeal-subsection-title">Diet Type</h3>
                        <div className="brainmeal-diet-options">
                            <div className={`brainmeal-diet-option ${userData.dietType === 'basic' ? 'selected' : ''}`}
                                 onClick={() => handleDietChange('basic')}>
                                <div className="brainmeal-diet-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3 3a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                    </svg>
                                </div>
                                <h4 className="brainmeal-diet-title">Basic</h4>
                                <p className="brainmeal-diet-description">Balanced nutrition for everyday</p>
                            </div>

                            <div className={`brainmeal-diet-option ${userData.dietType === 'weightloss' ? 'selected' : ''}`}
                                 onClick={() => handleDietChange('weightloss')}>
                                <div className="brainmeal-diet-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h4 className="brainmeal-diet-title">Weight Loss</h4>
                                <p className="brainmeal-diet-description">Calorie deficit for healthy weight loss</p>
                            </div>

                            <div className={`brainmeal-diet-option ${userData.dietType === 'weightgain' ? 'selected' : ''}`}
                                 onClick={() => handleDietChange('weightgain')}>
                                <div className="brainmeal-diet-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h4 className="brainmeal-diet-title">Weight Gain</h4>
                                <p className="brainmeal-diet-description">Calorie surplus for muscle building</p>
                            </div>

                            <div className={`brainmeal-diet-option ${userData.dietType === 'protein' ? 'selected' : ''}`}
                                 onClick={() => handleDietChange('protein')}>
                                <div className="brainmeal-diet-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                    </svg>
                                </div>
                                <h4 className="brainmeal-diet-title">High Protein</h4>
                                <p className="brainmeal-diet-description">Protein-focused nutrition for athletes</p>
                            </div>
                        </div>
                        {renderDietSpecificFields()}
                    </section>

                    {/* Пищевые предпочтения */}
                    <section className="brainmeal-form-section">
                        <h3 className="brainmeal-subsection-title">Diet Preferences</h3>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Calorie Target (kcal/day)</label>
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
                            <label className="brainmeal-label">Meal Frequency</label>
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
                            <label className="brainmeal-label">Dietary Restrictions</label>
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
                            <label className="brainmeal-label">Allergies</label>
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
                            <label className="brainmeal-label">Preferred Cuisines</label>
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

                    {/* Текущие пищевые привычки */}
                    <section className="brainmeal-form-section">
                        <h3 className="brainmeal-subsection-title">Current Meal Habits</h3>
                        <p className="brainmeal-description">
                            Describe your current meals to receive more personalized recommendations.
                        </p>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Breakfast</label>
                            <textarea
                                name="breakfast"
                                className="brainmeal-textarea"
                                placeholder="Describe your typical breakfast"
                                value={userData.breakfast}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Lunch</label>
                            <textarea
                                name="lunch"
                                className="brainmeal-textarea"
                                placeholder="Describe your typical lunch"
                                value={userData.lunch}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Dinner</label>
                            <textarea
                                name="dinner"
                                className="brainmeal-textarea"
                                placeholder="Describe your typical dinner"
                                value={userData.dinner}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Snacks</label>
                            <textarea
                                name="snacks"
                                className="brainmeal-textarea"
                                placeholder="Describe your typical snacks"
                                value={userData.snacks}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    {/* Кнопка для генерации плана питания – данные, введенные здесь, будут переданы нейронке */}
                    <div className="brainmeal-form-actions">
                        <button
                            type="button"
                            className="brainmeal-submit-button"
                            onClick={handleGenerateMealPlan}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Meal Plan'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Profile;










