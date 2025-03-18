import React, { useState, useEffect } from 'react';
import './styles/Login.css';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { auth } from "./services/firebase.ts";
import { signInWithEmailAndPassword } from "firebase/auth";

const translations = {
    en: {
        loginTitle: "Login",
        emailLabel: "Email",
        emailPlaceholder: "Enter your email",
        passwordLabel: "Password",
        passwordPlaceholder: "Enter your password",
        loginButton: "Login",
        forgotPassword: "Forgot Password?",
        register: "Register",
        errorEmpty: "Please enter email and password",
        errorInvalidCredentials: "Invalid email or password",
        errorTooManyAttempts: "Too many login attempts. Try again later",
        errorGeneral: "Login failed. Please try again later.",
        backendError: "Could not connect to server, but login successful. Some features may be limited."
    },
    uk: {
        loginTitle: "Вхід",
        emailLabel: "Пошта",
        emailPlaceholder: "Введіть вашу пошту",
        passwordLabel: "Пароль",
        passwordPlaceholder: "Введіть ваш пароль",
        loginButton: "Увійти",
        forgotPassword: "Забули пароль?",
        register: "Реєстрація",
        errorEmpty: "Будь ласка, введіть пошту та пароль",
        errorInvalidCredentials: "Неправильна пошта або пароль",
        errorTooManyAttempts: "Забагато спроб входу. Спробуйте пізніше",
        errorGeneral: "Помилка входу. Спробуйте пізніше.",
        backendError: "Не вдалося підключитися до сервера, але вхід успішний. Деякі функції можуть бути обмежені."
    }
};

const Login = () => {
    const location = useLocation();

    // Get theme from state or localStorage, default is dark
    const themeFromNav = location.state?.darkMode !== undefined ?
        (location.state.darkMode ? 'dark' : 'light') : null;
    const savedTheme = themeFromNav || localStorage.getItem('theme') || 'dark';
    const [theme, setTheme] = useState(savedTheme);

    // Get language from state or localStorage, default is English
    const langFromNav = location.state?.language || null;
    const savedLanguage = langFromNav || localStorage.getItem('language') || 'en';
    const [language, setLanguage] = useState(savedLanguage);

    // Get translations based on selected language
    const t = translations[language] || translations.en;

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = () => {
        navigate("/register", {
            state: {
                language: language,
                darkMode: theme === 'dark'
            }
        });
    };

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
        localStorage.setItem('language', language);
    }, [theme, language]);

    // Send UID to backend for session verification with fallback
    const sendUserIdToBackend = async (uid, user) => {
        try {
            const response = await axios.post("http://localhost:5000/api/user/login", { uid }, {
                timeout: 5000 // Set a timeout of 5 seconds
            });
            console.log("Response from backend:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error sending UID to backend:", error.message);
            // Instead of throwing an error, return a default value
            // that indicates the backend is not available
            return {
                success: false,
                backendAvailable: false,
                message: "Backend not available, continuing with limited functionality"
            };
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError(t.errorEmpty);
            return;
        }

        setLoading(true);
        setError("");
        setWarning("");

        try {
            // 1. Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in:", userCredential.user);

            // 2. Try to communicate with backend
            const backendResponse = await sendUserIdToBackend(
                userCredential.user.uid,
                userCredential.user
            );

            // 3. Check if backend is available
            if (!backendResponse.backendAvailable) {
                setWarning(t.backendError);
                // Store user data in localStorage as fallback
                localStorage.setItem('userData', JSON.stringify({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                    lastLogin: new Date().toISOString()
                }));
            }

            // 4. Navigate to profile with state (even if backend failed)
            navigate("/profile", {
                state: {
                    language: language,
                    darkMode: theme === 'dark',
                    backendAvailable: backendResponse.backendAvailable || false
                }
            });
        } catch (error) {
            console.error("Login error:", error.code, error.message);

            // Firebase error handling
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setError(t.errorInvalidCredentials);
            } else if (error.code === 'auth/too-many-requests') {
                setError(t.errorTooManyAttempts);
            } else {
                setError(t.errorGeneral);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleForgotPassword = () => {
        navigate("/forgot-password", {
            state: {
                language: language,
                darkMode: theme === 'dark'
            }
        });
    };

    return (
        <div className={`login-container ${theme}`}>
            <div className="login-box">
                <h1 className="form-title">{t.loginTitle}</h1>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {warning && !error && (
                    <div className="warning-message">
                        {warning}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>{t.emailLabel}</label>
                        <input
                            type="email"
                            placeholder={t.emailPlaceholder}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                        />
                    </div>
                    <div className="input-group">
                        <label>{t.passwordLabel}</label>
                        <input
                            type="password"
                            placeholder={t.passwordPlaceholder}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                        />
                    </div>
                    <button
                        className="login-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <div className="spinner"></div> : t.loginButton}
                    </button>
                </form>

                <div className="auth-links">
                    <a href="#" onClick={handleForgotPassword}>{t.forgotPassword}</a> | <a href="#" onClick={handleRegister}>{t.register}</a>
                </div>
            </div>

            {/* Theme toggle button */}
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'dark' ? '🌞' : '🌙'}
            </button>
        </div>
    );
};

export default Login;






