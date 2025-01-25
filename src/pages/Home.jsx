import  { useState, useEffect } from "react";
import "./styles/WelcomeScreen.css";
import roundImg from "./round.jpg";
import { useNavigate } from "react-router-dom";


const LinkButton = ({ to, children }) => {
    const handleClick = () => {
        window.open(to, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className="download-button" onClick={handleClick}>
            {children}
        </button>
    );
};

const WelcomeScreen = () => {
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleStart = () => {
        navigate('/login');
    };

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    return (
        loading ? (
            <div className="preloader">
                <div className="spinner"></div>
            </div>
        ) : (
            <div className={`welcome-container ${darkMode ? "dark" : "light"}`}>
                <button className="theme-toggle-button" onClick={toggleTheme}>
                    {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                </button>
                <div className="welcome-content">
                    <h1 className="welcome-title">Welcome to BrainMeal</h1>
                    <p className="welcome-description">
                        Discover personalized meal plans powered by AI. Simple, efficient, and
                        perfectly tailored to your dietary needs.
                    </p>
                    <button className="start-button" onClick={handleStart}>Get Started</button>
                    <div className="button-group">
                        <LinkButton to="https://play.google.com/store">
                            Download on Google Play
                        </LinkButton>
                        <LinkButton to="https://www.apple.com/app-store/">
                            Download on the App Store
                        </LinkButton>
                    </div>
                    <div className="image-container">
                        <img src={roundImg} alt="Illustration" />
                    </div>
                </div>
            </div>
        )
    );
};

export default WelcomeScreen;
