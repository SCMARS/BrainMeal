import { GoogleGenerativeAI } from '@google/generative-ai';


export const generateMealPlan = async (userProfile) => {
    if (!userProfile || !userProfile.age || !userProfile.gender) {
        throw new Error('Необходимо предоставить полный профиль пользователя');
    }

    const genAI = new GoogleGenerativeAI("AIzaSyCCRO7QCa0S6LavZcXEH9ymcXZb3UnfMTk");

    const prompt = `Создай детальный план питания на неделю для человека со следующими параметрами:
- Возраст: ${userProfile.age}
- Пол: ${userProfile.gender}
- Вес: ${userProfile.weight} кг
- Рост: ${userProfile.height} см
- Цель: ${userProfile.dietType}
- Целевые калории: ${userProfile.calorieTarget}
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

    try {
        // Вызываем метод generateText напрямую на экземпляре genAI
        const result = await genAI.generateText({
            model: "text-bison",
            prompt: prompt,
        });
        const response = result.response;
        const text = await response.text();
        console.log("Response text:", text);
        const mealPlan = JSON.parse(text);
        return mealPlan;
    } catch (error) {
        console.error('Ошибка генерации плана питания:', error);
        throw new Error('Не удалось сгенерировать план питания. Пожалуйста, попробуйте снова.');
    }
};
