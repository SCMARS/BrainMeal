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

    if (user) {
        navigate('/dashboard');
        return null;
    }

    return (
        <LoginContainer>
            <LoginForm component="form" onSubmit={handleSubmit}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    {t.loginTitle}
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    fullWidth
                    label={t.emailLabel}
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                    }}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label={t.passwordLabel}
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                    }}
                    margin="normal"
                    required
                />
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    sx={{ mt: 3 }}
                >
                    {loading ? 'Logging in...' : t.loginButton}
                </Button>
            </LoginForm>

            <div className="auth-links">
                <a href="#" onClick={handleForgotPassword}>{t.forgotPassword}</a> | <a href="#" onClick={handleRegister}>{t.register}</a>
            </div>

            {/* Theme toggle button */}
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'dark' ? '🌞' : '🌙'}
            </button>
        </LoginContainer>
    );
};

export default Login;






