import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Импортируем framer-motion
import './styles/background.css';

function WelcomePage() {
    const navigate = useNavigate();

    const handleRegister = () => {
        navigate("/register");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <div className="App">
            <div className="parallax"></div> {/* Параллакс фон */}
            <motion.div
                className="content-container"
                textAlign="center"
                mt={4}
                initial={{ opacity: 0, y: -30 }} // Начальная позиция (скрыто сверху)
                animate={{ opacity: 1, y: 0 }}   // Конечное состояние
                transition={{ duration: 1 }}      // Длительность анимации
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }} // Центрирование по вертикали
            >
                <Typography variant="h3" component="h1" gutterBottom>
                    Добро пожаловать в FoodBrain
                </Typography>
                <Typography variant="h5" component="p" gutterBottom>
                    твой идеальный рацион питания.
                </Typography>
                <Box mt={2}>
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }} // Задержка для анимации кнопок
                        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} // Размещение кнопок по вертикали
                    >
                        <Button className="shine-button" onClick={handleRegister}>
                            Регистрация
                        </Button>
                        <Button className="shine-button" onClick={handleLogin}>
                            Войти
                        </Button>
                    </motion.div>
                </Box>
            </motion.div>
        </div>
    );
}

export default WelcomePage;


