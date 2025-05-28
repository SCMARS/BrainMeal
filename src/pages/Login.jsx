import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import './styles/Login.css';
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from '../context/AuthContext';

const translations = {
    en: {
        title: "Login",
        email: "Email",
        password: "Password",
        login: "Sign In",
        register: "Don't have an account? Register",
        placeholderEmail: "Enter your email",
        placeholderPassword: "Enter your password",
        errorEmpty: "Please fill in all fields",
        errorGeneral: "Login error. Please try again."
    },
    ru: {
        title: "Вход",
        email: "Email",
        password: "Пароль",
        login: "Войти",
        register: "Нет аккаунта? Зарегистрироваться",
        placeholderEmail: "Введите email",
        placeholderPassword: "Введите пароль",
        errorEmpty: "Пожалуйста, заполните все поля",
        errorGeneral: "Ошибка входа. Попробуйте снова."
    }
};

function Login() {
    const location = useLocation();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Get theme from state or localStorage, default is dark
    const themeFromNav = location.state?.darkMode !== undefined ?
        (location.state.darkMode ? 'dark' : 'light') : null;
    const savedTheme = themeFromNav || localStorage.getItem('theme') || 'dark';
    const [theme, setTheme] = useState(savedTheme);

    // Get language from state or localStorage, default is English
    const langFromNav = location.state?.language || null;
    const savedLanguage = langFromNav || localStorage.getItem('language') || 'en';
    const [language, setLanguage] = useState(savedLanguage);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password) {
            setError(translations[language].errorEmpty);
            return;
        }

        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            console.error("Login error:", error.code, error.message);
            setError(translations[language].errorGeneral);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const t = translations[language] || translations.en;

    return (
        <div className={`login-container ${theme}`}>
            <div className="controls">
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === "dark" ? "☀️" : "🌙"}
                </button>
            </div>

            <div className="login-box">
                <motion.h1
                    className="form-title"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    {t.title}
                </motion.h1>

                {error && (
                    <motion.div
                        className="error-message"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {error}
                    </motion.div>
                )}

                <motion.form
                    onSubmit={handleSubmit}
                    className="register-form"
                >
                    <motion.div
                        className="input-group"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <label htmlFor="email">{t.email}</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t.placeholderEmail}
                        />
                    </motion.div>

                    <motion.div
                        className="input-group"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <label htmlFor="password">{t.password}</label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={t.placeholderPassword}
                        />
                    </motion.div>

                    <motion.button
                        className="login-button"
                        type="submit"
                        disabled={loading}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? <div className="spinner"></div> : t.login}
                    </motion.button>

                    <motion.div
                        className="auth-links"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <a href="/register">{t.register}</a>
                    </motion.div>
                </motion.form>
            </div>
        </div>
    );
}

export default Login;


