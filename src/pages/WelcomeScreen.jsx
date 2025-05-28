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

    // Ensure we have a valid language
    const currentLanguage = language || "en";
    const t = translations[currentLanguage] || translations.en;

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('language', currentLanguage);
    }, [darkMode, currentLanguage]);

    const handleStart = () => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('language', currentLanguage);

        navigate('/login', {
            state: {
                darkMode,
                language: currentLanguage
            }
        });
    };

    const toggleTheme = () => {
        setDarkMode(prevMode => !prevMode);
    };

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