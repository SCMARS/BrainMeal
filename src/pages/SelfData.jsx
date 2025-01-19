import { useState } from "react";
import { Typography, Box, TextField, Button, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import './styles/background.css';
import './styles/SelfData.css';

function SelfData() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        weight: '',
        age: '',
        calories: '',
        meals: '',
        goal: ''
    });
    const [mealPlan, setMealPlan] = useState(null);

    const handleProfile = () => {
        navigate("/Profile");
    }

    const handelselfdata = async () => {
        const response = await fetch('http://localhost:5000/api/mealplan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        setMealPlan(data.meal_plan);


        navigate("/MealPlan", { state: { mealPlan: data.meal_plan } });
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    height: '65vh',
                    padding: '20px',
                    gap: '16px'
                }}
            >
                <Typography
                    component="h1"
                    color="black"
                    gutterBottom
                    sx={{ fontWeight: "bold", fontSize: "2rem" }}
                >
                    Укажите ваши данные для регистрации
                </Typography>

                <TextField
                    label="Вес"
                    type="number"
                    name="weight"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={formData.weight}
                    onChange={handleChange}
                    sx={{
                        borderRadius: 4,
                        background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                        boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                        "& .MuiInputBase-root": {
                            backgroundColor: "transparent",
                            borderRadius: 4
                        },
                        "& .MuiInputLabel-root": {
                            fontSize: "1.1rem",
                            color: "#fff"
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.8)"
                            },
                            "&:hover fieldset": {
                                borderColor: "#fff"
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#FF8E53"
                            }
                        }
                    }}
                />

                <TextField
                    label="Возраст"
                    type="number"
                    name="age"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={formData.age}
                    onChange={handleChange}
                    sx={{
                        borderRadius: 4,
                        background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                        boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                        "& .MuiInputBase-root": {
                            backgroundColor: "transparent",
                            borderRadius: 4
                        },
                        "& .MuiInputLabel-root": {
                            fontSize: "1.1rem",
                            color: "#fff"
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.8)"
                            },
                            "&:hover fieldset": {
                                borderColor: "#fff"
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#21CBF3"
                            }
                        }
                    }}
                />

                <TextField
                    label="Потребление калорий"
                    type="number"
                    name="calories"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={formData.calories}
                    onChange={handleChange}
                    sx={{
                        borderRadius: 4,
                        background: "linear-gradient(45deg, #66bb6a 30%, #43a047 90%)",
                        boxShadow: "0 3px 5px 2px rgba(102, 187, 106, .3)",
                        "& .MuiInputBase-root": {
                            backgroundColor: "transparent",
                            borderRadius: 4
                        },
                        "& .MuiInputLabel-root": {
                            fontSize: "1.1rem",
                            color: "#fff"
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.8)"
                            },
                            "&:hover fieldset": {
                                borderColor: "#fff"
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#43a047"
                            }
                        }
                    }}
                />

                <TextField
                    label="Количество приемов пищи"
                    type="number"
                    name="meals"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={formData.meals}
                    onChange={handleChange}
                    sx={{
                        borderRadius: 4,
                        background: "linear-gradient(45deg, #ffeb3b 30%, #fdd835 90%)",
                        boxShadow: "0 3px 5px 2px rgba(255, 235, 59, .3)",
                        "& .MuiInputBase-root": {
                            backgroundColor: "transparent",
                            borderRadius: 4
                        },
                        "& .MuiInputLabel-root": {
                            fontSize: "1.1rem",
                            color: "#fff"
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.8)"
                            },
                            "&:hover fieldset": {
                                borderColor: "#fff"
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#fdd835"
                            }
                        }
                    }}
                />

                <TextField
                    select
                    label="Цель"
                    type="text"
                    name="goal"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={formData.goal}
                    onChange={handleChange}
                    sx={{
                        borderRadius: 4,
                        background: "linear-gradient(45deg, #e91e63 30%, #f06292 90%)",
                        boxShadow: "0 3px 5px 2px rgba(233, 30, 99, .3)",
                        "& .MuiInputBase-root": {
                            backgroundColor: "transparent",
                            borderRadius: 4
                        },
                        "& .MuiInputLabel-root": {
                            fontSize: "1.1rem",
                            color: "#fff"
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.8)"
                            },
                            "&:hover fieldset": {
                                borderColor: "#fff"
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#f06292"
                            }
                        }
                    }}
                >
                    <MenuItem value="" className="menu-item">Выберите вариант</MenuItem>
                    <MenuItem value="Похудение" className="menu-item">Похудение</MenuItem>
                    <MenuItem value="Набор массы" className="menu-item">Набор массы</MenuItem>
                    <MenuItem value="Поддержание формы" className="menu-item">Поддержание формы</MenuItem>
                </TextField>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center', // Центрирование кнопки
                    padding: '20px'
                }}
            >
                <button className="shine-button" onClick={handelselfdata}>Подтвердить</button>
            </Box>
            <Box
                sx={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px'
                }}
            >
                <Button
                    onClick={handleProfile}
                    variant="contained"
                    sx={{
                        backgroundColor: "black",
                        color: "white",
                        '&:hover': {
                            backgroundColor: "gray",
                            color: "white"
                        }
                    }}
                >
                    Профиль
                </Button>
            </Box>
        </>
    );
}

export default SelfData;












