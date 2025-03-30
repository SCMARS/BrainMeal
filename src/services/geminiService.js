import { GoogleGenerativeAI } from '@google/generative-ai';


export const generateMealPlan = async (userProfile) => {
    if (!userProfile || !userProfile.age || !userProfile.gender) {
        throw new Error('Необходимо предоставить полный профиль пользователя');
    }

    const genAI = new GoogleGenerativeAI("AIzaSyDvp5H76M33BQvmFa87T4jvHpBI8y4FG7g");

    const prompt = `Создай детальный план питания на неделю для человека со следующими параметрами:
- Возраст: ${userProfile.age}
- Пол: ${userProfile.gender}
- Вес: ${userProfile.weight} кг
- Рост: ${userProfile.height} см
- Цель: ${userProfile.dietType}
- Целевые калории: ${userProfile.calorieTarget}
- Предпочтения в еде: ${userProfile.foodPreferences || 'нет ограничений'}
- Аллергии: ${userProfile.allergies || 'нет'}
- Уровень активности: ${userProfile.activityLevel}

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
        console.log('Starting meal plan generation with user profile:', userProfile);
        
        // Создаем модель с правильной конфигурацией
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });
        
        console.log('Model initialized successfully');
        
        // Генерируем контент с правильными параметрами
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });
        
        console.log('Content generation completed');
        
        const response = await result.response;
        console.log('Response received');
        
        const text = response.text();
        console.log("Response text:", text);
        
        // Парсим ответ и структурируем его
        const mealPlan = JSON.parse(text);
        console.log('Meal plan parsed successfully');
        
        // Добавляем метаданные
        return {
            isWeekly: true,
            plan: mealPlan,
            generatedAt: new Date().toISOString(),
            userProfile: userProfile
        };
    } catch (error) {
        console.error('Detailed error in generateMealPlan:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        
        // Более информативное сообщение об ошибке
        let errorMessage = 'Не удалось сгенерировать план питания. ';
        if (error.message.includes('404')) {
            errorMessage += 'Ошибка доступа к API. Пожалуйста, проверьте подключение к интернету и API ключ.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage += 'Ошибка авторизации API. Пожалуйста, проверьте API ключ.';
        } else if (error.message.includes('429')) {
            errorMessage += 'Превышен лимит запросов. Пожалуйста, подождите немного и попробуйте снова.';
        } else {
            errorMessage += error.message;
        }
        
        throw new Error(errorMessage);
    }
};
