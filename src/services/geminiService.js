
import { GoogleGenerativeAI } from '@google/generative-ai';

// Конфигурация разнообразных продуктов для создания интересных блюд
const FOOD_VARIETY = {
    proteins: {
        meat: ['куриная грудка', 'говядина нежирная', 'свинина нежирная', 'индейка', 'телятина', 'кролик'],
        fish: ['лосось', 'тунец', 'треска', 'судак', 'семга', 'скумбрия', 'форель', 'минтай'],
        dairy: ['творог 5%', 'творог 9%', 'греческий йогурт', 'кефир', 'молоко', 'сыр моцарелла'],
        eggs: ['яйца куриные', 'яичные белки', 'перепелиные яйца'],
        plant: ['тофу', 'чечевица', 'фасоль', 'нут', 'киноа', 'темпе']
    },
    carbs: {
        grains: ['гречка', 'рис бурый', 'рис белый', 'овсянка', 'перловка', 'булгур', 'пшено'],
        pasta: ['макароны цельнозерновые', 'макароны обычные', 'спагетти', 'пенне'],
        potatoes: ['картофель', 'батат', 'молодой картофель'],
        bread: ['хлеб цельнозерновой', 'хлеб ржаной', 'лаваш', 'тосты'],
        fruits: ['банан', 'яблоко', 'груша', 'апельсин', 'ягоды', 'киви', 'манго', 'ананас']
    },
    vegetables: {
        green: ['брокколи', 'шпинат', 'салат', 'зеленая фасоль', 'спаржа', 'руккола'],
        colorful: ['помидоры', 'огурцы', 'перец болгарский', 'морковь', 'свекла', 'баклажаны'],
        cruciferous: ['капуста белокочанная', 'цветная капуста', 'кабачки', 'тыква']
    },
    fats: {
        oils: ['масло оливковое', 'масло подсолнечное', 'масло льняное', 'масло кокосовое'],
        nuts: ['орехи грецкие', 'миндаль', 'фундук', 'семечки подсолнуха', 'семена чиа'],
        other: ['авокадо', 'оливки', 'кунжут']
    }
};

// Функция для создания промпта с разнообразием продуктов
const createDiversityPrompt = (language) => {
    if (language === 'en') {
        return `
FOOD DIVERSITY REQUIREMENTS:
- Use WIDE VARIETY of products from different categories
- AVOID REPETITION - each meal should be unique and interesting
- Rotate proteins: chicken, beef, fish, eggs, dairy, legumes
- Vary carbohydrates: different grains, fruits, vegetables
- Include colorful vegetables and different cooking methods
- Make meals APPETIZING and VARIED - no boring repetition!
- Each day should have different protein sources and preparations`;
    } else {
        return `
ТРЕБОВАНИЯ К РАЗНООБРАЗИЮ ПРОДУКТОВ:
- Используй ШИРОКИЙ АССОРТИМЕНТ продуктов из разных категорий
- ИЗБЕГАЙ ПОВТОРЕНИЙ - каждое блюдо должно быть уникальным и интересным
- Чередуй белки: курица, говядина, рыба, яйца, молочные продукты, бобовые
- Варьируй углеводы: разные крупы, фрукты, овощи
- Включай разноцветные овощи и разные способы приготовления
- Делай блюда АППЕТИТНЫМИ и РАЗНООБРАЗНЫМИ - никаких скучных повторений!
- Каждый день должен иметь разные источники белка и способы приготовления`;
    }
};

