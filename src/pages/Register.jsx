import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import "./styles/Register.css";
import { auth } from "./services/firebase.ts";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import axios from "axios";

function Register() {
    const location = useLocation();
    const themeFromNav = location.state?.darkMode !== undefined ?
        (location.state.darkMode ? 'dark' : 'light') : null;
    const savedTheme = themeFromNav || localStorage.getItem('theme') || 'dark';
    const [theme, setTheme] = useState(savedTheme);

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
    const [warning, setWarning] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);

    const navigate = useNavigate();

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
            errorTerms: "Ви повинні прийняти умови використання",
            placeholderUsername: "Введіть ім'я користувача",
            placeholderEmail: "Введіть email",
            placeholderPassword: "Введіть пароль",
            placeholderConfirmPassword: "Підтвердіть пароль",
            errorEmailInUse: "Ця електронна адреса вже використовується",
            errorWeakPassword: "Пароль надто слабкий",
            errorInvalidEmail: "Неправильний формат електронної адреси",
            errorGeneral: "Помилка реєстрації. Спробуйте пізніше.",
            backendError: "Не вдалося підключитися до сервера, але реєстрація успішна. Деякі функції можуть бути обмежені."
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
            errorTerms: "You must accept the terms of use",
            placeholderUsername: "Enter username",
            placeholderEmail: "Enter email",
            placeholderPassword: "Enter password",
            placeholderConfirmPassword: "Confirm password",
            errorEmailInUse: "This email is already in use",
            errorWeakPassword: "Password is too weak",
            errorInvalidEmail: "Invalid email format",
            errorGeneral: "Registration error. Please try again later.",
            backendError: "Could not connect to server, but registration successful. Some features may be limited."
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

    // Send user data to backend with fallback
    const sendUserDataToBackend = async (uid, username) => {
        try {
            const response = await axios.post("http://localhost:5000/api/user", {
                uid,
                username
            }, {
                timeout: 5000 // 5 second timeout
            });
            console.log("Response from backend:", response.data);
            return {
                success: true,
                backendAvailable: true,
                data: response.data
            };
        } catch (error) {
            console.error("Error sending data to backend:", error.message);
            // Return a response indicating backend is unavailable
            return {
                success: false,
                backendAvailable: false,
                message: "Backend not available, continuing with limited functionality"
            };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.username || !formData.password || !formData.confirmPassword || !formData.email) {
            setError(translations[language].errorEmpty);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError(translations[language].errorMismatch);
            return;
        }

        if (!termsAccepted) {
            setError(translations[language].errorTerms);
            return;
        }
        if (formData.password < 6){
            setError(translations[language].errorTerms);
            return;
        }

        setLoading(true);
        setError("");
        setWarning("");

        try {
            // 1. Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // 2. Update the user profile with username
            await updateProfile(userCredential.user, {
                displayName: formData.username
            });

            console.log("User registered:", userCredential.user);

            // 3. Try to send user data to backend
            const backendResponse = await sendUserDataToBackend(
                userCredential.user.uid,
                formData.username
            );

            // 4. Handle potential backend unavailability
            if (!backendResponse.backendAvailable) {
                setWarning(translations[language].backendError);

                // Store user data in localStorage as fallback
                localStorage.setItem('userData', JSON.stringify({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: formData.username,
                    registeredAt: new Date().toISOString()
                }));
            }

            // 5. Navigate to profile page (even if backend failed)
            navigate("/profile", {
                state: {
                    language: language,
                    darkMode: theme === 'dark',
                    backendAvailable: backendResponse.backendAvailable || false,
                    justRegistered: true
                }
            });
        } catch (error) {
            console.error("Registration error:", error.code, error.message);

            // Better Firebase error handling
            if (error.code === 'auth/email-already-in-use') {
                setError(translations[language].errorEmailInUse);
            } else if (error.code === 'auth/weak-password') {
                setError(translations[language].errorWeakPassword);
            } else if (error.code === 'auth/invalid-email') {
                setError(translations[language].errorInvalidEmail);
            } else {
                setError(translations[language].errorGeneral);
            }
        } finally {
            setLoading(false);
        }
    };

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

                {warning && !error && (
                    <motion.div
                        className="warning-message"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {warning}
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
                        <input
                            type="checkbox"
                            id="terms"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                        />
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

