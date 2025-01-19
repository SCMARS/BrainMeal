// src/components/AnimatedButton.jsx

import { Button } from "@mui/material";
import { motion } from "framer-motion";

const AnimatedButton = ({ text, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }} // Увеличение и поворот при наведении
            whileTap={{ scale: 0.95 }} // Уменьшение при клике
            transition={{ duration: 0.3 }} // Время анимации
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
                        backgroundColor: "orange", // Цвет при наведении
                        color: "black", // Цвет текста при наведении
                        borderColor: "black", // Цвет рамки при наведении
                    },
                }}
            >
                {text}
            </Button>
        </motion.div>
    );
};

export default AnimatedButton;
