import React, { useState, useEffect } from 'react';
import './styles/Login.css';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from '../context/AuthContext';
import { Button, TextField, Typography, Box, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';

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

const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

const LoginForm = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const Login = () => {
    const location = useLocation();
    const { user } = useAuth();

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
            const response = await axios.post("/api/user/login",
                { uid },
                {
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    withCredentials: true
                }
            );
            console.log("Response from backend:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error sending UID to backend:", error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
                console.error("Error response headers:", error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("No response received:", error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error("Error setting up request:", error.message);
            }

            // Return a default value that indicates the backend is not available
            return {
                success: false,
                backendAvailable: false,
                message: "Backend not available, continuing with limited functionality"
            };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (error) {
            setError(error.message);
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

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
            {/* Animated Background Shapes */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Login Form Container */}
                <div className="bg-white/5 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <span className="text-4xl filter drop-shadow-lg">🧠</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                                BrainMeal
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t.loginTitle}</h1>
                        <p className="text-gray-400">Добро пожаловать в BrainMeal</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-center text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-white font-medium mb-2">
                                {t.emailLabel}
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                placeholder={t.emailPlaceholder}
                                className="w-full px-4 py-3 bg-white/10 border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white/15 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-white font-medium mb-2">
                                {t.passwordLabel}
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                placeholder={t.passwordPlaceholder}
                                className="w-full px-4 py-3 bg-white/10 border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white/15 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Вход...' : t.loginButton}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-8 space-y-4">
                        <button
                            onClick={handleForgotPassword}
                            className="text-orange-500 hover:text-orange-400 font-medium underline transition-colors duration-300"
                        >
                            {t.forgotPassword}
                        </button>

                        <div className="border-t border-gray-600 pt-4">
                            <p className="text-gray-400 mb-3">
                                Нет аккаунта?
                            </p>
                            <button
                                onClick={handleRegister}
                                className="w-full border-2 border-orange-500 text-orange-500 py-2 px-6 rounded-xl font-medium hover:bg-orange-500 hover:text-white transition-all duration-300"
                            >
                                {t.register}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;






