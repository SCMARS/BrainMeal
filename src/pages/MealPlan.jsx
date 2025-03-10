// src/components/MealPlanningApp.js
import React, { useState, useEffect } from 'react';
import "./styles/Mealplan.css";
import { useNavigate } from "react-router-dom";
import { generateMealPlan } from './servises/llmService.js';

function MealPlanningApp() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
    const [isLoadingDaily, setIsLoadingDaily] = useState(false);
    const [error, setError] = useState(null);

    // Загрузка данных пользователя при монтировании компонента
    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                setUserData(JSON.parse(storedUserData));
            } catch (err) {
                console.error("Error parsing user data:", err);
                setError("Error loading user profile. Please return to profile page.");
            }
        } else {
            setError("User data not found. Please complete your profile first.");
        }
    }, []);

    const backHandler = () => {
        navigate("/profile");
    };

    // Генерация недельного плана питания
    const handleGenerateWeeklyPlan = async () => {
        if (!userData) {
            setError("User data is missing. Please complete your profile first.");
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
        } catch (err) {
            setError("Failed to generate weekly meal plan. Please try again later.");
            console.error(err);
        } finally {
            setIsLoadingWeekly(false);
        }
    };

    // Генерация дневного плана питания
    const handleGenerateDailyPlan = async () => {
        if (!userData) {
            setError("User data is missing. Please complete your profile first.");
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
        } catch (err) {
            setError("Failed to generate daily meal plan. Please try again later.");
            console.error(err);
        } finally {
            setIsLoadingDaily(false);
        }
    };

    // Отображение дней недели для недельного плана
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

        // Map English weekday keys to Russian names
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
                    <div key={engDay} className="day-card">
                        <h3 className="day-title">{rusDay}</h3>
                        {weeklyPlan[engDay] ? (
                            <>
                                <p className="meal-text"><strong>Завтрак:</strong> {weeklyPlan[engDay].breakfast}</p>
                                <p className="meal-text"><strong>Обед:</strong> {weeklyPlan[engDay].lunch}</p>
                                <p className="meal-text"><strong>Ужин:</strong> {weeklyPlan[engDay].dinner}</p>
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

        return (
            <div className="daily-meals">
                <div className="meal-card">
                    <h3 className="meal-title">Завтрак</h3>
                    <p className="meal-text">{dailyPlan.breakfast?.meal || "Не указано"}</p>
                    <p className="calories-text">{dailyPlan.breakfast?.calories || 0} калорий</p>
                </div>
                <div className="meal-card">
                    <h3 className="meal-title">Обед</h3>
                    <p className="meal-text">{dailyPlan.lunch?.meal || "Не указано"}</p>
                    <p className="calories-text">{dailyPlan.lunch?.calories || 0} калорий</p>
                </div>
                <div className="meal-card">
                    <h3 className="meal-title">Ужин</h3>
                    <p className="meal-text">{dailyPlan.dinner?.meal || "Не указано"}</p>
                    <p className="calories-text">{dailyPlan.dinner?.calories || 0} калорий</p>
                </div>
                {dailyPlan.snack && (
                    <div className="meal-card">
                        <h3 className="meal-title">Перекус</h3>
                        <p className="meal-text">{dailyPlan.snack.meal}</p>
                        <p className="calories-text">{dailyPlan.snack.calories} калорий</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="meal-planning-container">
            {/* Header */}
            <div className="header">
                <button className="back-button" onClick={backHandler}>← Назад</button>
                <div className="title-container">
                    <h1 className="main-title">План питания</h1>
                    <p className="subtitle">На каждый день недели</p>
                </div>
                <div className="spacer"></div>
            </div>

            {/* Error message */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* User Profile Summary */}
            {userData && (
                <div className="user-profile-summary">
                    <h3 className="summary-title">Ваш профиль</h3>
                    <div className="summary-details">
                        <p>Вес: {userData.weight} кг | Рост: {userData.height} см | Возраст: {userData.age} лет</p>
                        <p>Тип диеты: {userData.dietType === 'basic' ? 'Базовая' :
                            userData.dietType === 'gentle' ? 'Щадящая' :
                                userData.dietType === 'protein' ? 'Высокобелковая' : 'Не указан'}</p>
                        {userData.mealPreferences && <p>Предпочтения: {userData.mealPreferences}</p>}
                    </div>
                </div>
            )}

            {/* Weekly Plan */}
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

            {/* Daily Plan */}
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
    );
}

export default MealPlanningApp;