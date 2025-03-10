// App.jsx
import React from 'react';
import "./styles/Mealplan.css";
import { useNavigate } from "react-router-dom";

function MealPlanningApp() {
    const navigate = useNavigate();

    const backHandler = () => {
        navigate("profile");
    };

    return (
        <div className="meal-planning-container">
            {/* Header */}
            <div className="header">
                <button className="back-button" onClick={backHandler}>← Назад</button>
                <div className="title-container">
                    <h1 className="main-title">План</h1>
                    <p className="subtitle">На каждый день недели</p>
                </div>
                <div className="spacer"></div>
            </div>

            {/* Weekly Plan */}
            <div className="plan-card">
                <h2 className="plan-title">Недельный план</h2>

                <button className="generate-button">
                    Сгенерировать недельный план
                </button>

                <div className="week-grid">
                    {/* Monday */}
                    <div className="day-card">
                        <h3 className="day-title">Понедельник</h3>
                        <p className="meal-text">Завтрак: Овсянка, Овощ Салат, Хлеб</p>
                        <p className="meal-text">Обед: Курица</p>
                    </div>

                    {/* Tuesday */}
                    <div className="day-card">
                        <h3 className="day-title">Вторник</h3>
                        <p className="meal-text">Завтрак: Яйца, Овощ Суп, Хлеб</p>
                        <p className="meal-text">Обед: Курица</p>
                    </div>

                    {/* Wednesday */}
                    <div className="day-card">
                        <h3 className="day-title">Среда</h3>
                        <p className="meal-text">Завтрак: Йогурт, Овощ Паста, Хлеб</p>
                        <p className="meal-text">Обед: Суп</p>
                    </div>

                    {/* Thursday */}
                    <div className="day-card">
                        <h3 className="day-title">Четверг</h3>
                        <p className="meal-text">Завтрак: Фрукты, Овощ Салат, Хлеб</p>
                        <p className="meal-text">Обед: Рыба</p>
                    </div>

                    {/* Friday */}
                    <div className="day-card">
                        <h3 className="day-title">Пятница</h3>
                        <p className="meal-text">Завтрак: Каша, Овощ Суп, Хлеб</p>
                        <p className="meal-text">Обед: Курица</p>
                    </div>

                    {/* Saturday */}
                    <div className="day-card">
                        <h3 className="day-title">Суббота</h3>
                        <p className="meal-text">Завтрак: Омлет, Овощ Паста, Хлеб</p>
                        <p className="meal-text">Обед: Салат</p>
                    </div>

                    {/* Sunday */}
                    <div className="day-card">
                        <h3 className="day-title">Воскресенье</h3>
                        <p className="meal-text">Завтрак: Блинчики, Овощ Салат, Хлеб</p>
                        <p className="meal-text">Обед: Рыба</p>
                    </div>
                </div>
            </div>

            {/* Daily Plan */}
            <div className="plan-card">
                <h2 className="plan-title">Дневной план</h2>

                <button className="generate-button">
                    Сгенерировать дневной план
                </button>

                <div className="daily-meals">
                    <div className="meal-card">
                        <h3 className="meal-title">Завтрак</h3>
                        <p className="meal-text">Омлет с помидорами, 300 калорий</p>
                    </div>

                    <div className="meal-card">
                        <h3 className="meal-title">Обед</h3>
                        <p className="meal-text">Салат с курицей, 450 калорий</p>
                    </div>

                    <div className="meal-card">
                        <h3 className="meal-title">Ужин</h3>
                        <p className="meal-text">Жареная рыба с овощами, 500 калорий</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MealPlanningApp;