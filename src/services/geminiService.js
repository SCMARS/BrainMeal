import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export const generateMealPlan = async (userProfile) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Создай детальный план питания на неделю для человека со следующими параметрами:
        - Возраст: ${userProfile.age}
        - Пол: ${userProfile.gender}
        - Вес: ${userProfile.weight} кг
        - Рост: ${userProfile.height} см
        - Цель: ${userProfile.goal}
        - Целевые калории: ${userProfile.targetCalories}
        - Предпочтения в еде: ${userProfile.foodPreferences || 'нет ограничений'}
        - Аллергии: ${userProfile.allergies || 'нет'}
        
        План должен включать:
        1. Расписание приемов пищи (завтрак, обед, ужин, перекусы)
        2. Для каждого приема пищи:
           - Название блюда
           - Ингредиенты и их количество
           - Калории
           - Белки, жиры, углеводы
           - Время приема
        3. Общую статистику по дням и неделе
        4. Рекомендации по приготовлению
        
        Формат ответа должен быть в JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Парсим JSON из ответа
        const mealPlan = JSON.parse(text);
        return mealPlan;
    } catch (error) {
        console.error('Error generating meal plan:', error);
        throw error;
    }
}; 