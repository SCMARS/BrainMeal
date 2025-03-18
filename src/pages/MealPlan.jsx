import { useState, useEffect } from 'react';
import "./styles/Mealplan.css";
import { useLocation, useNavigate } from "react-router-dom";
import { generateMealPlan } from './services/llmService.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function MealPlanningApp() {
    const navigate = useNavigate();
    const location = useLocation();

    const [userData, setUserData] = useState(null);
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
    const [isLoadingDaily, setIsLoadingDaily] = useState(false);
    const [error, setError] = useState(null);
    const [nutritionStats, setNutritionStats] = useState(null);
    const [selectedDay, setSelectedDay] = useState('monday');
    const [isEditing, setIsEditing] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [editingDay, setEditingDay] = useState(null);
    const [editMealName, setEditMealName] = useState('');
    const [editCalories, setEditCalories] = useState('');

    // Translations
    const translations = {
        en: {
            mainTitle: "Meal Planning",
            subtitle: "Daily and Weekly Plans",
            weeklyPlan: "Weekly Plan",
            dailyPlan: "Daily Plan",
            generateWeeklyPlan: "Generate Weekly Plan",
            generateDailyPlan: "Generate Daily Plan",
            breakfast: "Breakfast",
            lunch: "Lunch",
            dinner: "Dinner",
            snack: "Snack",
            calories: "Calories",
            totalCalories: "Total Calories",
            profile: "Your Profile",
            weight: "Weight",
            height: "Height",
            age: "Age",
            dietType: "Diet Type",
            mealPreferences: "Meal Preferences",
            editMeal: "Edit Meal",
            save: "Save",
            cancel: "Cancel",
            back: "← Back",
            errorLoadingProfile: "Error loading profile. Return to the profile page.",
            userDataNotFound: "User data not found. Please fill out the profile.",
            noDataForDay: "No data for this day",
            notSpecified: "Not specified",
            total: "Total",
            totalCaloriesIntake: "Total Calories: ",
            nutritionInfo: "Nutritional Information",
            generateMealPlan: "Generate Meal Plan",
            mealPlanForWeek: "Meal Plan for the Week",
            mealPlanForDay: "Meal Plan for the Day",
            calorieDistribution: "Calorie Distribution",
            recommendations: "Recommendations",
            dietRecommendations: "Dietary Recommendations",
            hydrationTip: "Drink enough water throughout the day",
            mealTimingTip: "Space your meals every 3-4 hours",
            balancedDietTip: "Include a variety of foods in your diet",
            proteinDietTip: "Consume more protein-rich foods (eggs, chicken breast, cottage cheese)",
            muscleGainTip: "Increase water intake to 2-3 liters per day",
            complexCarbsTip: "Include more whole grains for energy",
            weightLossTip: "Avoid sugar and simple carbohydrates",
            eatSlowlyTip: "Eat slowly, chewing thoroughly",
            moreVegetablesTip: "Eat more vegetables and protein foods",
            gentleDietTip: "Avoid spicy and fatty foods",
            preferBoiledTip: "Prefer boiled and stewed food",
            warmWaterTip: "Drink more warm water between meals",
            calorieStats: "Caloric Intake by Meals",
            caloriesIntake: "Caloric Intake",
            selectDay: "Select Day",
            edit: "Edit",
            delete: "Delete",
            loading: "Loading...",
            weeklyMealPlan: "Weekly Meal Plan",
            dailyMealPlan: "Daily Meal Plan",
            noMealData: "No data available",
            enterMealName: "Enter meal name",
            enterCalories: "Enter calories",
            monday: "Monday",
            tuesday: "Tuesday",
            wednesday: "Wednesday",
            thursday: "Thursday",
            friday: "Friday",
            saturday: "Saturday",
            sunday: "Sunday",
            mealEditing: "Editing Meal",
            day: "Day",
            meal: "Meal",
            mealName: "Meal Name",
            caloriesCount: "Calories",
            totalMacros: "Total Macronutrients",
            proteins: "Proteins",
            fats: "Fats",
            carbs: "Carbohydrates",
            basic: "Basic",
            gentle: "Gentle",
            highProtein: "High Protein",
            weightLoss: "Weight Loss",
            muscleGain: "Muscle Gain"
        },
        uk: {
            mainTitle: "План харчування",
            subtitle: "Щоденні та тижневі плани",
            weeklyPlan: "Тижневий план",
            dailyPlan: "Щоденний план",
            generateWeeklyPlan: "Згенерувати тижневий план",
            generateDailyPlan: "Згенерувати щоденний план",
            breakfast: "Сніданок",
            lunch: "Обід",
            dinner: "Вечеря",
            snack: "Перекус",
            calories: "Калорії",
            totalCalories: "Всього калорій",
            profile: "Ваш профіль",
            weight: "Вага",
            height: "Зріст",
            age: "Вік",
            dietType: "Тип дієти",
            mealPreferences: "Харчові уподобання",
            editMeal: "Редагувати прийом їжі",
            save: "Зберегти",
            cancel: "Скасувати",
            back: "← Назад",
            errorLoadingProfile: "Помилка завантаження профілю. Поверніться на сторінку профілю.",
            userDataNotFound: "Дані користувача не знайдені. Будь ласка, заповніть профіль.",
            noDataForDay: "Немає даних для цього дня",
            notSpecified: "Не вказано",
            total: "Всього",
            totalCaloriesIntake: "Всього калорій: ",
            nutritionInfo: "Інформація про поживні речовини",
            generateMealPlan: "Згенерувати план харчування",
            mealPlanForWeek: "План харчування на тиждень",
            mealPlanForDay: "План харчування на день",
            calorieDistribution: "Розподіл калорій",
            recommendations: "Рекомендації",
            dietRecommendations: "Рекомендації щодо харчування",
            hydrationTip: "Пийте достатньо води протягом дня",
            mealTimingTip: "Розділяйте прийоми їжі кожні 3-4 години",
            balancedDietTip: "Включайте в раціон різноманітні продукти",
            proteinDietTip: "Споживайте більше білкової їжі (яйця, куряча грудка, сир)",
            muscleGainTip: "Збільшіть споживання води до 2-3 літрів на день",
            complexCarbsTip: "Додавайте більше цільнозернових продуктів для енергії",
            weightLossTip: "Уникайте цукру і простих вуглеводів",
            eatSlowlyTip: "Їжте повільно, ретельно пережовуючи їжу",
            moreVegetablesTip: "Споживайте більше овочів та білкової їжі",
            gentleDietTip: "Уникайте гострих і жирних страв",
            preferBoiledTip: "Надавайте перевагу вареній та тушкованій їжі",
            warmWaterTip: "Пийте більше теплої води між прийомами їжі",
            calorieStats: "Калорійність по прийомах їжі",
            caloriesIntake: "Споживання калорій",
            selectDay: "Виберіть день",
            edit: "Редагувати",
            delete: "Видалити",
            loading: "Завантаження...",
            weeklyMealPlan: "Тижневий план харчування",
            dailyMealPlan: "Щоденний план харчування",
            noMealData: "Немає даних",
            enterMealName: "Введіть назву страви",
            enterCalories: "Введіть кількість калорій",
            monday: "Понеділок",
            tuesday: "Вівторок",
            wednesday: "Середа",
            thursday: "Четвер",
            friday: "П'ятниця",
            saturday: "Субота",
            sunday: "Неділя",
            mealEditing: "Редагування прийому їжі",
            day: "День",
            meal: "Прийом їжі",
            mealName: "Назва страви",
            caloriesCount: "Калорії",
            totalMacros: "Загальна кількість макроелементів",
            proteins: "Білки",
            fats: "Жири",
            carbs: "Вуглеводи",
            basic: "Базова",
            gentle: "Щадяща",
            highProtein: "Високобілкова",
            weightLoss: "Для схуднення",
            muscleGain: "Для набору м'язової маси"
        }
    };

    // Theme and language state
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
    const theme = darkMode ? 'dark-theme' : 'light-theme';

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    // Load user data on mount
    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                setUserData(JSON.parse(storedUserData));
            } catch (err) {
                console.error("Error parsing user data:", err);
                setError(t.errorLoadingProfile);
            }
        } else {
            setError(t.userDataNotFound);
        }
    }, [t]);

    useEffect(() => {
        if (weeklyPlan && selectedDay && weeklyPlan[selectedDay]) {
            calculateNutritionStats(weeklyPlan[selectedDay]);
        } else if (dailyPlan) {
            calculateNutritionStats(dailyPlan);
        }
    }, [weeklyPlan, dailyPlan, selectedDay]);

    const backHandler = () => {
        navigate("/profile");
    };

    // Translates diet type to user-friendly text
    const translateDietType = (dietType) => {
        switch(dietType) {
            case 'basic': return t.basic;
            case 'gentle': return t.gentle;
            case 'protein': return t.highProtein;
            case 'weight_loss': return t.weightLoss;
            case 'muscle_gain': return t.muscleGain;
            default: return t.notSpecified;
        }
    };

    const calculateNutritionStats = (plan) => {
        let totalCalories = 0;

        if (plan.breakfast_calories !== undefined) {
            // Weekly plan format
            totalCalories =
                (parseInt(plan.breakfast_calories) || 0) +
                (parseInt(plan.lunch_calories) || 0) +
                (parseInt(plan.dinner_calories) || 0);
        } else if (plan.breakfast?.calories !== undefined) {
            // Daily plan format
            totalCalories =
                (parseInt(plan.breakfast?.calories) || 0) +
                (parseInt(plan.lunch?.calories) || 0) +
                (parseInt(plan.dinner?.calories) || 0) +
                (parseInt(plan.snack?.calories) || 0);
        }

        // Default macronutrient distribution
        let proteinPercentage = 0.25;
        let fatPercentage = 0.3;
        let carbsPercentage = 0.45;

        // Adjust based on diet type
        if (userData && userData.dietType) {
            switch(userData.dietType) {
                case "protein":
                case "muscle_gain":
                    proteinPercentage = 0.35;
                    fatPercentage = 0.25;
                    carbsPercentage = 0.4;
                    break;
                case "weight_loss":
                    proteinPercentage = 0.3;
                    fatPercentage = 0.35;
                    carbsPercentage = 0.35;
                    break;
                case "gentle":
                    proteinPercentage = 0.2;
                    fatPercentage = 0.3;
                    carbsPercentage = 0.5;
                    break;
                default:
                    break;
            }
        }

        // Calculate macros in grams
        const protein = Math.round(totalCalories * proteinPercentage / 4);
        const fat = Math.round(totalCalories * fatPercentage / 9);
        const carbs = Math.round(totalCalories * carbsPercentage / 4);

        setNutritionStats({
            calories: Math.round(totalCalories),
            macros: [
                { name: t.proteins, value: protein, grams: protein, color: '#8884d8' },
                { name: t.fats, value: fat, grams: fat, color: '#82ca9d' },
                { name: t.carbs, value: carbs, grams: carbs, color: '#ffc658' }
            ]
        });
    };

    const handleGenerateWeeklyPlan = async () => {
        if (!userData) {
            setError(t.userDataNotFound);
            return;
        }
        setIsLoadingWeekly(true);
        setError(null);
        try {
            const generatedPlan = await generateMealPlan({
                ...userData,
                isWeekly: true
            });
            setWeeklyPlan(generatedPlan);
            setSelectedDay('monday');
            setDailyPlan(null);
        } catch (err) {
            console.error(err);
            setError(t.weeklyPlanGenerationError || "Failed to generate weekly plan. Please try again later.");
        } finally {
            setIsLoadingWeekly(false);
        }
    };

    const handleGenerateDailyPlan = async () => {
        if (!userData) {
            setError(t.userDataNotFound);
            return;
        }
        setIsLoadingDaily(true);
        setError(null);
        try {
            const generatedPlan = await generateMealPlan({
                ...userData,
                isWeekly: false
            });
            setDailyPlan(generatedPlan);
            setWeeklyPlan(null);
        } catch (err) {
            console.error(err);
            setError(t.dailyPlanGenerationError || "Failed to generate daily plan. Please try again later.");
        } finally {
            setIsLoadingDaily(false);
        }
    };

    const handleDayClick = (day) => {
        setSelectedDay(day);
    };

    const startEditingWeeklyMeal = (day, meal) => {
        setIsEditing(true);
        setEditingDay(day);
        setEditingMeal(meal);
        setEditMealName(weeklyPlan[day][meal] || '');
        setEditCalories(weeklyPlan[day][`${meal}_calories`] || 0);
    };

    const startEditingDailyMeal = (meal) => {
        setIsEditing(true);
        setEditingDay(null);
        setEditingMeal(meal);
        setEditMealName(dailyPlan[meal]?.meal || '');
        setEditCalories(dailyPlan[meal]?.calories || 0);
    };

    const saveEditedMeal = () => {
        if (editingDay) {
            // Editing weekly plan
            const updatedWeeklyPlan = { ...weeklyPlan };
            if (!updatedWeeklyPlan[editingDay]) {
                updatedWeeklyPlan[editingDay] = {};
            }
            updatedWeeklyPlan[editingDay] = { ...updatedWeeklyPlan[editingDay] };
            updatedWeeklyPlan[editingDay][editingMeal] = editMealName;
            updatedWeeklyPlan[editingDay][`${editingMeal}_calories`] = parseInt(editCalories) || 0;
            setWeeklyPlan(updatedWeeklyPlan);
            calculateNutritionStats(updatedWeeklyPlan[editingDay]);
        } else {
            // Editing daily plan
            const updatedDailyPlan = { ...dailyPlan };
            if (!updatedDailyPlan[editingMeal]) {
                updatedDailyPlan[editingMeal] = {};
            }
            updatedDailyPlan[editingMeal] = {
                ...updatedDailyPlan[editingMeal],
                meal: editMealName,
                calories: parseInt(editCalories) || 0
            };
            setDailyPlan(updatedDailyPlan);
            calculateNutritionStats(updatedDailyPlan);
        }
        setIsEditing(false);
        setEditingMeal(null);
        setEditingDay(null);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditingMeal(null);
        setEditingDay(null);
    };

    // Edit modal
    const renderEditModal = () => {
        if (!isEditing) return null;
        return (
            <div className="modal">
                <div className="modal-content">
                    <h3>{t.mealEditing}</h3>
                    {editingDay && <p>{t.day}: {t[editingDay]}</p>}
                    <p>{t.meal}: {t[editingMeal]}</p>
                    <div className="form-group">
                        <label htmlFor="meal-name">{t.mealName}:</label>
                        <input
                            id="meal-name"
                            type="text"
                            value={editMealName}
                            onChange={(e) => setEditMealName(e.target.value)}
                            placeholder={t.enterMealName}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="calories">{t.caloriesCount}:</label>
                        <input
                            id="calories"
                            type="number"
                            value={editCalories}
                            onChange={(e) => setEditCalories(e.target.value)}
                            placeholder={t.enterCalories}
                        />
                    </div>
                    <div className="button-group">
                        <button className="save-button" onClick={saveEditedMeal}>{t.save}</button>
                        <button className="cancel-button" onClick={cancelEditing}>{t.cancel}</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderCalorieStats = () => {
        let mealCalories = [];
        let total = 0;

        if (weeklyPlan && selectedDay && weeklyPlan[selectedDay]) {
            const dayPlan = weeklyPlan[selectedDay];
            mealCalories = [
                { name: t.breakfast, calories: Number(dayPlan.breakfast_calories) || 0 },
                { name: t.lunch, calories: Number(dayPlan.lunch_calories) || 0 },
                { name: t.dinner, calories: Number(dayPlan.dinner_calories) || 0 },
            ];
            total = mealCalories.reduce((acc, meal) => acc + meal.calories, 0);
        } else if (dailyPlan) {
            mealCalories = [
                { name: t.breakfast, calories: Number(dailyPlan.breakfast?.calories) || 0 },
                { name: t.lunch, calories: Number(dailyPlan.lunch?.calories) || 0 },
                { name: t.dinner, calories: Number(dailyPlan.dinner?.calories) || 0 },
                { name: t.snack, calories: Number(dailyPlan.snack?.calories) || 0 },
            ];
            total = mealCalories.reduce((acc, meal) => acc + meal.calories, 0);
        }

        if (mealCalories.length === 0) return null;

        return (
            <div className="calorie-stats">
                <h3>{t.calorieStats}</h3>
                {mealCalories.map((meal) => {
                    const percentage = total ? Math.round((meal.calories / total) * 100) : 0;
                    return (
                        <div key={meal.name} className="meal-calorie-item">
                            <span className="meal-name">{meal.name}:</span>
                            <span className="meal-calories">{meal.calories} {t.calories} ({percentage}%)</span>
                        </div>
                    );
                })}
                <div className="total-calories">
                    <strong>{t.totalCaloriesIntake} {total} {t.calories}</strong>
                </div>
            </div>
        );
    };

    const renderNutritionStats = () => {
        if (!nutritionStats) {
            return (
                <div className="nutrition-placeholder">
                    <h3>{t.nutritionInfo}</h3>
                    <p>{t.generateMealPlan}</p>
                </div>
            );
        }

        const getDietRecommendations = () => {
            if (!userData || !userData.dietType) {
                return [
                    t.hydrationTip,
                    t.mealTimingTip,
                    t.balancedDietTip
                ];
            }
            switch (userData.dietType) {
                case 'protein':
                case 'muscle_gain':
                    return [
                        t.proteinDietTip,
                        t.muscleGainTip,
                        t.complexCarbsTip
                    ];
                case 'weight_loss':
                    return [
                        t.eatSlowlyTip,
                        t.weightLossTip,
                        t.moreVegetablesTip
                    ];
                case 'gentle':
                    return [
                        t.gentleDietTip,
                        t.preferBoiledTip,
                        t.warmWaterTip
                    ];
                default:
                    return [
                        t.hydrationTip,
                        t.mealTimingTip,
                        t.balancedDietTip
                    ];
            }
        };

        const recommendations = getDietRecommendations();

        return (
            <div className="nutrition-stats">
                <h3>{t.totalMacros}</h3>
                <div className="nutrition-summary">
                    <div className="total-calories">
                        <h4>{t.totalCalories}</h4>
                        <p className="calories-value">{nutritionStats.calories} {t.calories}</p>
                    </div>
                    <div className="macros-list">
                        {nutritionStats.macros.map((macro) => (
                            <div key={macro.name} className="macro-item">
                                <div className="color-indicator" style={{ backgroundColor: macro.color }}></div>
                                <span className="macro-name">{macro.name}:</span>
                                <span className="macro-value">{macro.grams} г</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={nutritionStats.macros}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, grams }) => `${name}: ${grams}г`}
                            >
                                {nutritionStats.macros.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} г`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="calorie-distribution">
                    <h4>{t.calorieDistribution}</h4>
                    <div className="distribution-items">
                        {nutritionStats.macros.map((macro) => {
                            const calories = (macro.name === t.proteins || macro.name === t.carbs)
                                ? macro.grams * 4
                                : macro.grams * 9;
                            const percentage = nutritionStats.calories > 0
                                ? Math.round((calories / nutritionStats.calories) * 100)
                                : 0;
                            return (
                                <div key={`cal-${macro.name}`} className="distribution-item">
                                    <span className="macro-name">{macro.name}:</span>
                                    <span className="macro-calories">{calories} {t.calories} ({percentage}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="diet-recommendations">
                    <h4>{t.recommendations}</h4>
                    <ul>
                        {recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    const renderWeeklyPlan = () => {
        if (isLoadingWeekly) {
            return <div className="loading">{t.loading}</div>;
        }
        if (!weeklyPlan) {
            return <div className="no-data">{t.noMealData}</div>;
        }
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return (
            <div className="weekly-plan">
                <div className="day-selector">
                    {days.map(day => (
                        <button
                            key={day}
                            className={`day-button ${selectedDay === day ? 'selected' : ''}`}
                            onClick={() => handleDayClick(day)}
                        >
                            {t[day]}
                        </button>
                    ))}
                </div>
                {selectedDay && weeklyPlan[selectedDay] ? (
                    <div className="day-meals">
                        <div className="meal-item">
                            <div className="meal-header">
                                <h4>{t.breakfast}</h4>
                                <button className="edit-button" onClick={() => startEditingWeeklyMeal(selectedDay, 'breakfast')}>
                                    {t.edit}
                                </button>
                            </div>
                            <p>{weeklyPlan[selectedDay].breakfast || t.noMealData}</p>
                            <p className="meal-calories">{weeklyPlan[selectedDay].breakfast_calories} {t.calories}</p>
                        </div>
                        <div className="meal-item">
                            <div className="meal-header">
                                <h4>{t.lunch}</h4>
                                <button className="edit-button" onClick={() => startEditingWeeklyMeal(selectedDay, 'lunch')}>
                                    {t.edit}
                                </button>
                            </div>
                            <p>{weeklyPlan[selectedDay].lunch || t.noMealData}</p>
                            <p className="meal-calories">{weeklyPlan[selectedDay].lunch_calories} {t.calories}</p>
                        </div>
                        <div className="meal-item">
                            <div className="meal-header">
                                <h4>{t.dinner}</h4>
                                <button className="edit-button" onClick={() => startEditingWeeklyMeal(selectedDay, 'dinner')}>
                                    {t.edit}
                                </button>
                            </div>
                            <p>{weeklyPlan[selectedDay].dinner || t.noMealData}</p>
                            <p className="meal-calories">{weeklyPlan[selectedDay].dinner_calories} {t.calories}</p>
                        </div>
                    </div>
                ) : (
                    <div className="no-data">{t.noDataForDay}</div>
                )}
            </div>
        );
    };

    const renderDailyPlan = () => {
        if (isLoadingDaily) {
            return <div className="loading">{t.loading}</div>;
        }
        if (!dailyPlan) {
            return <div className="no-data">{t.noMealData}</div>;
        }
        return (
            <div className="daily-plan">
                <div className="meal-item">
                    <div className="meal-header">
                        <h4>{t.breakfast}</h4>
                        <button className="edit-button" onClick={() => startEditingDailyMeal('breakfast')}>
                            {t.edit}
                        </button>
                    </div>
                    <p>{dailyPlan.breakfast?.meal || t.noMealData}</p>
                    <p className="meal-calories">{dailyPlan.breakfast?.calories} {t.calories}</p>
                </div>
                <div className="meal-item">
                    <div className="meal-header">
                        <h4>{t.lunch}</h4>
                        <button className="edit-button" onClick={() => startEditingDailyMeal('lunch')}>
                            {t.edit}
                        </button>
                    </div>
                    <p>{dailyPlan.lunch?.meal || t.noMealData}</p>
                    <p className="meal-calories">{dailyPlan.lunch?.calories} {t.calories}</p>
                </div>
                <div className="meal-item">
                    <div className="meal-header">
                        <h4>{t.dinner}</h4>
                        <button className="edit-button" onClick={() => startEditingDailyMeal('dinner')}>
                            {t.edit}
                        </button>
                    </div>
                    <p>{dailyPlan.dinner?.meal || t.noMealData}</p>
                    <p className="meal-calories">{dailyPlan.dinner?.calories} {t.calories}</p>
                </div>
                <div className="meal-item">
                    <div className="meal-header">
                        <h4>{t.snack}</h4>
                        <button className="edit-button" onClick={() => startEditingDailyMeal('snack')}>
                            {t.edit}
                        </button>
                    </div>
                    <p>{dailyPlan.snack?.meal || t.noMealData}</p>
                    <p className="meal-calories">{dailyPlan.snack?.calories} {t.calories}</p>
                </div>
            </div>
        );
    };
    return (
        <div className={`meal-planning-container ${theme}`}>
            <div className="header">
                <button className="back-button" onClick={backHandler}>← {t.back}</button>
                <div className="title-container">
                    <h1 className="main-title">{t.mainTitle}</h1>
                    <p className="subtitle">{t.subtitle}</p>
                </div>
                <div className="controls">
                    <button onClick={() => setDarkMode(!darkMode)}>
                        {darkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="en">English</option>
                        <option value="uk">Українська</option>
                    </select>
                </div>
                <div className="spacer"></div>
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            {userData && (
                <div className="user-profile-summary">
                    <h3 className="summary-title">{t.profile}</h3>
                    <div className="summary-details">
                        <p>{t.weight}: {userData.weight} кг | {t.height}: {userData.height} см | {t.age}: {userData.age}</p>
                        <p>
                            {t.dietType}: {userData.dietType === 'basic' ? 'Базовая' :
                            userData.dietType === 'gentle' ? 'Щадящая' :
                                userData.dietType === 'protein' ? 'Высокобелковая' :
                                    userData.dietType === 'weight_loss' ? 'Для похудения' : t.notSpecified}
                        </p>
                        {userData.mealPreferences && <p>{t.mealPreferences}: {userData.mealPreferences}</p>}
                    </div>
                </div>
            )}

            <div className="content-layout">
                <div className="meal-plans-container">
                    <div className="plan-card">
                        <h2 className="plan-title">{t.weeklyPlan}</h2>
                        <button
                            className={`generate-button ${isLoadingWeekly ? 'loading' : ''}`}
                            onClick={handleGenerateWeeklyPlan}
                            disabled={isLoadingWeekly}
                        >
                            {isLoadingWeekly ? t.loading : t.generateWeeklyPlan}
                        </button>
                        {renderWeeklyPlan()}
                    </div>

                    <div className="plan-card">
                        <h2 className="plan-title">{t.dailyPlan}</h2>
                        <button
                            className={`generate-button ${isLoadingDaily ? 'loading' : ''}`}
                            onClick={handleGenerateDailyPlan}
                            disabled={isLoadingDaily}
                        >
                            {isLoadingDaily ? t.loading : t.generateDailyPlan}
                        </button>
                        {renderDailyPlan()}
                    </div>
                </div>

                <div className="nutrition-panel">
                    {renderCalorieStats()}
                    {renderNutritionStats()}
                </div>
            </div>

            {renderEditModal()}
        </div>
    );
}

export default MealPlanningApp;













