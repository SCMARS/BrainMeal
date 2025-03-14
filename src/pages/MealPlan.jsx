import React, { useState, useEffect } from 'react';
import "./styles/Mealplan.css";
import { useNavigate } from "react-router-dom";
import { generateMealPlan } from './servises/llmService.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function MealPlanningApp() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
    const [isLoadingDaily, setIsLoadingDaily] = useState(false);
    const [error, setError] = useState(null);
    const [nutritionStats, setNutritionStats] = useState(null);
    const [selectedDay, setSelectedDay] = useState('monday');

    // Состояния для редактирования приема пищи
    const [isEditing, setIsEditing] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [editingDay, setEditingDay] = useState(null);
    const [editMealName, setEditMealName] = useState('');
    const [editCalories, setEditCalories] = useState('');

    // Загрузка данных пользователя при монтировании компонента
    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                setUserData(JSON.parse(storedUserData));
            } catch (err) {
                console.error("Error parsing user data:", err);
                setError("Ошибка загрузки профиля. Вернитесь на страницу профиля.");
            }
        } else {
            setError("Данные пользователя не найдены. Пожалуйста, заполните профиль.");
        }
    }, []);

    // Обновление статистики при изменении плана или выбранного дня
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

    // Функция расчёта статистики питания (калории и макроэлементы)
    const calculateNutritionStats = (plan) => {
        let totalCalories = 0;
        if (plan.breakfast_calories !== undefined) {
            totalCalories =
                (plan.breakfast_calories || 0) +
                (plan.lunch_calories || 0) +
                (plan.dinner_calories || 0);
        } else if (plan.breakfast?.calories !== undefined) {
            totalCalories =
                (plan.breakfast?.calories || 0) +
                (plan.lunch?.calories || 0) +
                (plan.dinner?.calories || 0) +
                (plan.snack?.calories || 0);
        }

        // Распределение макроэлементов по типу диеты
        let proteinPercentage = 0.25;
        let fatPercentage = 0.3;
        let carbsPercentage = 0.45;

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

        const protein = Math.round(totalCalories * proteinPercentage / 4);
        const fat = Math.round(totalCalories * fatPercentage / 9);
        const carbs = Math.round(totalCalories * carbsPercentage / 4);

        setNutritionStats({
            calories: Math.round(totalCalories),
            macros: [
                { name: 'Белки', value: protein, grams: protein, color: '#8884d8' },
                { name: 'Жиры', value: fat, grams: fat, color: '#82ca9d' },
                { name: 'Углеводы', value: carbs, grams: carbs, color: '#ffc658' }
            ]
        });
    };

    // Генерация недельного плана питания
    const handleGenerateWeeklyPlan = async () => {
        if (!userData) {
            setError("Данные пользователя отсутствуют. Заполните профиль.");
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
        } catch (err) {
            setError("Не удалось сгенерировать недельный план. Попробуйте позже.");
            console.error(err);
        } finally {
            setIsLoadingWeekly(false);
        }
    };

    // Генерация дневного плана питания
    const handleGenerateDailyPlan = async () => {
        if (!userData) {
            setError("Данные пользователя отсутствуют. Заполните профиль.");
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
            setError("Не удалось сгенерировать дневной план. Попробуйте позже.");
            console.error(err);
        } finally {
            setIsLoadingDaily(false);
        }
    };

    // Выбор дня для недельного плана
    const handleDayClick = (day) => {
        setSelectedDay(day);
    };

    // Редактирование приема пищи в недельном плане
    const startEditingWeeklyMeal = (day, meal) => {
        setIsEditing(true);
        setEditingDay(day);
        setEditingMeal(meal);
        setEditMealName(weeklyPlan[day][meal]);
        setEditCalories(weeklyPlan[day][`${meal}_calories`]);
    };

    // Редактирование приема пищи в дневном плане
    const startEditingDailyMeal = (meal) => {
        setIsEditing(true);
        setEditingDay(null);
        setEditingMeal(meal);
        setEditMealName(dailyPlan[meal].meal);
        setEditCalories(dailyPlan[meal].calories);
    };

    // Сохранение изменений при редактировании приема пищи
    const saveEditedMeal = () => {
        if (editingDay) { // Недельный план
            const updatedWeeklyPlan = { ...weeklyPlan };
            updatedWeeklyPlan[editingDay] = { ...updatedWeeklyPlan[editingDay] };
            updatedWeeklyPlan[editingDay][editingMeal] = editMealName;
            updatedWeeklyPlan[editingDay][`${editingMeal}_calories`] = parseInt(editCalories) || 0;
            setWeeklyPlan(updatedWeeklyPlan);
            calculateNutritionStats(updatedWeeklyPlan[editingDay]);
        } else { // Дневной план
            const updatedDailyPlan = { ...dailyPlan };
            updatedDailyPlan[editingMeal] = { ...updatedDailyPlan[editingMeal] };
            updatedDailyPlan[editingMeal].meal = editMealName;
            updatedDailyPlan[editingMeal].calories = parseInt(editCalories) || 0;
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

    // Модальное окно редактирования приема пищи
    const renderEditModal = () => {
        if (!isEditing) return null;

        const mealDisplayNames = {
            'breakfast': 'Завтрак',
            'lunch': 'Обед',
            'dinner': 'Ужин',
            'snack': 'Перекус'
        };

        const dayDisplayNames = {
            'monday': 'Понедельник',
            'tuesday': 'Вторник',
            'wednesday': 'Среда',
            'thursday': 'Четверг',
            'friday': 'Пятница',
            'saturday': 'Суббота',
            'sunday': 'Воскресенье'
        };

        return (
            <div className="edit-modal-overlay">
                <div className="edit-modal">
                    <h3>Редактирование приема пищи</h3>
                    {editingDay && <p>День: {dayDisplayNames[editingDay]}</p>}
                    <p>Прием пищи: {mealDisplayNames[editingMeal]}</p>
                    <div className="edit-field">
                        <label>Блюдо:</label>
                        <textarea
                            value={editMealName}
                            onChange={(e) => setEditMealName(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="edit-field">
                        <label>Калории:</label>
                        <input
                            type="number"
                            value={editCalories}
                            onChange={(e) => setEditCalories(e.target.value)}
                            min="0"
                        />
                    </div>
                    <div className="edit-buttons">
                        <button onClick={saveEditedMeal} className="save-button">Сохранить</button>
                        <button onClick={cancelEditing} className="cancel-button">Отмена</button>
                    </div>
                </div>
            </div>
        );
    };

    // Отображение недельного плана
    const renderWeeklyPlan = () => {
        if (!weeklyPlan) {
            return (
                <div className="week-grid">
                    {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map((day) => (
                        <div key={day} className="day-card">
                            <h3 className="day-title">{day}</h3>
                            <p className="meal-text">Сгенерируйте план, чтобы увидеть меню</p>
                        </div>
                    ))}
                </div>
            );
        }

        const days = {
            'monday': 'Понедельник',
            'tuesday': 'Вторник',
            'wednesday': 'Среда',
            'thursday': 'Четверг',
            'friday': 'Пятница',
            'saturday': 'Суббота',
            'sunday': 'Воскресенье'
        };

        return (
            <div className="week-grid">
                {Object.entries(days).map(([engDay, rusDay]) => (
                    <div
                        key={engDay}
                        className={`day-card ${selectedDay === engDay ? 'selected-day' : ''}`}
                        onClick={() => handleDayClick(engDay)}
                    >
                        <h3 className="day-title">{rusDay}</h3>
                        {weeklyPlan[engDay] ? (
                            <>
                                <div className="meal-item">
                                    <p className="meal-text"><strong>Завтрак:</strong> {weeklyPlan[engDay].breakfast}</p>
                                    <p className="meal-text small-text">{weeklyPlan[engDay].breakfast_calories || 0} ккал</p>
                                    <button
                                        className="edit-meal-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startEditingWeeklyMeal(engDay, 'breakfast');
                                        }}
                                    >
                                        Изменить
                                    </button>
                                </div>
                                <div className="meal-item">
                                    <p className="meal-text"><strong>Обед:</strong> {weeklyPlan[engDay].lunch}</p>
                                    <p className="meal-text small-text">{weeklyPlan[engDay].lunch_calories || 0} ккал</p>
                                    <button
                                        className="edit-meal-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startEditingWeeklyMeal(engDay, 'lunch');
                                        }}
                                    >
                                        Изменить
                                    </button>
                                </div>
                                <div className="meal-item">
                                    <p className="meal-text"><strong>Ужин:</strong> {weeklyPlan[engDay].dinner}</p>
                                    <p className="meal-text small-text">{weeklyPlan[engDay].dinner_calories || 0} ккал</p>
                                    <button
                                        className="edit-meal-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startEditingWeeklyMeal(engDay, 'dinner');
                                        }}
                                    >
                                        Изменить
                                    </button>
                                </div>
                                <p className="total-calories-text">
                                    Всего: {(weeklyPlan[engDay].breakfast_calories || 0) +
                                    (weeklyPlan[engDay].lunch_calories || 0) +
                                    (weeklyPlan[engDay].dinner_calories || 0)} ккал
                                </p>
                            </>
                        ) : (
                            <p className="meal-text">Нет данных для этого дня</p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // Отображение дневного плана
    const renderDailyPlan = () => {
        if (!dailyPlan) {
            return (
                <div className="daily-meals">
                    <div className="meal-card">
                        <h3 className="meal-title">Завтрак</h3>
                        <p className="meal-text">Сгенерируйте план, чтобы увидеть меню</p>
                    </div>
                    <div className="meal-card">
                        <h3 className="meal-title">Обед</h3>
                        <p className="meal-text">Сгенерируйте план, чтобы увидеть меню</p>
                    </div>
                    <div className="meal-card">
                        <h3 className="meal-title">Ужин</h3>
                        <p className="meal-text">Сгенерируйте план, чтобы увидеть меню</p>
                    </div>
                </div>
            );
        }

        const totalCalories = (dailyPlan.breakfast?.calories || 0) +
            (dailyPlan.lunch?.calories || 0) +
            (dailyPlan.dinner?.calories || 0) +
            (dailyPlan.snack?.calories || 0);

        return (
            <div className="daily-meals">
                <div className="meal-card">
                    <h3 className="meal-title">Завтрак</h3>
                    <p className="meal-text">{dailyPlan.breakfast?.meal || "Не указано"}</p>
                    <p className="calories-text">{dailyPlan.breakfast?.calories || 0} ккал</p>
                    <button className="edit-meal-button" onClick={() => startEditingDailyMeal('breakfast')}>Изменить</button>
                </div>
                <div className="meal-card">
                    <h3 className="meal-title">Обед</h3>
                    <p className="meal-text">{dailyPlan.lunch?.meal || "Не указано"}</p>
                    <p className="calories-text">{dailyPlan.lunch?.calories || 0} ккал</p>
                    <button className="edit-meal-button" onClick={() => startEditingDailyMeal('lunch')}>Изменить</button>
                </div>
                <div className="meal-card">
                    <h3 className="meal-title">Ужин</h3>
                    <p className="meal-text">{dailyPlan.dinner?.meal || "Не указано"}</p>
                    <p className="calories-text">{dailyPlan.dinner?.calories || 0} ккал</p>
                    <button className="edit-meal-button" onClick={() => startEditingDailyMeal('dinner')}>Изменить</button>
                </div>
                {dailyPlan.snack && (
                    <div className="meal-card">
                        <h3 className="meal-title">Перекус</h3>
                        <p className="meal-text">{dailyPlan.snack.meal}</p>
                        <p className="calories-text">{dailyPlan.snack.calories} ккал</p>
                        <button className="edit-meal-button" onClick={() => startEditingDailyMeal('snack')}>Изменить</button>
                    </div>
                )}
                <div className="total-calories-card">
                    <p className="total-calories-text">Всего калорий: {totalCalories} ккал</p>
                </div>
            </div>
        );
    };

    // Отображение статистики калорий по приёмам пищи
    const renderCalorieStats = () => {
        let mealCalories = [];
        if (dailyPlan && dailyPlan.breakfast?.calories !== undefined) {
            mealCalories = [
                { name: "Завтрак", calories: dailyPlan.breakfast.calories },
                { name: "Обед", calories: dailyPlan.lunch.calories },
                { name: "Ужин", calories: dailyPlan.dinner.calories }
            ];
            if (dailyPlan.snack) {
                mealCalories.push({ name: "Перекус", calories: dailyPlan.snack.calories });
            }
        } else if (weeklyPlan && selectedDay && weeklyPlan[selectedDay]) {
            mealCalories = [
                { name: "Завтрак", calories: weeklyPlan[selectedDay].breakfast_calories },
                { name: "Обед", calories: weeklyPlan[selectedDay].lunch_calories },
                { name: "Ужин", calories: weeklyPlan[selectedDay].dinner_calories }
            ];
        }
        const total = mealCalories.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        return (
            <div className="calorie-stats">
                <h3>Калорийность по приемам пищи</h3>
                {mealCalories.map((meal) => {
                    const percentage = total ? Math.round((meal.calories / total) * 100) : 0;
                    return (
                        <div key={meal.name} className="meal-calorie-item">
                            <span className="meal-name">{meal.name}:</span>
                            <span className="meal-calories">{meal.calories} ккал ({percentage}%)</span>
                        </div>
                    );
                })}
                <div className="total-calories">
                    <strong>Всего: {total} ккал</strong>
                </div>
            </div>
        );
    };

    // Отображение диаграммы и рекомендаций по макроэлементам
    const renderNutritionStats = () => {
        if (!nutritionStats) {
            return (
                <div className="nutrition-placeholder">
                    <h3>Информация о питательных веществах</h3>
                    <p>Сгенерируйте план питания, чтобы увидеть данные.</p>
                </div>
            );
        }

        const getDietRecommendations = () => {
            if (!userData || !userData.dietType) {
                return [
                    'Пейте достаточно воды в течение дня',
                    'Разделите приемы пищи на 3-4 часа',
                    'Включайте в рацион разнообразные продукты'
                ];
            }
            switch (userData.dietType) {
                case 'protein':
                case 'muscle_gain':
                    return [
                        'Потребляйте больше белковой пищи (яйца, куриная грудка, творог)',
                        'Увеличьте потребление воды до 2-3 литров в день',
                        'Включите больше цельнозерновых продуктов для энергии'
                    ];
                case 'weight_loss':
                    return [
                        'Старайтесь есть медленно, тщательно пережевывая пищу',
                        'Избегайте сахара и простых углеводов',
                        'Ешьте больше овощей и белковой пищи'
                    ];
                case 'gentle':
                    return [
                        'Избегайте острых и жирных блюд',
                        'Предпочитайте вареную и тушеную пищу',
                        'Пейте больше теплой воды между приемами пищи'
                    ];
                default:
                    return [
                        'Пейте достаточно воды в течение дня',
                        'Разделите приемы пищи на 3-4 часа',
                        'Включайте в рацион разнообразные продукты'
                    ];
            }
        };

        const recommendations = getDietRecommendations();

        return (
            <div className="nutrition-stats">
                <h3>Питательные вещества</h3>
                <div className="nutrition-summary">
                    <div className="total-calories">
                        <h4>Всего калорий</h4>
                        <p className="calories-value">{nutritionStats.calories} ккал</p>
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
                    <h4>Распределение калорий</h4>
                    <div className="distribution-items">
                        {nutritionStats.macros.map((macro) => {
                            const calories = (macro.name === 'Белки' || macro.name === 'Углеводы')
                                ? macro.grams * 4
                                : macro.grams * 9;
                            const percentage = Math.round((calories / nutritionStats.calories) * 100);
                            return (
                                <div key={`cal-${macro.name}`} className="distribution-item">
                                    <span className="macro-name">{macro.name}:</span>
                                    <span className="macro-calories">{calories} ккал ({percentage}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="diet-recommendations">
                    <h4>Рекомендации</h4>
                    <ul>
                        {recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div className="meal-planning-container">
            <div className="header">
                <button className="back-button" onClick={backHandler}>← Назад</button>
                <div className="title-container">
                    <h1 className="main-title">План питания</h1>
                    <p className="subtitle">На каждый день недели</p>
                </div>
                <div className="spacer"></div>
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            {userData && (
                <div className="user-profile-summary">
                    <h3 className="summary-title">Ваш профиль</h3>
                    <div className="summary-details">
                        <p>Вес: {userData.weight} кг | Рост: {userData.height} см | Возраст: {userData.age} лет</p>
                        <p>
                            Тип диеты: {userData.dietType === 'basic' ? 'Базовая' :
                            userData.dietType === 'gentle' ? 'Щадящая' :
                                userData.dietType === 'protein' ? 'Высокобелковая' :
                                    userData.dietType === 'weight_loss' ? 'Для похудения' : 'Не указан'}
                        </p>
                        {userData.mealPreferences && <p>Предпочтения: {userData.mealPreferences}</p>}
                    </div>
                </div>
            )}

            <div className="content-layout">
                <div className="meal-plans-container">
                    <div className="plan-card">
                        <h2 className="plan-title">Недельный план</h2>
                        <button
                            className={`generate-button ${isLoadingWeekly ? 'loading' : ''}`}
                            onClick={handleGenerateWeeklyPlan}
                            disabled={isLoadingWeekly}
                        >
                            {isLoadingWeekly ? 'Генерация...' : 'Сгенерировать недельный план'}
                        </button>
                        {renderWeeklyPlan()}
                    </div>

                    <div className="plan-card">
                        <h2 className="plan-title">Дневной план</h2>
                        <button
                            className={`generate-button ${isLoadingDaily ? 'loading' : ''}`}
                            onClick={handleGenerateDailyPlan}
                            disabled={isLoadingDaily}
                        >
                            {isLoadingDaily ? 'Генерация...' : 'Сгенерировать дневной план'}
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