export const generateMealPlan = async (profileData, existingMeals = []) => {
    // Используем existingMeals для анализа предыдущих блюд
    if (!profileData || !profileData.age || !profileData.gender) {
        throw new Error('Необходимо предоставить полный профиль пользователя');
    }

    // Определяем язык (по умолчанию русский)
    const language = profileData.language || 'ru';



    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDvp5H76M33BQvmFa87T4jvHpBI8y4FG7g");

    // Функция для создания промптов на разных языках
    const getPromptTexts = (lang) => {
        if (lang === 'en') {
            return {
                noPreferences: 'no special preferences',
                noAllergies: 'none',
                noGoals: 'no specific goals',
                customMacros: 'USER CUSTOM KBJU REQUIREMENTS',
                calories: 'Calories',
                proteins: 'Proteins',
                fats: 'Fats',
                carbs: 'Carbohydrates',
                important: 'IMPORTANT',
                strictlyFollow: 'Strictly follow user-specified KBJU values',
                specialRequirements: 'SPECIAL REQUIREMENTS FOR',
                diet: 'DIET',
                increased: 'increased content for better results',
                priority: 'Priority',
                recommended: 'Recommended products',
                avoid: 'Avoid',
                balanced: 'balanced nutrition with emphasis on proteins',
                diverse: 'diverse protein sources, vegetables, fruits, whole grains',
                processed: 'processed foods, excess sugar'
            };
        } else {
            return {
                noPreferences: 'нет особых предпочтений',
                noAllergies: 'нет',
                noGoals: 'нет конкретных целей',
                customMacros: 'ПОЛЬЗОВАТЕЛЬСКИЕ ТРЕБОВАНИЯ К КБЖУ',
                calories: 'Калории',
                proteins: 'Белки',
                fats: 'Жиры',
                carbs: 'Углеводы',
                important: 'ВАЖНО',
                strictlyFollow: 'Строго соблюдать указанные пользователем значения КБЖУ',
                specialRequirements: 'СПЕЦИАЛЬНЫЕ ТРЕБОВАНИЯ ДЛЯ ДИЕТЫ',
                diet: '',
                increased: 'повышенное содержание для лучших результатов',
                priority: 'Приоритет',
                recommended: 'Рекомендуемые продукты',
                avoid: 'Избегать',
                balanced: 'сбалансированное питание с акцентом на белки',
                diverse: 'разнообразные источники белка, овощи, фрукты, цельные зерна',
                processed: 'обработанные продукты, избыток сахара'
            };
        }
    };

    const texts = getPromptTexts(language);

    // Формируем строку с предпочтениями и ограничениями
    const preferences = profileData.foodPreferences?.join(', ') || texts.noPreferences;
    const allergies = profileData.allergies?.join(', ') || texts.noAllergies;
    const healthGoals = profileData.healthGoals?.join(', ') || texts.noGoals;

    // Расчет макронутриентов для всех диет с повышенным содержанием белка
    const getDietMacros = (dietType, weight, calories) => {
        const baseProtein = weight * 1.8; // Базовое количество белка (1.8г на кг веса)

        switch (dietType) {
            case 'cutting': // Сушка
                return {
                    protein: weight * 2, // 2г на кг веса
                    fat: weight * 1, // 1г на кг веса
                    carbs: weight * 1.5 // 1.5г на кг веса
                };

            case 'keto': // Кето диета
                return {
                    protein: baseProtein, // 1.8г на кг веса
                    fat: calories * 0.75 / 9, // 75% калорий из жиров
                    carbs: 20 // Максимум 20г углеводов в день
                };

            case 'paleo': // Палео диета
                return {
                    protein: baseProtein, // 1.8г на кг веса
                    fat: calories * 0.35 / 9, // 35% калорий из жиров
                    carbs: calories * 0.35 / 4 // 35% калорий из углеводов
                };

            case 'lowCarb': // Низкоуглеводная
                return {
                    protein: baseProtein, // 1.8г на кг веса
                    fat: calories * 0.45 / 9, // 45% калорий из жиров
                    carbs: calories * 0.25 / 4 // 25% калорий из углеводов
                };

            case 'mediterranean': // Средиземноморская
                return {
                    protein: baseProtein, // 1.8г на кг веса
                    fat: calories * 0.35 / 9, // 35% калорий из жиров
                    carbs: calories * 0.45 / 4 // 45% калорий из углеводов
                };

            case 'vegetarian': // Вегетарианская
                return {
                    protein: baseProtein * 1.1, // 2г на кг веса (больше для компенсации)
                    fat: calories * 0.30 / 9, // 30% калорий из жиров
                    carbs: calories * 0.50 / 4 // 50% калорий из углеводов
                };

            case 'vegan': // Веганская
                return {
                    protein: baseProtein * 1.2, // 2.2г на кг веса (еще больше для компенсации)
                    fat: calories * 0.30 / 9, // 30% калорий из жиров
                    carbs: calories * 0.50 / 4 // 50% калорий из углеводов
                };

            case 'balanced': // Сбалансированная
            default:
                return {
                    protein: baseProtein, // 1.8г на кг веса
                    fat: calories * 0.30 / 9, // 30% калорий из жиров
                    carbs: calories * 0.50 / 4 // 50% калорий из углеводов
                };
        }
    };

    // Проверяем, использует ли пользователь ручной ввод КБЖУ
    const useCustomMacros = profileData.useCustomMacros &&
                           profileData.customCalories &&
                           profileData.customProtein &&
                           profileData.customFat &&
                           profileData.customCarbs;

    const dietMacros = useCustomMacros ? {
        protein: Number(profileData.customProtein),
        fat: Number(profileData.customFat),
        carbs: Number(profileData.customCarbs)
    } : getDietMacros(profileData.dietType, profileData.weight, profileData.calorieTarget);

    const targetCalories = useCustomMacros ? Number(profileData.customCalories) : profileData.calorieTarget;

    // Создаем детальную информацию о макронутриентах для каждой диеты
    const getDietInfo = (dietType, macros, isCustom = false) => {
        if (!macros) return '';

        const proteinRounded = Math.round(macros.protein);
        const fatRounded = Math.round(macros.fat);
        const carbsRounded = Math.round(macros.carbs);

        const baseInfo = isCustom ?
            `\n\n${texts.customMacros}:
- ${texts.calories}: ${targetCalories} ${language === 'en' ? 'kcal per day' : 'ккал в день'}
- ${texts.proteins}: ${proteinRounded}${language === 'en' ? 'g per day (user specified)' : 'г в день (заданы пользователем)'}
- ${texts.fats}: ${fatRounded}${language === 'en' ? 'g per day (user specified)' : 'г в день (заданы пользователем)'}
- ${texts.carbs}: ${carbsRounded}${language === 'en' ? 'g per day (user specified)' : 'г в день (заданы пользователем)'}
- ${texts.important}: ${texts.strictlyFollow}` :
            `\n\n${texts.specialRequirements} ${texts.diet}"${dietType.toUpperCase()}":
- ${texts.proteins}: ${proteinRounded}${language === 'en' ? 'g per day (' : 'г в день ('}${texts.increased})
- ${texts.fats}: ${fatRounded}${language === 'en' ? 'g per day' : 'г в день'}
- ${texts.carbs}: ${carbsRounded}${language === 'en' ? 'g per day' : 'г в день'}`;

        switch (dietType) {
            case 'cutting':
                return baseInfo + `
- Приоритет: простые высокобелковые продукты, базовые крупы
- Избегать: сладости, жирное мясо, быстрые углеводы
- Основа рациона: гречка, рис, куриная грудка, яйца, простые овощи`;

            case 'keto':
                return baseInfo + `
- Приоритет: простые жировые продукты, минимум углеводов
- Рекомендуемые продукты: яйца, мясо, рыба, масло, орехи, простые овощи
- Избегать: хлеб, крупы, сахар, фрукты (кроме ягод)
- Основа рациона: яйца, мясо, рыба, масло подсолнечное, простые овощи`;

            case 'paleo':
                return baseInfo + `
- Приоритет: простые натуральные продукты
- Рекомендуемые продукты: мясо, рыба, яйца, простые овощи, фрукты
- Избегать: зерновые, бобовые, молочные продукты, сахар
- Основа рациона: куриная грудка, яйца, простые овощи, яблоки, бананы`;

            case 'vegetarian':
                return baseInfo + `
- Приоритет: простые растительные белки, базовые крупы
- Рекомендуемые продукты: яйца, творог, гречка, рис, бобовые, простые овощи
- Избегать: мясо, рыба
- Основа рациона: гречка, рис, яйца, творог, простые овощи`;

            case 'vegan':
                return baseInfo + `
- Приоритет: простые растительные белки
- Рекомендуемые продукты: гречка, рис, бобовые, орехи, простые овощи
- Избегать: все продукты животного происхождения
- Основа рациона: гречка, рис, фасоль, горох, простые овощи`;

            case 'mediterranean':
                return baseInfo + `
- Приоритет: простые продукты средиземноморья
- Рекомендуемые продукты: рыба, рис, простые овощи, оливковое масло
- Избегать: красное мясо, обработанные продукты
- Основа рациона: рыба, рис, простые овощи, оливковое масло`;

            case 'lowCarb':
                return baseInfo + `
- Приоритет: простые белки и жиры, минимум углеводов
- Рекомендуемые продукты: мясо, рыба, яйца, простые овощи
- Избегать: хлеб, крупы, сахар, крахмалистые овощи`;

            default:
                return baseInfo + `
- Приоритет: простые сбалансированные продукты
- Рекомендуемые продукты: гречка, рис, куриная грудка, яйца, простые овощи
- Избегать: обработанные продукты, избыток сахара
- Основа рациона: гречка, рис, куриная грудка, яйца, простые овощи`;
        }
    };

    const macroInfo = getDietInfo(profileData.dietType, dietMacros, useCustomMacros);

    // Проверяем, нужно ли генерировать только одно блюдо
    const isSingleMeal = profileData.singleMealType;

    const baseInfo = language === 'en' ? `
- Age: ${profileData.age}
- Gender: ${profileData.gender}
- Weight: ${profileData.weight} kg
- Height: ${profileData.height} cm
- Diet type: ${profileData.dietType}
- Target calories: ${targetCalories}
- Food preferences: ${preferences}
- Allergies: ${allergies}
- Activity level: ${profileData.activityLevel}
- Health goals: ${healthGoals}${macroInfo}` : `
- Возраст: ${profileData.age}
- Пол: ${profileData.gender}
- Вес: ${profileData.weight} кг
- Рост: ${profileData.height} см
- Тип диеты: ${profileData.dietType}
- Целевые калории: ${targetCalories}
- Предпочтения в еде: ${preferences}
- Аллергии: ${allergies}
- Уровень активности: ${profileData.activityLevel}
- Цели здоровья: ${healthGoals}${macroInfo}`;

    // Создаем основной промпт в зависимости от языка
    const createMainPrompt = (lang) => {
        if (lang === 'en') {
            return `Create a detailed weekly meal plan for a person with the following parameters. You are a professional nutritionist and must generate meal plans that EXACTLY match the target calories and macronutrients.

RESPONSE LANGUAGE: Generate ALL meal names, ingredients, and content in ENGLISH only.

CRITICAL ACCURACY REQUIREMENTS:
1. MANDATORY: Specify EXACT WEIGHT of each product in grams (e.g., "Cooked buckwheat 200g", "Fried chicken breast 300g")
2. Use your knowledge of precise nutritional characteristics per 100g for common foods
3. Focus on SIMPLE and ACCESSIBLE products: buckwheat, rice, chicken breast, eggs, cottage cheese, simple vegetables
4. PRECISELY calculate KBJU for specified weight using formula: (value_per_100g * weight_in_grams) / 100
5. Daily KBJU totals must hit target values with ±1% accuracy
6. MANDATORY: Check math - sum of all meal calories = ${targetCalories} kcal
7. If totals don't match, adjust product portions to hit exact target
8. Break complex dishes into separate ingredients with weight for each
9. Specify meal time for each dish`;
        } else {
            return `Создай детальный недельный план питания для человека со следующими параметрами. Ты профессиональный нутрициолог и должен генерировать планы питания, которые ТОЧНО соответствуют целевым калориям и макронутриентам.

ЯЗЫК ОТВЕТА: Генерируй ВСЕ названия блюд, ингредиенты и контент только на РУССКОМ языке.

ВАЖНО ДЛЯ РАЗНООБРАЗИЯ И ИНТЕРЕСА:
- Используй РАЗНООБРАЗНЫЕ и ДОСТУПНЫЕ продукты из разных категорий
- Чередуй белки: курица, говядина, рыба, яйца, творог, бобовые
- Варьируй крупы: гречка, рис, овсянка, перловка, булгур
- Включай разные овощи: брокколи, перец, морковь, кабачки, помидоры
- Для перекусов используй разные продукты: творог, орехи, фрукты, йогурт, кефир

ПРАВИЛА ДЛЯ ПЕРЕКУСОВ:
- Перекус (snack) должен быть ЛЕГКИМ и ПРОСТЫМ
- Калорийность перекуса: 10-15% от дневной нормы (${Math.round(targetCalories * 0.1)}-${Math.round(targetCalories * 0.15)} ккал)
- Примеры перекусов: творог 100г, яблоко 1шт, орехи 30г, кефир 200мл, банан 1шт
- НЕ делай перекус как полноценный прием пищи`;
        }
    };

    const mainPrompt = createMainPrompt(language);
    const diversityPrompt = createDiversityPrompt(language);

    const fullPrompt = isSingleMeal ?
        `${mainPrompt}${baseInfo}

${language === 'en' ?
`IMPORTANT: Create ONE meal for "${profileData.singleMealType}" meal time.
The meal should contain approximately ${Math.round(targetCalories / 4)} calories (quarter of daily norm).
Consider all dietary requirements and user preferences.

CRITICAL ACCURACY REQUIREMENTS:
1. MANDATORY: Specify EXACT WEIGHT of each product in grams
2. Use precise nutritional characteristics per 100g
3. PRECISELY calculate KBJU for specified weight
4. Break complex dishes into separate ingredients with weight for each

IMPORTANT: Response must be ONLY in JSON format with this structure:

{
  "plan": [
    {
      "name": "Dish Name",
      "type": "${profileData.singleMealType}",
      "ingredients": ["Product 1: 100g", "Product 2: 50g"],
      "calories": 485,
      "protein": 16.2,
      "carbs": 84.0,
      "fat": 11.4,
      "time": "8:00"
    }
  ]
}` :
`ВАЖНО: Создай ОДНО блюдо для приема пищи "${profileData.singleMealType}".

КАЛОРИЙНОСТЬ В ЗАВИСИМОСТИ ОТ ТИПА ПРИЕМА ПИЩИ:
${profileData.singleMealType === 'snack' ?
`- Перекус (snack): ${Math.round(targetCalories * 0.1)}-${Math.round(targetCalories * 0.15)} калорий (10-15% дневной нормы)
- Используй ПРОСТЫЕ продукты: творог, яйца, орехи, фрукты, кефир
- Примеры: творог 100г, яблоко 1шт, орехи 30г, кефир 200мл` :
`- ${profileData.singleMealType}: ${Math.round(targetCalories / 4)} калорий (четверть дневной нормы)
- Используй ПРОСТЫЕ продукты: гречка, рис, куриная грудка, яйца, творог, простые овощи`}

Учитывай все диетические требования и предпочтения пользователя.

КРИТИЧЕСКИ ВАЖНЫЕ ТРЕБОВАНИЯ К ТОЧНОСТИ:
1. ОБЯЗАТЕЛЬНО указывай ТОЧНЫЙ ВЕС каждого продукта в граммах
2. Используй точные пищевые характеристики продуктов на 100г
3. ТОЧНО рассчитывай КБЖУ для указанного веса продукта
4. Разбивай сложные блюда на отдельные ингредиенты с весом каждого
5. Используй ПРОСТЫЕ и ДОСТУПНЫЕ продукты

ВАЖНО: Ответ должен быть ТОЛЬКО в формате JSON с такой структурой:

{
  "plan": [
    {
      "name": "Название блюда",
      "type": "${profileData.singleMealType}",
      "ingredients": ["Продукт 1: 100г", "Продукт 2: 50г"],
      "calories": 485,
      "protein": 16.2,
      "carbs": 84.0,
      "fat": 11.4,
      "time": "8:00"
    }
  ]
}`}` :
        `${mainPrompt}${baseInfo}

${diversityPrompt}

${language === 'en' ?
`CRITICAL ACCURACY REQUIREMENTS:
1. MANDATORY: Specify EXACT WEIGHT of each product in grams (e.g., "Grilled salmon 150g", "Brown rice 120g")
2. Use your knowledge of precise nutritional characteristics per 100g for diverse foods
3. CREATE VARIED MEALS using different proteins, grains, and vegetables each day
4. AVOID REPETITION - make each meal unique and interesting` :
`КРИТИЧЕСКИ ВАЖНЫЕ ТРЕБОВАНИЯ К ТОЧНОСТИ:
1. ОБЯЗАТЕЛЬНО указывай ТОЧНЫЙ ВЕС каждого продукта в граммах (например: "Лосось на гриле 150г", "Рис бурый 120г")
2. Используй свои знания точных пищевых характеристик разнообразных продуктов на 100г
3. СОЗДАВАЙ РАЗНООБРАЗНЫЕ блюда используя разные белки, крупы и овощи каждый день
4. ИЗБЕГАЙ ПОВТОРЕНИЙ - делай каждое блюдо уникальным и интересным`}
3. ТОЧНО рассчитывай КБЖУ для указанного веса продукта по формуле: (значение_на_100г * вес_в_граммах) / 100
4. Суммарные КБЖУ за день должны попадать в целевые значения с точностью ±1%
5. ОБЯЗАТЕЛЬНО проверяй математику: сумма калорий всех приемов пищи = ${targetCalories} ккал
6. Если сумма не сходится, корректируй порции продуктов для точного попадания в цель
7. Разбивай сложные блюда на отдельные ингредиенты с весом каждого
8. Указывай время приема пищи для каждого блюда

ВАЖНО: Ответ должен быть ТОЛЬКО в формате JSON с такой структурой:

{
  "plan": {
    "monday": {
      "breakfast": {
        "name": "Овсяная каша с ягодами",
        "ingredients": ["Овсяные хлопья: 80г", "Молоко 2.5%: 200мл", "Черника: 50г", "Мед: 15г"],
        "detailed_nutrition": [
          {"ingredient": "Овсяные хлопья", "weight": "80г", "calories": 304, "protein": 10.1, "fat": 6.2, "carbs": 54.4},
          {"ingredient": "Молоко 2.5%", "weight": "200мл", "calories": 104, "protein": 5.6, "fat": 5.0, "carbs": 9.4},
          {"ingredient": "Черника", "weight": "50г", "calories": 28, "protein": 0.4, "fat": 0.2, "carbs": 6.9},
          {"ingredient": "Мед", "weight": "15г", "calories": 49, "protein": 0.1, "fat": 0, "carbs": 13.3}
        ],
        "calories": 485,
        "protein": 16.2,
        "carbs": 84.0,
        "fat": 11.4,
        "time": "8:00"
      },
      "lunch": { ... },
      "dinner": { ... }
    },
    "tuesday": { ... },
    ... для всех 7 дней
  }
}

Обязательные требования:
1. ingredients должен быть массивом строк с точным весом (например: ["Куриная грудка: 250г", "Рис отварной: 150г"])
2. Все числовые значения должны быть числами
3. План на все 7 дней (monday-sunday)
4. Минимум 3 приема пищи в день (breakfast, lunch, dinner)
5. КАЖДЫЙ ДЕНЬ должен точно попадать в целевые КБЖУ (±2%)
6. Указывай точный вес каждого продукта для достижения цели
7. Проверяй математику: сумма КБЖУ всех приемов пищи = дневная цель

ПРИМЕР ТОЧНОГО РАСЧЕТА для цели ${targetCalories} ккал с РАЗНООБРАЗНЫМИ продуктами:
Завтрак (${Math.round(targetCalories * 0.25)} ккал):
- Гречка отварная 100г: 92 ккал, 3.4г белка, 0.6г жира, 18г углеводов
- Яйцо куриное 2шт: 310 ккал, 25.4г белка, 21.8г жира, 1.4г углеводов
ИТОГО завтрак: 402 ккал

Обед (${Math.round(targetCalories * 0.35)} ккал):
- Куриная грудка отварная 200г: 330 ккал, 62г белка, 7.2г жира, 0г углеводов
- Рис отварной 150г: 174 ккал, 3.3г белка, 0.8г жира, 35г углеводов
- Огурец 100г: 15
ккал, 0.8г белка, 0.1г жира, 2.8г углеводов
- Масло подсолнечное 10г: 90 ккал, 0г белка, 10г жира, 0г углеводов
ИТОГО обед: 609 ккал

Ужин (${Math.round(targetCalories * 0.3)} ккал):
- Творог 5% 200г: 242 ккал, 34.4г белка, 10г жира, 3.6г углеводов
- Помидор 100г: 20 ккал, 0.6г белка, 0.2г жира, 4.2г углеводов
ИТОГО ужин: 262 ккал

Перекус (${Math.round(targetCalories * 0.1)} ккал) - ПРОСТОЙ И ЛЕГКИЙ:
- Яблоко 150г: 78 ккал, 0.6г белка, 0.6г жира, 15г углеводов

ОБЩИЙ ИТОГО: ${402 + 609 + 262 + 78} ккал (точно попадает в цель ${targetCalories} ккал)

ПРОВЕРКА МАТЕМАТИКИ ОБЯЗАТЕЛЬНА!

ВАЖНО О РАЗНООБРАЗИИ:
- Каждый день недели должен иметь РАЗНЫЕ белки (курица, говядина, рыба, яйца, творог, бобовые)
- Каждый день недели должен иметь РАЗНЫЕ крупы (гречка, рис, овсянка, перловка, булгур)
- Каждый день недели должен иметь РАЗНЫЕ овощи и способы приготовления
- НЕ повторяй одинаковые блюда - делай каждое уникальным!
- Используй разные методы приготовления: отварное, жареное, тушеное, запеченное

НЕ добавляй комментариев - только JSON!`;

    try {
        console.log('Starting meal plan generation with profile:', profileData);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        console.log('Raw AI response:', text);

        // Очищаем и парсим ответ
        let cleanText = text
            .replace(/```json\n?|\n?```/g, '')
            .replace(/```\n?|\n?```/g, '')
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\{\.\.\.\}/g, '{}')
            .replace(/\n\s*\n/g, '\n') // Убираем лишние переносы строк
            .trim();

        // Находим первую и последнюю фигурную скобку для извлечения JSON
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }

        console.log('Cleaned text for parsing:', cleanText.substring(0, 1000) + '...');

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanText);
            console.log('Successfully parsed JSON on first try');
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Problematic text length:', cleanText.length);
            console.error('First 500 chars:', cleanText.substring(0, 500));

            // Попробуем исправить распространенные проблемы JSON
            let fixedText = cleanText
                .replace(/,\s*}/g, '}')
                .replace(/,\s*]/g, ']')
                .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*):/g, '$1"$2":')
                .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)(\s*[,}])/g, ': "$1"$2')
                .replace(/\n/g, ' ') // Убираем переносы строк
                .replace(/\s+/g, ' ') // Убираем лишние пробелы
                .replace(/"\s*:\s*"/g, '":"') // Убираем пробелы вокруг двоеточий
                .replace(/,\s*,/g, ','); // Убираем двойные запятые

            console.log('Attempting to fix JSON...');
            console.log('Fixed text preview:', fixedText.substring(0, 500));

            try {
                parsedResponse = JSON.parse(fixedText);
                console.log('Successfully parsed after fixing');
            } catch (secondError) {
                console.error('Still failed after fixing:', secondError);

                // Попробуем создать fallback план
                console.log('Creating fallback meal plan...');
                parsedResponse = createFallbackMealPlan(targetCalories, dietMacros);
            }
        }

        // Преобразуем в плоский массив для MealPlan
        const transformedMeals = [];

        // Если это одно блюдо, обрабатываем по-другому
        if (isSingleMeal && Array.isArray(parsedResponse.plan)) {
            const meal = parsedResponse.plan[0];
            const targetDate = profileData.targetDate ? new Date(profileData.targetDate) : new Date();

            // Обрабатываем ингредиенты
            let ingredients = [];
            try {
                if (Array.isArray(meal.ingredients)) {
                    ingredients = meal.ingredients.map(item => String(item));
                } else if (typeof meal.ingredients === 'object' && meal.ingredients !== null) {
                    ingredients = Object.entries(meal.ingredients).map(([name, amount]) => `${name}: ${amount}`);
                } else if (typeof meal.ingredients === 'string') {
                    ingredients = meal.ingredients.split(/[,;]\s*/).filter(item => item.trim());
                } else {
                    ingredients = ['Ингредиенты не указаны'];
                }
            } catch (ingredientError) {
                console.warn('Ошибка обработки ингредиентов:', ingredientError);
                ingredients = ['Ошибка обработки ингредиентов'];
            }

            transformedMeals.push({
                id: `single-${profileData.singleMealType}-${Date.now()}`,
                date: targetDate.toISOString(),
                type: profileData.singleMealType,
                name: meal.name || `Новое блюдо (${profileData.singleMealType})`,
                calories: Number(meal.calories) || 0,
                protein: Number(meal.protein) || 0,
                carbs: Number(meal.carbohydrates || meal.carbs) || 0,
                fat: Number(meal.fat) || 0,
                time: meal.time || getDefaultTimeForMealType(profileData.singleMealType),
                ingredients,
                notes: meal.notes || ''
            });
        } else {
            // Обрабатываем недельный план как раньше
            Object.entries(parsedResponse.plan || parsedResponse.weeklyPlan || {}).forEach(([day, meals]) => {
                const date = getDateForDay(day);

                Object.entries(meals || {}).forEach(([type, meal]) => {
                // Обрабатываем разные форматы ингредиентов
                let ingredients = [];
                try {
                    if (Array.isArray(meal.ingredients)) {
                        ingredients = meal.ingredients.map(item => String(item));
                    } else if (typeof meal.ingredients === 'object' && meal.ingredients !== null) {
                        // Преобразуем объект в массив строк
                        ingredients = Object.entries(meal.ingredients).map(([name, amount]) => `${name}: ${amount}`);
                    } else if (typeof meal.ingredients === 'string') {
                        ingredients = meal.ingredients.split(/[,;]\s*/).filter(item => item.trim());
                    } else {
                        ingredients = ['Ингредиенты не указаны'];
                    }
                } catch (ingredientError) {
                    console.warn('Ошибка обработки ингредиентов:', ingredientError);
                    ingredients = ['Ошибка обработки ингредиентов'];
                }

                transformedMeals.push({
                    id: `${day}-${type}-${Date.now()}`, // Уникальный ID
                    date: date.toISOString(),
                    type,
                    name: meal.name || 'Неизвестное блюдо',
                    calories: Number(meal.calories) || 0,
                    protein: Number(meal.protein) || 0,
                    carbs: Number(meal.carbohydrates || meal.carbs) || 0,
                    fat: Number(meal.fat) || 0,
                    time: meal.time || '12:00',
                    ingredients,
                    notes: meal.notes || ''
                });
            });
        });
        }

        console.log('Transformed meals:', transformedMeals);

        // Проверяем точность калорий
        const accuracyCheck = validateMealPlanAccuracy(transformedMeals, targetCalories);
        console.log('Accuracy check before correction:', accuracyCheck);

        // Корректируем план для точного попадания в калории
        const correctedMeals = correctMealPlanCalories(transformedMeals, targetCalories, dietMacros);
        console.log('Meals after calorie correction:', correctedMeals);

        // Проверяем точность после коррекции
        const finalAccuracyCheck = validateMealPlanAccuracy(correctedMeals, targetCalories);
        console.log('Final accuracy check:', finalAccuracyCheck);

        return {
            plan: correctedMeals,
            generatedAt: new Date().toISOString(),
            profileData: profileData,
            weeklyStats: parsedResponse.weeklyStatistics || {},
            recommendations: parsedResponse.cookingRecommendations || [],
            accuracyCheck: finalAccuracyCheck
        };
    } catch (error) {
        console.error('Error in generateMealPlan:', error);
        throw new Error(error.message || 'Failed to generate meal plan');
    }
};

