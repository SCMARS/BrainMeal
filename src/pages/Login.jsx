import React, { useState, useEffect } from 'react';
import './styles/Login.css';
import { useNavigate, useLocation } from "react-router-dom";

const translations = {
    en: {
        loginTitle: "Login",
        emailLabel: "Email",
        emailPlaceholder: "Enter your email",
        passwordLabel: "Password",
        passwordPlaceholder: "Enter your password",
        loginButton: "Login",
        forgotPassword: "Forgot Password?",
        register: "Register"
    },
    uk: {
        loginTitle: "Вхід",
        emailLabel: "Пошта",
        emailPlaceholder: "Введіть вашу пошту",
        passwordLabel: "Пароль",
        passwordPlaceholder: "Введіть ваш пароль",
        loginButton: "Увійти",
        forgotPassword: "Забули пароль?",
        register: "Реєстрація"
    }
};

const Login = () => {
    const location = useLocation();

    // Получаем тему из state или localStorage, по умолчанию dark
    const themeFromNav = location.state?.darkMode !== undefined ?
        (location.state.darkMode ? 'dark' : 'light') : null;
    const savedTheme = themeFromNav || localStorage.getItem('theme') || 'dark';
    const [theme, setTheme] = useState(savedTheme);

    // Получаем язык из state или localStorage, по умолчанию английский
    const langFromNav = location.state?.language || null;
    const savedLanguage = langFromNav || localStorage.getItem('language') || 'en';
    const [language, setLanguage] = useState(savedLanguage);

    // Выбираем переводы в зависимости от языка
    const t = translations[language];

    const navigate = useNavigate();
    const handleProfile = () => {
        navigate("/profile");
    };
    const handelregister = () => {
        navigate("/register");
    }

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
        localStorage.setItem('language', language);
    }, [theme, language]);


    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className={`login-container ${theme}`}>
            <div className="login-box">
                <h1 className="form-title">{t.loginTitle}</h1>
                <div className="input-group">
                    <label>{t.emailLabel}</label>
                    <input type="text" placeholder={t.emailPlaceholder} />
                </div>
                <div className="input-group">
                    <label>{t.passwordLabel}</label>
                    <input type="password" placeholder={t.passwordPlaceholder} />
                </div>
                <button className="login-button" onClick={handleProfile}>
                    {t.loginButton}
                </button>
                <div className="auth-links">
                    <a href="#">{t.forgotPassword}</a> | <a href="#"onClick={handelregister}> {t.register}</a>
                </div>
            </div>

            {/* Кнопка переключения темы */}
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'dark' ? '🌞' : '🌙'}
            </button>

        </div>
    );
};

export default Login;







