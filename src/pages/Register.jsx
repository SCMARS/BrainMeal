import { Button, TextField, Container, Typography, Box, CircularProgress } from "@mui/material";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();


    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Эмуляция успешной регистрации без отправки на бэкенд
        setTimeout(() => {
            setLoading(false);
            setError("");
            alert("Регистрация успешна!");
            navigate("/SelfData");
        }, 200);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    p={7} // Увеличиваем отступы
                    sx={{
                        border: "5px solid #ddd",
                        borderRadius: 3,
                        maxWidth: "800px", // Увеличиваем максимальную ширину контейнера
                        width: "100%", // Растягиваем на всю ширину
                        backgroundColor: "rgba(0,0,0,0.67)", // Темный фон
                        boxShadow: 3, // Увеличиваем тень для выделения
                    }}
                >
                    <motion.div
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <Typography variant="h4" component="h1" color="black" gutterBottom align="center" sx={{ fontWeight: "bold", fontSize: "2rem" }}>
                            Регистрация
                        </Typography>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                        >
                            <Typography color="error" align="center" sx={{ marginBottom: 2 }}>
                                {error}
                            </Typography>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        <TextField
                            label="Имя пользователя"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{
                                borderRadius: 2,
                                "& .MuiInputBase-root": {
                                    backgroundColor: "rgb(71,49,49)", // Светлый фон для полей ввода
                                },
                                "& .MuiInputLabel-root": {
                                    fontSize: "1.1rem", // Увеличение шрифта метки
                                },
                            }}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                    >
                        <TextField
                            label="Пароль"
                            type="password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                borderRadius: 2,
                                "& .MuiInputBase-root": {
                                    backgroundColor: "rgb(71,49,49)",
                                },
                                "& .MuiInputLabel-root": {
                                    fontSize: "1.1rem",
                                },
                            }}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            sx={{
                                mt: 2,
                                backgroundColor: "#ff6f00", // Оранжевый цвет для кнопки
                                "&:hover": {
                                    backgroundColor: "#ff3d00", // Более темный оранжевый при наведении
                                },
                                fontSize: "1.2rem", // Увеличение шрифта на кнопке
                                padding: "15px", // Увеличиваем отступы на кнопке
                            }}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="black " /> : "Завершить регистрацию"}
                        </Button>
                    </motion.div>
                </Box>
            </motion.div>
        </Container>
    );
}

export default Register;

