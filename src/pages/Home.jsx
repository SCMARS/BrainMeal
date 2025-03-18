import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/WelcomeScreen.css";

const translations = {
    en: {
        title: "Welcome to BrainMeal",
        getStarted: "Get Started",
        downloadGoogle: "Download Now from Google Play",
        downloadApple: "Download Now from App Store",
        pricing: "Pricing",
        home: "Home",
        contact: "Contact",
        language: "Language:",
        theme: "Theme:"
    },
    uk: {
        title: "Ласкаво просимо до BrainMeal",
        getStarted: "Почати",
        downloadGoogle: "Завантажити з Google Play",
        downloadApple: "Завантажити з App Store",
        pricing: "Ціни",
        home: "Головна",
        contact: "Контакти",
        language: "Мова:",
        theme: "Тема:"
    }
};

const LinkButton = ({ to, children, className }) => {
    const handleClick = () => {
        window.open(to, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className={className} onClick={handleClick}>
            {children}
        </button>
    );
};

const WelcomeScreen = () => {
    const [loading, setLoading] = useState(true);


    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');

    const [darkMode, setDarkMode] = useState(savedTheme ? savedTheme === 'dark' : true);
    const [language, setLanguage] = useState(savedLanguage || "en");
    const navigate = useNavigate();

    // Выбираем переводы в зависимости от текущего языка
    const t = translations[language];

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Сохраняем настройки при их изменении
    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('language', language);
    }, [darkMode, language]);

    // Функция перехода на страницу логина с передачей настроек
    const handleStart = () => {
        // Сохраняем настройки в localStorage
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('language', language);


        navigate('/login', {
            state: {
                darkMode,
                language
            }
        });
    };


    const toggleTheme = () => {
        setDarkMode(prevMode => !prevMode);
    };

    // Переключение языка
    const toggleLanguage = () => {
        setLanguage(prevLang => (prevLang === "en" ? "uk" : "en"));
    };

    if (loading) {
        return (
            <div className="preloader">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className={`welcome-container ${darkMode ? "dark" : "light"}`}>
            {/* Header/Navigation */}
            <header className="header">
                <div className="logo">
                    <span className="logo-icon">🍴</span>
                    <span className="logo-text">BrainMeal</span>
                </div>

                <div className="controls">
                    <div className="language-control">
                        <span>{t.language}</span>
                        <button
                            className="language-dropdown"
                            onClick={toggleLanguage}
                        >
                            {language === "en" ? "English" : "Українська"}
                        </button>
                    </div>
                    <div className="theme-control">
                        <span>{t.theme}</span>
                        <label className="switch">
                            <input type="checkbox" checked={darkMode} onChange={toggleTheme} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="welcome-content">
                <h1 className="welcome-title">{t.title}</h1>

                <div className="cta-container">
                    <button className="get-started-button" onClick={handleStart}>
                        {t.getStarted}
                    </button>
                </div>

                <div className="download-buttons">
                    <LinkButton
                        to="https://play.google.com/store"
                        className="download-button google-play"
                    >
                        {t.downloadGoogle}
                    </LinkButton>

                    <LinkButton
                        to="https://www.apple.com/app-store/"
                        className="download-button app-store"
                    >
                        {t.downloadApple}
                    </LinkButton>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;

