export {
    calculateCalories,
    createMealPlanPrompt,
    parseMealPlanResponse,
    generateFallbackDay,
    generateFallbackMealPlan,

};

// Константы для доступа к Gemini API (добавлены напрямую)
const GEMINI_API_KEY = "AIza9X7Yd8jK2L3m4N5p6QrStUv7WxYz";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent";

export const generateMealPlan = async (userData) => {
    try {
        // Если API ключ отсутствует, используем резервный план
        if (!GEMINI_API_KEY) {
            console.error("API ключ не найден");
            return generateFallbackMealPlan(
                userData.isWeekly,
                calculateCalories(userData.weight, userData.height, userData.age, userData.gender, userData.dietType)
            );
        }

        const { weight, age, gender, height, dietType, isWeekly, mealPreferences } = userData;
        const targetCalories = calculateCalories(weight, height, age, gender, dietType);
        const timeFrame = isWeekly ? "week" : "day";
        const prompt = createMealPlanPrompt(targetCalories, timeFrame, dietType, mealPreferences);

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { parts: [{ text: prompt }] }
                ],
                generationConfig: {
                    temperature: 0.2,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Не удалось получить план питания: ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            return generateFallbackMealPlan(isWeekly, targetCalories);
        }

        const generatedText = data.candidates[0].content.parts[0].text;
        return parseMealPlanResponse(generatedText, isWeekly, targetCalories);
    } catch (error) {
        console.error("Ошибка при генерации плана питания:", error);
        return generateFallbackMealPlan(
            userData.isWeekly,
            calculateCalories(userData.weight, userData.height, userData.age, userData.gender, userData.dietType)
        );
    }
};

const createMealPlanPrompt = (targetCalories, timeFrame, dietType, mealPreferences) => {
    let prompt = `Создай план питания на ${timeFrame === 'week' ? 'неделю' : 'день'} с целевым количеством калорий ${targetCalories} в день.`;

    if (dietType) {
        const dietTypes = {
            "vegetarian": "вегетарианская диета",
            "vegan": "веганская диета",
            "gluten-free": "безглютеновая диета",
            "ketogenic": "кетогенная диета",
            "paleo": "палео диета",
            "weight_loss": "диета для похудения",
            "gentle": "щадящая диета",
            "protein": "протеиновая диета",
            "muscle_gain": "диета для набора мышечной массы"
        };
        prompt += ` Тип диеты: ${dietTypes[dietType] || dietType}.`;
    }

    if (mealPreferences) {
        prompt += ` Учитывай предпочтения: ${mealPreferences}.`;
    }

    if (timeFrame === 'week') {
        prompt += ` Выдай результат в JSON формате с днями недели на русском языке (monday, tuesday, wednesday, thursday, friday, saturday, sunday) и для каждого дня укажи breakfast, lunch, dinner с названиями блюд и calories для каждого приема пищи. Например: {"monday": {"breakfast": "Овсянка с бананом", "breakfast_calories": 350, "lunch": "Салат с курицей", "lunch_calories": 450, "dinner": "Запеченная рыба с овощами", "dinner_calories": 400}}`;
    } else {
        prompt += ` Выдай результат в JSON формате с блюдами для breakfast, lunch, dinner, snack и calories для каждого приема пищи. Например: {"breakfast": {"meal": "Овсянка с бананом", "calories": 350}, "lunch": {"meal": "Салат с курицей", "calories": 450}, "dinner": {"meal": "Запеченная рыба с овощами", "calories": 400}, "snack": {"meal": "Фрукты", "calories": 100}}`;
    }

    return prompt;
};

const parseMealPlanResponse = (responseText, isWeekly, targetCalories) => {
    try {
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
            responseText.match(/```\s*([\s\S]*?)\s*```/) ||
            responseText.match(/{[\s\S]*}/);

        let jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
        jsonStr = jsonStr.replace(/^\s*{/, '{').replace(/}\s*$/, '}');
        const mealPlan = JSON.parse(jsonStr);

        if (isWeekly) {
            const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const formattedWeek = {};
            const isValid = daysOfWeek.some(day => mealPlan[day]);

            if (!isValid) {
                return generateFallbackMealPlan(isWeekly, targetCalories);
            }

            daysOfWeek.forEach(day => {
                if (mealPlan[day]) {
                    formattedWeek[day] = {
                        breakfast: mealPlan[day].breakfast || "Нет данных",
                        lunch: mealPlan[day].lunch || "Нет данных",
                        dinner: mealPlan[day].dinner || "Нет данных",
                        breakfast_calories: mealPlan[day].breakfast_calories || Math.round(targetCalories * 0.3),
                        lunch_calories: mealPlan[day].lunch_calories || Math.round(targetCalories * 0.4),
                        dinner_calories: mealPlan[day].dinner_calories || Math.round(targetCalories * 0.3)
                    };
                } else {
                    formattedWeek[day] = generateFallbackDay(targetCalories);
                }
            });
            return formattedWeek;
        } else {
            if (!mealPlan.breakfast || !mealPlan.lunch || !mealPlan.dinner) {
                return generateFallbackMealPlan(isWeekly, targetCalories);
            }
            return {
                breakfast: {
                    meal: mealPlan.breakfast.meal || mealPlan.breakfast || "Нет данных",
                    calories: mealPlan.breakfast.calories || mealPlan.breakfast_calories || Math.round(targetCalories * 0.3)
                },
                lunch: {
                    meal: mealPlan.lunch.meal || mealPlan.lunch || "Нет данных",
                    calories: mealPlan.lunch.calories || mealPlan.lunch_calories || Math.round(targetCalories * 0.4)
                },
                dinner: {
                    meal: mealPlan.dinner.meal || mealPlan.dinner || "Нет данных",
                    calories: mealPlan.dinner.calories || mealPlan.dinner_calories || Math.round(targetCalories * 0.3)
                },
                snack: {
                    meal: mealPlan.snack ? (mealPlan.snack.meal || mealPlan.snack) : "Фрукты или орехи",
                    calories: mealPlan.snack ? (mealPlan.snack.calories || mealPlan.snack_calories || Math.round(targetCalories * 0.1)) : Math.round(targetCalories * 0.1)
                }
            };
        }
    } catch (error) {
        console.error("Ошибка при обработке ответа плана питания:", error);
        return generateFallbackMealPlan(isWeekly, targetCalories);
    }
};

