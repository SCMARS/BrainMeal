import { useEffect, useState } from "react";

export default function MealPlan() {
    const [mealPlan, setMealPlan] = useState([]);

    // Пример загрузки данных с API или базы данных
    useEffect(() => {
        fetch("http://localhost:5000/mealplan")
            .then((response) => response.json())
            .then((data) => setMealPlan(data))
            .catch((error) => console.error("Ошибка загрузки:", error));
    }, []);

    return (
        <div>
            <h1>Meal Plan</h1>
            {mealPlan.length > 0 ? (
                <ul>
                    {mealPlan.map((meal, index) => (
                        <li key={index}>{meal.name}</li> // Здесь предполагается, что у объекта есть поле "name"
                    ))}
                </ul>
            ) : (
                <p>Loading meal plan...</p>
            )}
        </div>
    );
}
