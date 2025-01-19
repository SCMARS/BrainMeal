import { useState } from "react";
import { Button, TextField, Container, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AnimatedButton = ({ text, onClick, sx }) => (
    <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3 }}
    >
        <Button
            onClick={onClick}
            sx={{
                backgroundColor: "black",
                color: "orange",
                border: "2px solid orange",
                padding: "10px 20px",
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: "5px",
                transition: "all 0.3s ease",
                "&:hover": {
                    backgroundColor: "orange",
                    color: "black",
                    borderColor: "black",
                },
                ...sx,
            }}
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

    const handleRegister = () => navigate("/register");

    const handleLogin = () => {
        if (!username || !password) {
            setError("Пожалуйста, заполните все поля.");
            return;
        }
        setError("");
        alert(`Welcome ${username}!`);
        navigate("/SelfData");
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography variant="h4" component="h1" color="black" gutterBottom>
                    Войти
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Добро пожаловать! Войдите, чтобы продолжить.
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    autoFocus
                    label="Имя пользователя"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    label="Пароль"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && (
                    <Typography color="error" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2 }}>
                    <AnimatedButton text="Войти" onClick={handleLogin} sx={{ mb: 2 }} />
                    <AnimatedButton text="Регистрация" onClick={handleRegister} />
                </Box>
            </Box>
        </Container>
    );
}

export default Login;





