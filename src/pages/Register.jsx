import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import "./styles/Register.css";

function Register() {
    const location = useLocation();

    // Получаем тему аналогично Login.jsx
    const themeFromNav = location.state?.darkMode !== undefined ?
        (location.state.darkMode ? 'dark' : 'light') : null;
    const savedTheme = themeFromNav || localStorage.getItem('theme') || 'dark';
    const [theme, setTheme] = useState(savedTheme);

    // Получаем язык аналогично Login.jsx
    const langFromNav = location.state?.language || null;
    const savedLanguage = langFromNav || localStorage.getItem('language') || 'en';
    const [language, setLanguage] = useState(savedLanguage);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // Переводы для поддерживаемых языков
    const translations = {
        uk: {
            title: "Реєстрація",
            username: "Ім'я користувача",
            email: "Email",
            password: "Пароль",
            confirmPassword: "Підтвердження пароля",
            terms: "Я згоден з умовами використання",
            login: "Вже є аккаунт? Увійти",
            register: "Завершити реєстрацію",
            errorEmpty: "Будь ласка, заповніть всі поля",
            errorMismatch: "Паролі не співпадають",
            placeholderUsername: "Введіть ім'я користувача",
            placeholderEmail: "Введіть email",
            placeholderPassword: "Введіть пароль",
            placeholderConfirmPassword: "Підтвердіть пароль"
        },
        en: {
            title: "Registration",
            username: "Username",
            email: "Email",
            password: "Password",
            confirmPassword: "Confirm Password",
            terms: "I agree to the terms of use",
            login: "Already have an account? Log in",
            register: "Complete Registration",
            errorEmpty: "Please fill in all fields",
            errorMismatch: "Passwords do not match",
            placeholderUsername: "Enter username",
            placeholderEmail: "Enter email",
            placeholderPassword: "Enter password",
            placeholderConfirmPassword: "Confirm password"
        }
    };


    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    // Проверка совпадения паролей
    const passwordsMatch = formData.password === formData.confirmPassword || formData.confirmPassword === "";

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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Валидация
        if (!formData.username || !formData.password || !formData.confirmPassword || !formData.email) {
            setError(translations[language].errorEmpty);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError(translations[language].errorMismatch);
            return;
        }

        setLoading(true);
        setError("");

        // Эмуляция запроса на регистрацию
        setTimeout(() => {
            setLoading(false);
            navigate("/profile", {
                state: {
                    language: language,
                    darkMode: theme === 'dark' ? true : false
                }
            });

        }, 1500);
    };

    // Получение текущего перевода
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
                        <label htmlFor="username">{t.username}</label>
                        <input
                            type="text"
                            id="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder={t.placeholderUsername}
                        />
                    </motion.div>

                    <motion.div
                        className="input-group"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
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
                        transition={{ duration: 0.5, delay: 0.4 }}
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

                    <motion.div
                        className={`input-group ${!passwordsMatch ? "password-mismatch" : ""}`}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <label htmlFor="confirmPassword">{t.confirmPassword}</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder={t.placeholderConfirmPassword}
                        />
                        {!passwordsMatch && formData.confirmPassword && (
                            <div className="validation-error">
                                {t.errorMismatch}
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        className="checkbox-group"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <input type="checkbox" id="terms" />
                        <label htmlFor="terms">{t.terms}</label>
                    </motion.div>

                    <motion.button
                        className="login-button"
                        type="submit"
                        disabled={loading}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? <div className="spinner"></div> : t.register}
                    </motion.button>

                    <motion.div
                        className="auth-links"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                    >
                        <a href="/login">{t.login}</a>
                    </motion.div>
                </motion.form>
            </div>
        </div>
    );
}

export default Register;

