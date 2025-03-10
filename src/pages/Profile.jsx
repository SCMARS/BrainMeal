import React, { useState } from 'react';
import './styles/Profile.css';
import {useNavigate} from "react-router-dom";

const BrainMeal = () => {
    const [selectedDiet, setSelectedDiet] = useState(null);

    const handleDietChange = (diet) => {
        setSelectedDiet(diet);
    };

    const navigate = useNavigate();

    const handleGenerateMealPlan = () => {
        navigate("/MealPlan");

    };

    return (
        <div className="brainmeal-container">
            {/* Шапка приложения */}
            <header className="brainmeal-header">
                <div className="brainmeal-logo">
                    <div className="brainmeal-logo-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="brainmeal-title">BrainMeal</h1>
                </div>
                <button className="brainmeal-logout-btn">Logout</button>
            </header>

            {/* Основной контент */}
            <div className="brainmeal-content">
                {/* Раздел профиля пользователя */}
                <section className="brainmeal-section">
                    <h2 className="brainmeal-section-title">User Profile</h2>
                    <div className="brainmeal-form-row brainmeal-form-row-3">
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Weight</label>
                            <input type="text" className="brainmeal-input" placeholder="Enter weight" />
                        </div>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Age</label>
                            <input type="text" className="brainmeal-input" placeholder="Enter age" />
                        </div>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Biological Gender</label>
                            <input type="text" className="brainmeal-input" placeholder="Enter gender" />
                        </div>
                    </div>
                    <div className="brainmeal-form-row brainmeal-form-row-2">
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Height</label>
                            <input type="text" className="brainmeal-input" placeholder="Enter height" />
                        </div>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Weight</label>
                            <input type="text" className="brainmeal-input" placeholder="Enter weight" />
                        </div>
                    </div>
                </section>

                {/* Раздел отслеживания приемов пищи */}
                <section className="brainmeal-section">
                    <h2 className="brainmeal-section-title">Meal Tracking</h2>
                    <div className="brainmeal-form-row brainmeal-form-row-2">
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Breakfast</label>
                            <input type="text" className="brainmeal-input" placeholder="Log breakfast details" />
                        </div>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Lunch</label>
                            <input type="text" className="brainmeal-input" placeholder="Log lunch details" />
                        </div>
                    </div>
                    <div className="brainmeal-form-row brainmeal-form-row-2">
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Dinner</label>
                            <input type="text" className="brainmeal-input" placeholder="Log dinner details" />
                        </div>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Snacks</label>
                            <input type="text" className="brainmeal-input" placeholder="Log snack details" />
                        </div>
                    </div>
                </section>

                {/* Раздел выбора диеты */}
                <section className="brainmeal-section">
                    <h2 className="brainmeal-section-title">Diet Selection</h2>
                    <div className="brainmeal-diet-options">
                        <div className="brainmeal-diet-option">
                            <input
                                type="radio"
                                id="basic-diet"
                                name="diet"
                                className="brainmeal-radio"
                                checked={selectedDiet === 'basic'}
                                onChange={() => handleDietChange('basic')}
                            />
                            <label htmlFor="basic-diet" className="brainmeal-radio-label">
                                Basic Diet - A well-balanced diet suitable for most people.
                            </label>
                        </div>
                        <div className="brainmeal-diet-option">
                            <input
                                type="radio"
                                id="gentle-diet"
                                name="diet"
                                className="brainmeal-radio"
                                checked={selectedDiet === 'gentle'}
                                onChange={() => handleDietChange('gentle')}
                            />
                            <label htmlFor="gentle-diet" className="brainmeal-radio-label">
                                Gentle Diet - A diet focusing on easy-to-digest foods.
                            </label>
                        </div>
                        <div className="brainmeal-diet-option">
                            <input
                                type="radio"
                                id="protein-diet"
                                name="diet"
                                className="brainmeal-radio"
                                checked={selectedDiet === 'protein'}
                                onChange={() => handleDietChange('protein')}
                            />
                            <label htmlFor="protein-diet" className="brainmeal-radio-label">
                                High Protein Diet - A diet rich in protein for muscle growth.
                            </label>
                        </div>
                    </div>
                </section>

                {/* Кнопка генерации плана питания */}
                <button
                    className="brainmeal-generate-btn"
                    onClick={handleGenerateMealPlan}
                >
                    Generate Meal Plan
                </button>
            </div>
        </div>
    );
};

export default BrainMeal;