const generateFallbackDay = (targetCalories) => {
    const breakfastCalories = Math.round(targetCalories * 0.3);
    const lunchCalories = Math.round(targetCalories * 0.4);
    const dinnerCalories = Math.round(targetCalories * 0.3);

    const breakfastOptions = [
        "Овсянка с бананом и медом",
        "Творог с ягодами и орехами",
        "Яичница с тостами и авокадо",
        "Греческий йогурт с гранолой",
        "Блины с джемом",
        "Бутерброд с авокадо и яйцом",
        "Сырники со сметаной"
    ];

    const lunchOptions = [
        "Куриный суп с лапшой",
        "Салат с курицей и овощами",
        "Паста с томатным соусом",
        "Плов с говядиной",
        "Гречка с тушеной курицей и овощами",
        "Борщ со сметаной",
        "Рис с тушеными овощами и курицей"
    ];

    const dinnerOptions = [
        "Запеченная рыба с овощами",
        "Куриное филе с гарниром из риса",
        "Овощное рагу с мясом",
        "Картофельное пюре с котлетой",
        "Тушеные овощи с индейкой",
        "Омлет с овощами и сыром",
        "Стейк из лосося с овощами"
    ];

    return {
        breakfast: breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)],
        lunch: lunchOptions[Math.floor(Math.random() * lunchOptions.length)],
        dinner: dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)],
        breakfast_calories: breakfastCalories,
        lunch_calories: lunchCalories,
        dinner_calories: dinnerCalories
    };
};

const generateFallbackMealPlan = (isWeekly, targetCalories) => {
    const breakfastCalories = Math.round(targetCalories * 0.3);
    const lunchCalories = Math.round(targetCalories * 0.4);
    const dinnerCalories = Math.round(targetCalories * 0.3);

    const breakfastOptions = [
        "Овсянка с бананом и медом",
        "Творог с ягодами и орехами",
        "Яичница с тостами и авокадо",
        "Греческий йогурт с гранолой",
        "Блины с джемом",
        "Бутерброд с авокадо и яйцом",
        "Сырники со сметаной"
    ];

    const lunchOptions = [
        "Куриный суп с лапшой",
        "Салат с курицей и овощами",
        "Паста с томатным соусом",
        "Плов с говядиной",
        "Гречка с тушеной курицей и овощами",
        "Борщ со сметаной",
        "Рис с тушеными овощами и курицей"
    ];

    const dinnerOptions = [
        "Запеченная рыба с овощами",
        "Куриное филе с гарниром из риса",
        "Овощное рагу с мясом",
        "Картофельное пюре с котлетой",
        "Тушеные овощи с индейкой",
        "Омлет с овощами и сыром",
        "Стейк из лосося с овощами"
    ];

    if (isWeekly) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const formattedWeek = {};
        days.forEach((day, index) => {
            formattedWeek[day] = {
                breakfast: breakfastOptions[index % breakfastOptions.length],
                lunch: lunchOptions[index % lunchOptions.length],
                dinner: dinnerOptions[index % dinnerOptions.length],
                breakfast_calories: breakfastCalories,
                lunch_calories: lunchCalories,
                dinner_calories: dinnerCalories
            };
        });
        return formattedWeek;
    } else {
        return {
            breakfast: {
                meal: breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)],
                calories: breakfastCalories
            },
            lunch: {
                meal: lunchOptions[Math.floor(Math.random() * lunchOptions.length)],
                calories: lunchCalories
            },
            dinner: {
                meal: dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)],
                calories: dinnerCalories
            },
            snack: {
                meal: "Фрукты или орехи",
                calories: Math.round(targetCalories * 0.1)
            }
        };
    }
};

const calculateCalories = (weight, height, age, gender, dietType) => {
    let bmr;
    if (gender === 'male') {
        bmr = 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age);
    } else {
        bmr = 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age);
    }
    const activityMultiplier = 1.375;
    let tdee = bmr * activityMultiplier;
    switch (dietType) {
        case 'weight_loss':
            tdee *= 0.8;
            break;
        case 'muscle_gain':
            tdee *= 1.1;
            break;
        case 'ketogenic':
            tdee *= 0.9;
            break;
        default:
            break;
    }
    return Math.round(tdee);
};