// Вспомогательная функция для получения даты по дню недели
function getDateForDay(day) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const currentDay = today.getDay(); // 0 = воскресенье
    const targetDay = days.indexOf(day.toLowerCase());

    // Находим начало текущей недели (понедельник)
    const startOfWeek = new Date(today);
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Понедельник = 0
    startOfWeek.setDate(today.getDate() - daysFromMonday);

    // Добавляем нужное количество дней от понедельника
    const targetDate = new Date(startOfWeek);
    const daysToAdd = targetDay === 0 ? 6 : targetDay - 1; // Воскресенье = 6 дней от понедельника
    targetDate.setDate(startOfWeek.getDate() + daysToAdd);

    console.log(`Day: ${day}, Target date: ${targetDate.toDateString()}`);
    return targetDate;
}

// Функция для получения времени по умолчанию для типа блюда
function getDefaultTimeForMealType(mealType) {
    switch (mealType) {
        case 'breakfast':
            return '8:00';
        case 'lunch':
            return '13:00';
        case 'dinner':
            return '19:00';
        case 'snack':
            return '16:00';
        default:
            return '12:00';
    }
}

// Функция для проверки точности плана питания
function validateMealPlanAccuracy(meals, targetCalories) {
    // Группируем блюда по дням
    const mealsByDay = {};

    meals.forEach(meal => {
        const date = new Date(meal.date).toDateString();
        if (!mealsByDay[date]) {
            mealsByDay[date] = [];
        }
        mealsByDay[date].push(meal);
    });

    const dailyAccuracy = [];
    let totalAccuracy = 0;
    let validDays = 0;

    Object.entries(mealsByDay).forEach(([date, dayMeals]) => {
        const dailyTotal = dayMeals.reduce((total, meal) => ({
            calories: total.calories + (Number(meal.calories) || 0),
            protein: total.protein + (Number(meal.protein) || 0),
            carbs: total.carbs + (Number(meal.carbs) || 0),
            fat: total.fat + (Number(meal.fat) || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        // Проверяем точность калорий (допустимое отклонение ±5%)
        const calorieAccuracy = Math.abs(dailyTotal.calories - targetCalories) / targetCalories;
        const isAccurate = calorieAccuracy <= 0.05; // 5% допуск

        // Проверяем соответствие КБЖУ расчетным калориям
        const calculatedCalories = (dailyTotal.protein * 4) + (dailyTotal.carbs * 4) + (dailyTotal.fat * 9);
        const macroAccuracy = Math.abs(calculatedCalories - dailyTotal.calories) / dailyTotal.calories;

        const dayAccuracy = {
            date,
            targetCalories,
            actualCalories: Math.round(dailyTotal.calories),
            calculatedCalories: Math.round(calculatedCalories),
            difference: Math.round(dailyTotal.calories - targetCalories),
            percentageError: Math.round(calorieAccuracy * 100),
            macroAccuracy: Math.round(macroAccuracy * 100),
            isAccurate,
            macros: {
                protein: Math.round(dailyTotal.protein * 10) / 10,
                carbs: Math.round(dailyTotal.carbs * 10) / 10,
                fat: Math.round(dailyTotal.fat * 10) / 10
            }
        };

        dailyAccuracy.push(dayAccuracy);

        if (isAccurate) {
            totalAccuracy += (1 - calorieAccuracy);
            validDays++;
        }
    });

    const overallAccuracy = validDays > 0 ? (totalAccuracy / validDays) * 100 : 0;

    return {
        overallAccuracy: Math.round(overallAccuracy),
        accurateDays: validDays,
        totalDays: Object.keys(mealsByDay).length,
        dailyAccuracy,
        isHighlyAccurate: overallAccuracy >= 95,
        recommendations: generateAccuracyRecommendations(dailyAccuracy)
    };
}

// Функция для генерации рекомендаций по улучшению точности
function generateAccuracyRecommendations(dailyAccuracy) {
    const recommendations = [];

    dailyAccuracy.forEach(day => {
        if (!day.isAccurate) {
            if (day.difference > 100) {
                recommendations.push(`${day.date}: Превышение калорий на ${day.difference} ккал. Уменьшите порции или замените высококалорийные продукты.`);
            } else if (day.difference < -100) {
                recommendations.push(`${day.date}: Недостаток калорий на ${Math.abs(day.difference)} ккал. Добавьте полезные перекусы или увеличьте порции.`);
            }
        }

        if (day.macroAccuracy > 10) {
            recommendations.push(`${day.date}: Несоответствие КБЖУ и калорий (${day.macroAccuracy}%). Проверьте расчеты макронутриентов.`);
        }
    });

    return recommendations;
}

// Функция для коррекции калорий в плане питания
function correctMealPlanCalories(meals, targetCalories, dietMacros) {
    // Группируем блюда по дням
    const mealsByDay = {};

    meals.forEach(meal => {
        const date = new Date(meal.date).toDateString();
        if (!mealsByDay[date]) {
            mealsByDay[date] = [];
        }
        mealsByDay[date].push(meal);
    });

    const correctedMeals = [];

    Object.entries(mealsByDay).forEach(([date, dayMeals]) => {

        const currentCalories = dayMeals.reduce((total, meal) => total + (Number(meal.calories) || 0), 0);
        const difference = targetCalories - currentCalories;

        console.log(`Day ${date}: Current ${currentCalories} kcal, Target ${targetCalories} kcal, Difference ${difference} kcal`);

        // Если разница больше 50 калорий, корректируем
        if (Math.abs(difference) > 50) {
            const correctedDayMeals = adjustDayCalories(dayMeals, difference, dietMacros);
            correctedMeals.push(...correctedDayMeals);
        } else {
            correctedMeals.push(...dayMeals);
        }
    });

    return correctedMeals;
}

// Функция для корректировки калорий в течение дня
function adjustDayCalories(dayMeals, caloriesDifference, dietMacros) {
    const correctedMeals = [...dayMeals];

    // Если нужно добавить калории
    if (caloriesDifference > 0) {
        // Добавляем калории к самому большому блюду (обычно обед или ужин)
        const largestMeal = correctedMeals.reduce((prev, current) =>
            (Number(current.calories) > Number(prev.calories)) ? current : prev
        );

        const mealIndex = correctedMeals.findIndex(meal => meal.id === largestMeal.id);
        if (mealIndex !== -1) {
            const additionalCalories = caloriesDifference;
            const scaleFactor = (Number(largestMeal.calories) + additionalCalories) / Number(largestMeal.calories);

            correctedMeals[mealIndex] = {
                ...largestMeal,
                calories: Math.round(Number(largestMeal.calories) * scaleFactor),
                protein: Math.round(Number(largestMeal.protein) * scaleFactor * 10) / 10,
                carbs: Math.round(Number(largestMeal.carbs) * scaleFactor * 10) / 10,
                fat: Math.round(Number(largestMeal.fat) * scaleFactor * 10) / 10,
                ingredients: largestMeal.ingredients.map(ingredient => {
                    // Увеличиваем порции в ингредиентах
                    return ingredient.replace(/(\d+)г/g, (match, weight) => {
                        const newWeight = Math.round(Number(weight) * scaleFactor);
                        return `${newWeight}г`;
                    });
                })
            };

            console.log(`Added ${additionalCalories} kcal to ${largestMeal.name}`);
        }
    }
    // Если нужно убрать калории
    else if (caloriesDifference < 0) {
        const excessCalories = Math.abs(caloriesDifference);

        // Убираем калории из самого большого блюда
        const largestMeal = correctedMeals.reduce((prev, current) =>
            (Number(current.calories) > Number(prev.calories)) ? current : prev
        );

        const mealIndex = correctedMeals.findIndex(meal => meal.id === largestMeal.id);
        if (mealIndex !== -1) {
            const scaleFactor = Math.max(0.7, (Number(largestMeal.calories) - excessCalories) / Number(largestMeal.calories));

            correctedMeals[mealIndex] = {
                ...largestMeal,
                calories: Math.round(Number(largestMeal.calories) * scaleFactor),
                protein: Math.round(Number(largestMeal.protein) * scaleFactor * 10) / 10,
                carbs: Math.round(Number(largestMeal.carbs) * scaleFactor * 10) / 10,
                fat: Math.round(Number(largestMeal.fat) * scaleFactor * 10) / 10,
                ingredients: largestMeal.ingredients.map(ingredient => {
                    // Уменьшаем порции в ингредиентах
                    return ingredient.replace(/(\d+)г/g, (match, weight) => {
                        const newWeight = Math.round(Number(weight) * scaleFactor);
                        return `${newWeight}г`;
                    });
                })
            };

            console.log(`Removed ${excessCalories} kcal from ${largestMeal.name}`);
        }
    }

    return correctedMeals;
}

// Функция создания резервного плана питания
function createFallbackMealPlan(targetCalories, dietMacros) {
    console.log('Creating fallback meal plan for', targetCalories, 'kcal');

    const today = new Date();
    const plan = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    // Распределение калорий по приемам пищи
    const calorieDistribution = {
        breakfast: Math.round(targetCalories * 0.25),
        lunch: Math.round(targetCalories * 0.35),
        dinner: Math.round(targetCalories * 0.30),
        snack: Math.round(targetCalories * 0.10)
    };

    days.forEach(day => {
        plan[day] = {
            breakfast: {
                name: 'Овсянка с фруктами',
                calories: calorieDistribution.breakfast,
                protein: Math.round(calorieDistribution.breakfast * 0.15 / 4),
                carbs: Math.round(calorieDistribution.breakfast * 0.55 / 4),
                fat: Math.round(calorieDistribution.breakfast * 0.30 / 9),
                time: '08:00',
                ingredients: [
                    'Овсяные хлопья 80г',
                    'Молоко 2.5% 200мл',
                    'Банан 120г',
                    'Орехи грецкие 20г'
                ]
            },
            lunch: {
                name: 'Куриная грудка с рисом',
                calories: calorieDistribution.lunch,
                protein: Math.round(calorieDistribution.lunch * 0.30 / 4),
                carbs: Math.round(calorieDistribution.lunch * 0.45 / 4),
                fat: Math.round(calorieDistribution.lunch * 0.25 / 9),
                time: '13:00',
                ingredients: [
                    'Куриная грудка отварная 200г',
                    'Рис отварной 150г',
                    'Огурец свежий 100г',
                    'Масло подсолнечное 10г'
                ]
            },
            dinner: {
                name: 'Творог с овощами',
                calories: calorieDistribution.dinner,
                protein: Math.round(calorieDistribution.dinner * 0.35 / 4),
                carbs: Math.round(calorieDistribution.dinner * 0.25 / 4),
                fat: Math.round(calorieDistribution.dinner * 0.40 / 9),
                time: '19:00',
                ingredients: [
                    'Творог 5% 200г',
                    'Помидор 150г',
                    'Огурец 100г',
                    'Зелень 20г'
                ]
            }
        };

        // Добавляем перекус если нужно
        if (calorieDistribution.snack > 50) {
            plan[day].snack = {
                name: 'Фруктовый перекус',
                calories: calorieDistribution.snack,
                protein: Math.round(calorieDistribution.snack * 0.10 / 4),
                carbs: Math.round(calorieDistribution.snack * 0.80 / 4),
                fat: Math.round(calorieDistribution.snack * 0.10 / 9),
                time: '16:00',
                ingredients: [
                    'Яблоко 150г',
                    'Орехи 15г'
                ]
            };
        }
    });

    return {
        plan: plan,
        weeklyStatistics: {
            totalCalories: targetCalories * 7,
            averageProtein: Math.round(targetCalories * 0.25 / 4),
            averageCarbs: Math.round(targetCalories * 0.45 / 4),
            averageFat: Math.round(targetCalories * 0.30 / 9)
        },
        cookingRecommendations: [
            'Готовьте блюда на пару или варите для сохранения питательных веществ',
            'Добавляйте свежие овощи к каждому приему пищи',
            'Пейте достаточно воды в течение дня'
        ]
    };
}