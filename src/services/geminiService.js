import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using fallback meal plans.');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const validateUserProfile = (userProfile) => {
    const requiredFields = ['age', 'gender', 'weight', 'height', 'dietType'];
    const missingFields = requiredFields.filter(field => !userProfile[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (userProfile.weight <= 0 || userProfile.height <= 0 || userProfile.age <= 0) {
        throw new Error('Invalid values for weight, height, or age');
    }
};

export const generateMealPlan = async (userProfile) => {
    try {
        validateUserProfile(userProfile);

        if (!genAI || !GEMINI_API_KEY) {
            console.warn('Using fallback meal plan due to missing or invalid API key');
            return generateFallbackMealPlan(userProfile);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Создай детальный план питания на ${userProfile.isWeekly ? 'неделю' : 'день'} для человека со следующими параметрами:
        - Возраст: ${userProfile.age}
        - Пол: ${userProfile.gender}
        - Вес: ${userProfile.weight} кг
        - Рост: ${userProfile.height} см
        - Тип диеты: ${userProfile.dietType}
        - Целевые калории: ${userProfile.calorieTarget || userProfile.targetCalories}
        - Предпочтения в еде: ${userProfile.mealPreferences || 'нет ограничений'}
        - Аллергии: ${userProfile.allergies || 'нет'}
        - Частота приемов пищи: ${userProfile.mealFrequency || '3'} раза в день
        
        Важные требования:
        1. Каждый прием пищи должен содержать точное количество калорий и нутриентов
        2. Порции должны быть реалистичными и соответствовать стандартным размерам
        3. Распределение калорий:
           - Завтрак: 30% от дневной нормы
           - Обед: 40% от дневной нормы
           - Ужин: 30% от дневной нормы
        4. Распределение нутриентов:
           - Белки: 30% от калорий (4 ккал/г)
           - Углеводы: 40% от калорий (4 ккал/г)
           - Жиры: 30% от калорий (9 ккал/г)
        
        План должен включать:
        1. Расписание приемов пищи (завтрак, обед, ужин, перекусы)
        2. Для каждого приема пищи:
           - Название блюда
           - Размер порции в граммах
           - Калории (целое число)
           - Белки (граммы, с одним знаком после запятой)
           - Углеводы (граммы, с одним знаком после запятой)
           - Жиры (граммы, с одним знаком после запятой)
        3. Общую статистику по дням и неделе
        
        Формат ответа должен быть в JSON со следующей структурой:
        {
            "monday": {
                "breakfast": {
                    "name": "Название блюда",
                    "portion": 200,
                    "calories": 600,
                    "protein": 30.0,
                    "carbs": 60.0,
                    "fat": 20.0
                },
                "lunch": {...},
                "dinner": {...}
            },
            "tuesday": {...},
            ...
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const mealPlan = JSON.parse(text);
            validateMealPlan(mealPlan);
            return mealPlan;
        } catch (error) {
            console.error('Error parsing meal plan JSON:', error);
            return generateFallbackMealPlan(userProfile);
        }
    } catch (error) {
        console.error('Error generating meal plan:', error);
        return generateFallbackMealPlan(userProfile);
    }
};

const validateMealPlan = (mealPlan) => {
    if (!mealPlan || typeof mealPlan !== 'object') {
        throw new Error('Invalid meal plan format');
    }

    const requiredMeals = ['breakfast', 'lunch', 'dinner'];
    const requiredFields = ['name', 'portion', 'calories', 'protein', 'carbs', 'fat'];

    for (const day in mealPlan) {
        for (const mealType of requiredMeals) {
            if (!mealPlan[day][mealType]) {
                throw new Error(`Missing ${mealType} for ${day}`);
            }

            for (const field of requiredFields) {
                if (!mealPlan[day][mealType][field]) {
                    throw new Error(`Missing ${field} in ${mealType} for ${day}`);
                }
            }
        }
    }
};

const generateFallbackMealPlan = (userProfile) => {
    const targetCalories = userProfile.calorieTarget || userProfile.targetCalories || 2000;
    const breakfastCalories = Math.round(targetCalories * 0.3);
    const lunchCalories = Math.round(targetCalories * 0.4);
    const dinnerCalories = Math.round(targetCalories * 0.3);

    // Расчет нутриентов для каждого приема пищи
    const calculateNutrients = (calories) => {
        const protein = Math.round((calories * 0.3) / 4 * 10) / 10; // 30% калорий из белков
        const carbs = Math.round((calories * 0.4) / 4 * 10) / 10;   // 40% калорий из углеводов
        const fat = Math.round((calories * 0.3) / 9 * 10) / 10;    // 30% калорий из жиров
        return { protein, carbs, fat };
    };

    const breakfastNutrients = calculateNutrients(breakfastCalories);
    const lunchNutrients = calculateNutrients(lunchCalories);
    const dinnerNutrients = calculateNutrients(dinnerCalories);

    const breakfastOptions = [
        {
            name: "Овсянка с бананом и медом",
            portion: 250,
            calories: breakfastCalories,
            ...breakfastNutrients
        },
        {
            name: "Творог с ягодами и орехами",
            portion: 200,
            calories: breakfastCalories,
            ...breakfastNutrients
        },
        {
            name: "Яичница с тостами и авокадо",
            portion: 300,
            calories: breakfastCalories,
            ...breakfastNutrients
        }
    ];

    const lunchOptions = [
        {
            name: "Куриный суп с лапшой",
            portion: 400,
            calories: lunchCalories,
            ...lunchNutrients
        },
        {
            name: "Салат с курицей и овощами",
            portion: 350,
            calories: lunchCalories,
            ...lunchNutrients
        },
        {
            name: "Паста с томатным соусом",
            portion: 300,
            calories: lunchCalories,
            ...lunchNutrients
        }
    ];

    const dinnerOptions = [
        {
            name: "Запеченная рыба с овощами",
            portion: 300,
            calories: dinnerCalories,
            ...dinnerNutrients
        },
        {
            name: "Куриное филе с гарниром из риса",
            portion: 350,
            calories: dinnerCalories,
            ...dinnerNutrients
        },
        {
            name: "Овощное рагу с мясом",
            portion: 400,
            calories: dinnerCalories,
            ...dinnerNutrients
        }
    ];

    if (userProfile.isWeekly) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const formattedWeek = {};
        days.forEach((day, index) => {
            formattedWeek[day] = {
                breakfast: breakfastOptions[index % breakfastOptions.length],
                lunch: lunchOptions[index % lunchOptions.length],
                dinner: dinnerOptions[index % dinnerOptions.length]
            };
        });
        return formattedWeek;
    } else {
        return {
            breakfast: breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)],
            lunch: lunchOptions[Math.floor(Math.random() * lunchOptions.length)],
            dinner: dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)]
        };
    }
};