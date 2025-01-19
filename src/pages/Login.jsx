import { useState } from "react";
import { Button, TextField, Container, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import './styles/Login.css';
import image from './img.png'

const AnimatedButton = ({ text, onClick, sx }) => (
    <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3 }}
    >
        <Button
            onClick={onClick}
            className="animated-button"
            sx={sx}
        >
            {text}
        </Button>
    </motion.div>
);

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleRegister = () => navigate("/Profile");

    const handleLogin = () => {
        if (!username || !password) {
            setError("Пожалуйста, заполните все поля.");
            return;
        }
        setError("");
        alert(`Welcome ${username}!`);
        navigate("//Profile");
    };

    return (
        <Container className="login-container">
            {/* Контейнер с изображением слева */}
            <Box className="image-container">
                <img src={image} alt="Image" />
            </Box>

            {/* Контейнер с формой справа */}
            <Box className="form-container">
                <Typography variant="h4" component="h1" gutterBottom>
                    Войти
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Добро пожаловать! Войдите, чтобы продолжить.
                </Typography>

                <TextField
                    autoFocus
                    label="Имя пользователя"
                    variant="outlined"
                    fullWidth
                    className="input-field"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    label="Пароль"
                    type="password"
                    variant="outlined"
                    fullWidth
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && (
                    <Typography className="error-message">
                        {error}
                    </Typography>
                )}
                <Box className="button-group">
                    <AnimatedButton text="Войти" onClick={handleLogin} sx={{ mb: 2 }} />
                    <AnimatedButton text="Регистрация" onClick={handleRegister} />
                </Box>
            </Box>
        </Container>
    );
}

export default Login;








