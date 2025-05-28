import React, { useState, useEffect } from 'react';
import './styles/Login.css';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from '../context/AuthContext';
import { Button, TextField, Typography, Box, Alert } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

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

// Анимации
const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Контейнер для всей страницы
const LoginPageContainer = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1810 50%, #4a2c17 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
});

// Анимированные фоновые элементы
const BackgroundShape = styled(Box)(({ size, top, left, delay }) => ({
  position: 'absolute',
  width: size,
  height: size,
  background: 'radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%)',
  borderRadius: '50%',
  filter: 'blur(40px)',
  top: top,
  left: left,
  animation: `${pulse} 3s ease-in-out infinite`,
  animationDelay: delay,
}));

// Контейнер формы
const LoginFormContainer = styled(Box)({
  position: 'relative',
  zIndex: 10,
  width: '100%',
  maxWidth: '400px',
  padding: '0 24px',
});

// Карточка формы
const LoginCard = styled(Box)({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 107, 53, 0.2)',
  borderRadius: '24px',
  padding: '48px 32px',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 107, 53, 0.1)',
  animation: `${float} 6s ease-in-out infinite`,
});

// Заголовок с логотипом
const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  marginBottom: '32px',
});

const LogoIcon = styled('span')({
  fontSize: '48px',
  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
});

const LogoText = styled(Typography)({
  fontSize: '28px',
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

// Стилизованные поля ввода
const StyledInput = styled('input')({
  width: '100%',
  padding: '16px 20px',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 107, 53, 0.3)',
  borderRadius: '12px',
  color: 'white',
  fontSize: '16px',
  outline: 'none',
  transition: 'all 0.3s ease',
  '&::placeholder': {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  '&:focus': {
    borderColor: '#ff6b35',
    background: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0 0 0 3px rgba(255, 107, 53, 0.2)',
  },
});

// Стилизованная кнопка
const StyledButton = styled(Button)({
  width: '100%',
  padding: '16px',
  background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
  color: 'white',
  fontSize: '16px',
  fontWeight: '600',
  borderRadius: '12px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(45deg, #e55a2b, #e57a35)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
  },
  '&:disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

// Стилизованные ссылки
const StyledLink = styled('button')({
  background: 'none',
  border: 'none',
  color: '#ff6b35',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'color 0.3s ease',
  '&:hover': {
    color: '#ff8c42',
  },
});

const RegisterButton = styled(Button)({
  width: '100%',
  padding: '12px',
  background: 'transparent',
  border: '2px solid #ff6b35',
  color: '#ff6b35',
  fontSize: '14px',
  fontWeight: '500',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  '&:hover': {
    background: '#ff6b35',
    color: 'white',
  },
});

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
        <LoginPageContainer>
            {/* Анимированные фоновые элементы */}
            <BackgroundShape size="300px" top="10%" left="10%" delay="0s" />
            <BackgroundShape size="400px" top="60%" left="70%" delay="1s" />
            <BackgroundShape size="250px" top="30%" left="60%" delay="0.5s" />

            <LoginFormContainer>
                <LoginCard>
                    {/* Логотип и заголовок */}
                    <LogoContainer>
                        <LogoIcon>🧠</LogoIcon>
                        <LogoText>BrainMeal</LogoText>
                    </LogoContainer>

                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                mb: 1
                            }}
                        >
                            {t.loginTitle}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)'
                            }}
                        >
                            Добро пожаловать в BrainMeal
                        </Typography>
                    </Box>

                    {/* Форма */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    background: 'rgba(244, 67, 54, 0.1)',
                                    border: '1px solid rgba(244, 67, 54, 0.3)',
                                    color: '#f44336',
                                    borderRadius: '12px'
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'white',
                                    fontWeight: '500',
                                    mb: 1
                                }}
                            >
                                {t.emailLabel}
                            </Typography>
                            <StyledInput
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                placeholder={t.emailPlaceholder}
                                required
                            />
                        </Box>

                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'white',
                                    fontWeight: '500',
                                    mb: 1
                                }}
                            >
                                {t.passwordLabel}
                            </Typography>
                            <StyledInput
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                placeholder={t.passwordPlaceholder}
                                required
                            />
                        </Box>

                        <StyledButton
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Вход...' : t.loginButton}
                        </StyledButton>
                    </Box>

                    {/* Футер */}
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <StyledLink onClick={handleForgotPassword}>
                            {t.forgotPassword}
                        </StyledLink>

                        <Box sx={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                            pt: 3,
                            mt: 3
                        }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    mb: 2
                                }}
                            >
                                Нет аккаунта?
                            </Typography>
                            <RegisterButton onClick={handleRegister}>
                                {t.register}
                            </RegisterButton>
                        </Box>
                    </Box>
                </LoginCard>
            </LoginFormContainer>
        </LoginPageContainer>
    );
};

export default Login;






