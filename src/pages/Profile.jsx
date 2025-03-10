import React, { useState } from 'react';
import './styles/Profile.css';
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const logout = () => {
        navigate('/login');
    };

    // Состояние для хранения данных пользователя
    const [userData, setUserData] = useState({
        weight: '',
        age: '',
        gender: '',
        height: '',
        dietType: 'basic', // По умолчанию
        mealPreferences: '',
        breakfast: '',
        lunch: '',
        dinner: '',
        snacks: ''
    });

    // Обработчик изменения данных
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Обработчик изменения типа диеты
    const handleDietChange = (diet) => {
        setUserData(prev => ({
            ...prev,
            dietType: diet
        }));
    };

    const validateData = () => {
        const { weight, age, height, gender } = userData;
        if (!weight || !age || !height || !gender) {
            return "Пожалуйста, заполните все обязательные поля: вес, возраст, рост и пол.";
        }
        if (weight < 35 || age < 15) {
            return "Пожалуйста, заполните все обязательные поля правильно.";
        }
        return "";
    };


    // Обработчик генерации плана питания
    const handleGenerateMealPlan = () => {
        const validationError = validateData();
        if (validationError) {
            setError(validationError);
            return;
        }
        // Сохраняем данные пользователя в localStorage для использования на странице MealPlan
        localStorage.setItem('userData', JSON.stringify(userData));
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
                <button className="brainmeal-logout-btn" onClick={logout}>Logout</button>
            </header>

            {/* Основной контент */}
            <div className="brainmeal-content">
                {error && <p className="error-message">{error}</p>}
                {/* Раздел профиля пользователя */}
                <section className="brainmeal-section">
                    <h2 className="brainmeal-section-title">User Profile</h2>
                    <div className="brainmeal-form-row brainmeal-form-row-3">
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                className="brainmeal-input"
                                placeholder="Enter weight"
                                value={userData.weight}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Age</label>
                            <input
                                type="number"
                                name="age"
                                className="brainmeal-input"
                                placeholder="Enter age"
                                value={userData.age}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Biological Gender</label>
                            <select
                                name="gender"
                                className="brainmeal-input"
                                value={userData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="brainmeal-form-row brainmeal-form-row-2">
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Height (cm)</label>
                            <input
                                type="number"
                                name="height"
                                className="brainmeal-input"
                                placeholder="Enter height"
                                value={userData.height}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Meal Preferences/Restrictions</label>
                            <input
                                type="text"
                                name="mealPreferences"
                                className="brainmeal-input"
                                placeholder="E.g., vegetarian, no nuts, etc."
                                value={userData.mealPreferences}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </section>

                {/* Раздел отслеживания приемов пищи */}
                <section className="brainmeal-section">
                    <h2 className="brainmeal-section-title">Meal Tracking</h2>
                    <div className="brainmeal-form-row brainmeal-form-row-2">
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Breakfast</label>
                            <input
                                type="text"
                                name="breakfast"
                                className="brainmeal-input"
                                placeholder="Log breakfast details"
                                value={userData.breakfast}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Lunch</label>
                            <input
                                type="text"
                                name="lunch"
                                className="brainmeal-input"
                                placeholder="Log lunch details"
                                value={userData.lunch}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="brainmeal-form-row brainmeal-form-row-2">
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Dinner</label>
                            <input
                                type="text"
                                name="dinner"
                                className="brainmeal-input"
                                placeholder="Log dinner details"
                                value={userData.dinner}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="brainmeal-form-field">
                            <label className="brainmeal-label">Snacks</label>
                            <input
                                type="text"
                                name="snacks"
                                className="brainmeal-input"
                                placeholder="Log snack details"
                                value={userData.snacks}
                                onChange={handleChange}
                            />
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
                                checked={userData.dietType === 'basic'}
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
                                checked={userData.dietType === 'gentle'}
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
                                checked={userData.dietType === 'protein'}
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

export default Profile;






