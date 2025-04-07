import { GoogleGenerativeAI } from '@google/generative-ai';


export const generateMealPlan = async (userProfile, existingMeals = []) => {
    if (!userProfile || !userProfile.age || !userProfile.gender) {
        throw new Error('Необходимо предоставить полный профиль пользователя');
    }

    const genAI = new GoogleGenerativeAI("AIzaSyDvp5H76M33BQvmFa87T4jvHpBI8y4FG7g");

    // Формируем информацию о существующих приемах пищи
    const existingMealsInfo = existingMeals.length > 0 
        ? `\nСуществующие приемы пищи:\n${existingMeals.map(meal => 
            `- ${meal.type}: ${meal.name} (${meal.calories} ккал, ${meal.protein}г белка, ${meal.carbs}г углеводов, ${meal.fat}г жиров)`
        ).join('\n')}`
        : '';

    const prompt = `Создай детальный план питания на неделю для человека со следующими параметрами:
- Возраст: ${userProfile.age}
- Пол: ${userProfile.gender}
- Вес: ${userProfile.weight} кг
- Рост: ${userProfile.height} см
- Цель: ${userProfile.dietType}
- Целевые калории: ${userProfile.calorieTarget}
- Предпочтения в еде: ${userProfile.foodPreferences || 'нет ограничений'}
- Аллергии: ${userProfile.allergies || 'нет'}
- Уровень активности: ${userProfile.activityLevel}${existingMealsInfo}

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

ВАЖНО: 
1. Ответ должен быть ТОЛЬКО в формате JSON
2. НЕ используйте комментарии или пояснения
3. НЕ используйте {...} или другие сокращения
4. Все свойства должны быть в двойных кавычках
5. Все значения должны быть строками
6. Не используйте сокращения или пропуски данных
7. Предоставьте полные данные для всех дней недели`;

    try {
        console.log('Starting meal plan generation with user profile:', userProfile);
        
        // Создаем модель
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('Model initialized successfully');
        
        // Генерируем контент
        const result = await model.generateContent(prompt);
        console.log('Content generation completed');
        
        const response = await result.response;
        console.log('Response received');
        
        const text = response.text();
        console.log("Response text:", text);
        
        // Очищаем ответ от markdown-форматирования и комментариев
        let cleanText = text
            .replace(/```json\n|\n```/g, '') // Удаляем markdown
            .replace(/\/\/.*$/gm, '') // Удаляем однострочные комментарии
            .replace(/\/\*[\s\S]*?\*\//g, '') // Удаляем многострочные комментарии
            .replace(/\{\.\.\.\}/g, '{}') // Заменяем {...} на пустой объект
            .replace(/\s*\/\/.*$/gm, '') // Удаляем комментарии после строк
            .replace(/\s*\/\*[\s\S]*?\*\//g, '') // Удаляем многострочные комментарии
            .trim();

        // Удаляем все после последней закрывающей скобки
        const lastBraceIndex = cleanText.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
            cleanText = cleanText.substring(0, lastBraceIndex + 1);
        }

        // Проверяем, что текст начинается с { и заканчивается на }
        if (!cleanText.startsWith('{') || !cleanText.endsWith('}')) {
            throw new Error('Invalid JSON format in response');
        }

        // Парсим ответ и структурируем его
        const parsedResponse = JSON.parse(cleanText);
        console.log('Meal plan parsed successfully');

        // Преобразуем структуру данных в формат, ожидаемый компонентом
        const transformedPlan = Object.entries(parsedResponse.plan).map(([day, meals]) => {
            // Преобразуем день недели в дату
            const today = new Date();
            const dayMap = {
                'monday': 1,
                'tuesday': 2,
                'wednesday': 3,
                'thursday': 4,
                'friday': 5,
                'saturday': 6,
                'sunday': 0
            };
            
            const targetDay = dayMap[day.toLowerCase()];
            if (targetDay === undefined) {
                console.warn(`Unknown day: ${day}, skipping...`);
                return null;
            }

            // Находим следующую дату для этого дня недели
            const currentDay = today.getDay();
            let daysToAdd = targetDay - currentDay;
            if (daysToAdd <= 0) daysToAdd += 7;
            
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysToAdd);

            return {
                date: targetDate.toISOString(),
                meals: Object.entries(meals).map(([type, meal]) => ({
                    type,
                    name: meal.name,
                    calories: parseInt(meal.calories) || 0,
                    protein: parseInt(meal.protein) || 0,
                    carbs: parseInt(meal.carbohydrates) || 0,
                    fat: parseInt(meal.fat) || 0,
                    time: meal.time,
                    ingredients: typeof meal.ingredients === 'string' 
                        ? meal.ingredients.split(', ').map(ing => ing.trim())
                        : []
                }))
            };
        }).filter(day => day !== null); // Удаляем null значения
        
        // Добавляем метаданные
        return {
            isWeekly: true,
            plan: transformedPlan,
            generatedAt: new Date().toISOString(),
            userProfile: userProfile,
            existingMeals: existingMeals,
            weeklySummary: parsedResponse.weeklyStatistics,
            recommendations: parsedResponse.cookingRecommendations || "Следуйте стандартным рецептам для каждого блюда. Экспериментируйте с ингредиентами для разнообразия."
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
        } else if (error.name === 'SyntaxError') {
            errorMessage += 'Ошибка формата JSON в ответе. Пожалуйста, попробуйте снова.';
        } else {
            errorMessage += error.message;
        }
        
        throw new Error(errorMessage);
    }
};
