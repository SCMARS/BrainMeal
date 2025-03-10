const API_KEY = '68f5a52113054b89bd663eb1e553daf6';
const API_URL = "https://api.spoonacular.com/mealplanner/generate";

export const generateMealPlan = async (userData) => {
    try {
        const { weight, age, gender, height, dietType, isWeekly, mealPreferences } = userData;

        const targetCalories = calculateCalories(weight, height, age, gender, dietType);
        const timeFrame = isWeekly ? "week" : "day";

        // Build query parameters
        const queryParams = new URLSearchParams({
            timeFrame,
            targetCalories,
            apiKey: API_KEY
        });

        // Add diet parameter if it matches Spoonacular's accepted values
        if (["vegetarian", "vegan", "gluten-free", "ketogenic", "paleo"].includes(dietType)) {
            queryParams.append("diet", dietType);
        }

        // Add exclude parameter if there are meal preferences
        if (mealPreferences) {
            const allergies = parsePreferences(mealPreferences);
            if (allergies.length > 0) {
                queryParams.append("exclude", allergies.join(','));
            }
        }

        const response = await fetch(`${API_URL}?${queryParams}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch meal plan: ${response.status}`);
        }

        const data = await response.json();
        return formatMealPlanResponse(data, isWeekly);
    } catch (error) {
        console.error("Error generating meal plan:", error);
        throw error;
    }
};

// Parse user preferences to extract allergies or excluded foods
const parsePreferences = (preferences) => {
    const allergies = [];
    const allergyKeywords = [
        'аллергия', 'не люблю', 'не ем', 'исключить',
        'без', 'не переношу', 'allergy', 'exclude'
    ];

    const prefLower = preferences.toLowerCase();

    // Check for common allergens
    const commonAllergens = [
        'молоко', 'milk', 'орехи', 'nuts', 'яйца', 'eggs',
        'соя', 'soy', 'пшеница', 'wheat', 'глютен', 'gluten',
        'арахис', 'peanuts', 'рыба', 'fish', 'морепродукты', 'seafood'
    ];

    for (const allergen of commonAllergens) {
        for (const keyword of allergyKeywords) {
            if (prefLower.includes(`${keyword} ${allergen}`) ||
                prefLower.includes(`${allergen}`)) {
                allergies.push(allergen);
                break;
            }
        }
    }

    return allergies;
};

// Функция для расчёта калорий (примерное значение)
const calculateCalories = (weight, height, age, gender, dietType) => {
    let bmr = gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    // Activity multiplier (using moderate activity as default)
    const activityMultiplier = 1.55;

    // Calculate total daily energy expenditure
    let tdee = bmr * activityMultiplier;

    // Adjust calories based on diet type
    switch(dietType) {
        case "weight_loss":
        case "gentle":
            return Math.max(tdee - 500, 1200); // Deficit but not below 1200
        case "protein":
        case "muscle_gain":
            return tdee + 300; // Surplus for muscle building
        default:
            return tdee; // Maintenance calories
    }
};

// Преобразование ответа Spoonacular в нужный формат
const formatMealPlanResponse = (data, isWeekly) => {
    if (isWeekly) {
        const formattedWeek = {};

        // Process weekly plan
        if (data.week) {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

            days.forEach(day => {
                if (data.week[day]) {
                    formattedWeek[day] = {
                        breakfast: translateMealName(data.week[day].meals[0]?.title || "Нет данных"),
                        lunch: translateMealName(data.week[day].meals[1]?.title || "Нет данных"),
                        dinner: translateMealName(data.week[day].meals[2]?.title || "Нет данных")
                    };
                }
            });
        }

        return formattedWeek;
    } else {
        // Process daily plan
        return {
            breakfast: {
                meal: translateMealName(data.meals?.[0]?.title || "Нет данных"),
                calories: data.meals?.[0]?.nutrients?.calories || 0
            },
            lunch: {
                meal: translateMealName(data.meals?.[1]?.title || "Нет данных"),
                calories: data.meals?.[1]?.nutrients?.calories || 0
            },
            dinner: {
                meal: translateMealName(data.meals?.[2]?.title || "Нет данных"),
                calories: data.meals?.[2]?.nutrients?.calories || 0
            }
        };
    }
};

// Simple function to translate common meal terms to Russian
// In a real app, you'd use a proper translation API
const translateMealName = (mealName) => {
    // This is a very simple translation just to demonstrate the concept
    // Replace common words with Russian equivalents
    let translated = mealName;

    const translations = {
        'Breakfast': 'Завтрак',
        'Lunch': 'Обед',
        'Dinner': 'Ужин',
        'with': 'с',
        'and': 'и',
        'Salad': 'Салат',
        'Chicken': 'Курица',
        'Beef': 'Говядина',
        'Pork': 'Свинина',
        'Rice': 'Рис',
        'Pasta': 'Паста',
        'Eggs': 'Яйца',
        'Oatmeal': 'Овсянка',
        'Toast': 'Тост',
        'Soup': 'Суп',
        'Fish': 'Рыба',
        'Vegetables': 'Овощи',
        'Fruit': 'Фрукты'
    };

    // Very naive translation approach - just for demonstration
    Object.entries(translations).forEach(([eng, rus]) => {
        const regex = new RegExp(eng, 'gi');
        translated = translated.replace(regex, rus);
    });

    return translated;
};