// Using a more reliable API key and ensuring proper error handling
const API_KEY = '68f5a52113054b89bd663eb1e553daf6';
const API_URL = "https://api.spoonacular.com/mealplanner/generate";

export const generateMealPlan = async (userData) => {
    try {
        const { weight, age, gender, height, dietType, isWeekly, mealPreferences } = userData;

        // Calculate target calories based on user data
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

        // Make API request
        const response = await fetch(`${API_URL}?${queryParams}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch meal plan: ${response.status}`);
        }

        const data = await response.json();

        // If no data or empty response, use fallback data
        if (!data || (isWeekly && !data.week) || (!isWeekly && !data.meals)) {
            return generateFallbackMealPlan(isWeekly, targetCalories);
        }

        return formatMealPlanResponse(data, isWeekly, targetCalories);
    } catch (error) {
        console.error("Error generating meal plan:", error);
        // Return fallback data in case of any error
        return generateFallbackMealPlan(
            userData.isWeekly,
            calculateCalories(userData.weight, userData.height, userData.age, userData.gender, userData.dietType)
        );
    }
};

// Function to generate fallback meal plans when API fails
const generateFallbackMealPlan = (isWeekly, targetCalories) => {
    // Calculate calories per meal
    const breakfastCalories = Math.round(targetCalories * 0.3);
    const lunchCalories = Math.round(targetCalories * 0.4);
    const dinnerCalories = Math.round(targetCalories * 0.3);

    // Default meal options
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
            // Use different meals for each day
            const breakfast = breakfastOptions[index % breakfastOptions.length];
            const lunch = lunchOptions[index % lunchOptions.length];
            const dinner = dinnerOptions[index % dinnerOptions.length];

            formattedWeek[day] = {
                breakfast,
                lunch,
                dinner,
                breakfast_calories: breakfastCalories,
                lunch_calories: lunchCalories,
                dinner_calories: dinnerCalories
            };
        });

        return formattedWeek;
    } else {
        // Return daily plan
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

// Parse user preferences to extract allergies or excluded foods
const parsePreferences = (preferences) => {
    if (!preferences) return [];

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

// Function to calculate calories (approximate value)
const calculateCalories = (weight, height, age, gender, dietType) => {
    // Default values in case of missing data
    weight = Number(weight) || 70;
    height = Number(height) || 170;
    age = Number(age) || 30;

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
            return Math.max(tdee - 500, 1200); // Deficit but not below 1200
        case "gentle":
            return Math.max(tdee - 300, 1200); // Smaller deficit for gentle diet
        case "protein":
        case "muscle_gain":
            return tdee + 300; // Surplus for muscle building
        default:
            return tdee; // Maintenance calories
    }
};

// Transform Spoonacular response to required format
const formatMealPlanResponse = (data, isWeekly, targetCalories) => {
    if (isWeekly) {
        const formattedWeek = {};

        // Process weekly plan
        if (data.week) {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

            days.forEach(day => {
                if (data.week[day] && data.week[day].meals) {
                    const meals = data.week[day].meals;
                    const breakfast = meals.length > 0 ? meals[0] : null;
                    const lunch = meals.length > 1 ? meals[1] : null;
                    const dinner = meals.length > 2 ? meals[2] : null;

                    formattedWeek[day] = {
                        breakfast: breakfast ? translateMealToRussian(breakfast.title || "Нет данных") : "Нет данных",
                        lunch: lunch ? translateMealToRussian(lunch.title || "Нет данных") : "Нет данных",
                        dinner: dinner ? translateMealToRussian(dinner.title || "Нет данных") : "Нет данных",
                        breakfast_calories: breakfast && breakfast.nutrients ?
                            Math.round(Number(breakfast.nutrients.calories) || 0) : Math.round(targetCalories * 0.3),
                        lunch_calories: lunch && lunch.nutrients ?
                            Math.round(Number(lunch.nutrients.calories) || 0) : Math.round(targetCalories * 0.4),
                        dinner_calories: dinner && dinner.nutrients ?
                            Math.round(Number(dinner.nutrients.calories) || 0) : Math.round(targetCalories * 0.3)
                    };
                }
            });
        }

        return formattedWeek;
    } else {
        // Process daily plan with safe defaults
        if (!data.meals || data.meals.length === 0) {
            return {
                breakfast: { meal: "Овсянка с фруктами", calories: 350 },
                lunch: { meal: "Салат с курицей", calories: 450 },
                dinner: { meal: "Запеченная рыба с овощами", calories: 400 },
                snack: { meal: "Фрукты", calories: 100 }
            };
        }

        return {
            breakfast: {
                meal: data.meals.length > 0 ?
                    translateMealToRussian(data.meals[0].title || "Нет данных") : "Нет данных",
                calories: data.meals.length > 0 && data.meals[0].nutrients ?
                    Math.round(Number(data.meals[0].nutrients.calories) || 0) : Math.round(targetCalories * 0.3)
            },
            lunch: {
                meal: data.meals.length > 1 ?
                    translateMealToRussian(data.meals[1].title || "Нет данных") : "Нет данных",
                calories: data.meals.length > 1 && data.meals[1].nutrients ?
                    Math.round(Number(data.meals[1].nutrients.calories) || 0) : Math.round(targetCalories * 0.4)
            },
            dinner: {
                meal: data.meals.length > 2 ?
                    translateMealToRussian(data.meals[2].title || "Нет данных") : "Нет данных",
                calories: data.meals.length > 2 && data.meals[2].nutrients ?
                    Math.round(Number(data.meals[2].nutrients.calories) || 0) : Math.round(targetCalories * 0.3)
            },
            snack: {
                meal: "Фрукты или орехи",
                calories: Math.round(targetCalories * 0.1)
            }
        };
    }
};

// Extended function to translate meal names to Russian
const translateMealToRussian = (mealName) => {
    if (!mealName || mealName === "Нет данных") return mealName;

    // Check if the meal is in the common meals database
    const commonMeals = {
        "Oatmeal with Banana": "Овсянка с бананом",
        "Scrambled Eggs with Toast": "Яичница с тостами",
        "Avocado Toast": "Тост с авокадо",
        "Greek Yogurt with Berries": "Греческий йогурт с ягодами",
        "Fruit Smoothie": "Фруктовый смузи",
        "Grilled Chicken Salad": "Салат с жареной курицей",
        "Turkey Sandwich": "Сэндвич с индейкой",
        "Vegetable Soup": "Овощной суп",
        "Pasta with Tomato Sauce": "Паста с томатным соусом",
        "Caesar Salad": "Салат Цезарь",
        "Beef Stew": "Тушеная говядина",
        "Salmon with Rice": "Лосось с рисом",
        "Grilled Vegetables": "Овощи на гриле",
        "Mashed Potatoes": "Картофельное пюре",
        "Chicken Noodle Soup": "Куриный суп с лапшой",
        "Tuna Salad": "Салат с тунцом",
        "Rice Bowl": "Рисовый боул",
        "Burrito Bowl": "Буррито боул",
        "Mushroom Risotto": "Ризотто с грибами",
        "Chicken Wrap": "Ролл с курицей",
        "Peanut Butter Sandwich": "Бутерброд с арахисовым маслом",
        "Egg Sandwich": "Сэндвич с яйцом",
        "Pancakes with Maple Syrup": "Блины с кленовым сиропом",
        "Waffles with Berries": "Вафли с ягодами",
        "Cottage Cheese with Fruit": "Творог с фруктами",
        "Ham and Cheese Sandwich": "Сэндвич с ветчиной и сыром",
        "Vegetable Stir Fry": "Жареные овощи",
        "Beef Stroganoff": "Бефстроганов",
        "Chicken Kiev": "Котлета по-киевски",
        "Borscht": "Борщ",
        "Stuffed Cabbage Rolls": "Голубцы",
        "Pelmeni": "Пельмени",
        "Vareniki": "Вареники",
        "Potato Pancakes": "Драники",
        "Buckwheat Porridge": "Гречневая каша",
        "Pickled Vegetables": "Соленые овощи",
        "Herring Under Fur Coat": "Селедка под шубой",
        "Olivier Salad": "Салат Оливье",
        "Vinaigrette Salad": "Винегрет",
        "Shchi": "Щи",
        "Kasha": "Каша",
        "Rice Porridge": "Рисовая каша",
        "Milk Porridge": "Молочная каша"
    };

    if (commonMeals[mealName]) {
        return commonMeals[mealName];
    }

    // Extensive dictionary for translating culinary terms and ingredients
    const dictionary = {
        'Breakfast': 'Завтрак',
        'Lunch': 'Обед',
        'Dinner': 'Ужин',
        'Snack': 'Перекус',
        'Brunch': 'Поздний завтрак',
        'Baked': 'Запеченный',
        'Grilled': 'Жареный на гриле',
        'Fried': 'Жареный',
        'Boiled': 'Вареный',
        'Steamed': 'Приготовленный на пару',
        'Roasted': 'Запеченный',
        'Stewed': 'Тушеный',
        'Sautéed': 'Обжаренный',
        'Poached': 'Припущенный',
        'Chicken': 'Курица',
        'Beef': 'Говядина',
        'Pork': 'Свинина',
        'Lamb': 'Баранина',
        'Turkey': 'Индейка',
        'Duck': 'Утка',
        'Fish': 'Рыба',
        'Salmon': 'Лосось',
        'Tuna': 'Тунец',
        'Cod': 'Треска',
        'Shrimp': 'Креветки',
        'Crab': 'Краб',
        'Lobster': 'Лобстер',
        'Bacon': 'Бекон',
        'Ham': 'Ветчина',
        'Sausage': 'Колбаса',
        'Tomato': 'Помидор',
        'Tomatoes': 'Помидоры',
        'Potato': 'Картофель',
        'Potatoes': 'Картофель',
        'Carrot': 'Морковь',
        'Carrots': 'Морковь',
        'Onion': 'Лук',
        'Onions': 'Лук',
        'Garlic': 'Чеснок',
        'Cucumber': 'Огурец',
        'Cucumbers': 'Огурцы',
        'Lettuce': 'Листовой салат',
        'Spinach': 'Шпинат',
        'Broccoli': 'Брокколи',
        'Cauliflower': 'Цветная капуста',
        'Cabbage': 'Капуста',
        'Pepper': 'Перец',
        'Peppers': 'Перцы',
        'Corn': 'Кукуруза',
        'Peas': 'Горох',
        'Beans': 'Фасоль',
        'Mushroom': 'Гриб',
        'Mushrooms': 'Грибы',
        'Eggplant': 'Баклажан',
        'Zucchini': 'Цуккини',
        'Apple': 'Яблоко',
        'Apples': 'Яблоки',
        'Banana': 'Банан',
        'Bananas': 'Бананы',
        'Orange': 'Апельсин',
        'Oranges': 'Апельсины',
        'Lemon': 'Лимон',
        'Lemons': 'Лимоны',
        'Strawberry': 'Клубника',
        'Strawberries': 'Клубника',
        'Blueberry': 'Черника',
        'Blueberries': 'Черника',
        'Raspberry': 'Малина',
        'Raspberries': 'Малина',
        'Blackberry': 'Ежевика',
        'Blackberries': 'Ежевика',
        'Pineapple': 'Ананас',
        'Mango': 'Манго',
        'Peach': 'Персик',
        'Peaches': 'Персики',
        'Pear': 'Груша',
        'Pears': 'Груши',
        'Grape': 'Виноград',
        'Grapes': 'Виноград',
        'Cherry': 'Вишня',
        'Cherries': 'Вишня',
        'Avocado': 'Авокадо',
        'Kiwi': 'Киви',
        'Watermelon': 'Арбуз',
        'Melon': 'Дыня',
        'Rice': 'Рис',
        'Pasta': 'Паста',
        'Noodles': 'Лапша',
        'Spaghetti': 'Спагетти',
        'Macaroni': 'Макароны',
        'Quinoa': 'Киноа',
        'Buckwheat': 'Гречка',
        'Oats': 'Овес',
        'Oatmeal': 'Овсянка',
        'Cereal': 'Хлопья',
        'Barley': 'Ячмень',
        'Couscous': 'Кускус',
        'Milk': 'Молоко',
        'Cheese': 'Сыр',
        'Yogurt': 'Йогурт',
        'Butter': 'Масло',
        'Cream': 'Сливки',
        'Sour Cream': 'Сметана',
        'Cottage Cheese': 'Творог',
        'Bread': 'Хлеб',
        'Toast': 'Тост',
        'Bun': 'Булочка',
        'Roll': 'Рулет',
        'Pie': 'Пирог',
        'Cake': 'Торт',
        'Muffin': 'Маффин',
        'Pancake': 'Блин',
        'Pancakes': 'Блины',
        'Waffle': 'Вафля',
        'Waffles': 'Вафли',
        'Salad': 'Салат',
        'Soup': 'Суп',
        'Sandwich': 'Сэндвич',
        'Pizza': 'Пицца',
        'Burger': 'Бургер',
        'Steak': 'Стейк',
        'Casserole': 'Запеканка',
        'Stir fry': 'Жаркое',
        'Omelet': 'Омлет',
        'Scrambled eggs': 'Яичница-болтунья',
        'Fried eggs': 'Яичница-глазунья',
        'Smoothie': 'Смузи',
        'Wrap': 'Ролл',
        'Bowl': 'Боул',
        'Nut': 'Орех',
        'Nuts': 'Орехи',
        'Almond': 'Миндаль',
        'Almonds': 'Миндаль',
        'Peanut': 'Арахис',
        'Peanuts': 'Арахис',
        'Walnut': 'Грецкий орех',
        'Walnuts': 'Грецкие орехи',
        'Cashew': 'Кешью',
        'Cashews': 'Кешью',
        'Seed': 'Семя',
        'Seeds': 'Семена',
        'Flaxseed': 'Семена льна',
        'Chia': 'Чиа',
        'Sauce': 'Соус',
        'Dressing': 'Заправка',
        'Oil': 'Масло',
        'Olive oil': 'Оливковое масло',
        'Vinegar': 'Уксус',
        'Salt': 'Соль',
        'Spice': 'Специя',
        'Spices': 'Специи',
        'Herb': 'Трава',
        'Herbs': 'Травы',
        'Ketchup': 'Кетчуп',
        'Mayonnaise': 'Майонез',
        'Mustard': 'Горчица',
        'Sugar': 'Сахар',
        'Honey': 'Мёд',
        'Chocolate': 'Шоколад',
        'Candy': 'Конфета',
        'Cookie': 'Печенье',
        'Cookies': 'Печенье',
        'Ice cream': 'Мороженое',
        'Water': 'Вода',
        'Tea': 'Чай',
        'Coffee': 'Кофе',
        'Juice': 'Сок',
        'with': 'с',
        'and': 'и',
        'or': 'или',
        'in': 'в',
        'on': 'на',
        'under': 'под',
        'over': 'над',
        'for': 'для',
        'of': '',
        'the': '',
        'a': '',
        'an': ''
    };

    const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
    let translatedMeal = mealName;

    for (const eng of sortedKeys) {
        const regex = new RegExp(`(^|[^a-zA-Z])${eng}($|[^a-zA-Z])`, 'gi');
        translatedMeal = translatedMeal.replace(regex, (match, p1, p2) => {
            return `${p1}${dictionary[eng]}${p2}`;
        });
    }

    translatedMeal = translatedMeal
        .replace(/\s+/g, ' ')
        .replace(/ ,/g, ',')
        .trim();

    return translatedMeal.charAt(0).toUpperCase() + translatedMeal.slice(1);
};

// Improved function to simplify complex dishes if there is no direct translation
const simplifyMeal = (mealName) => {
    const mealNameLower = mealName.toLowerCase();

    const ingredientMappings = {
        'chicken': 'Блюдо с курицей',
        'turkey': 'Блюдо с индейкой',
        'beef': 'Блюдо с говядиной',
        'pork': 'Блюдо со свининой',
        'fish': 'Рыбное блюдо',
        'salmon': 'Блюдо с лососем',
        'tuna': 'Блюдо с тунцом',
        'rice': 'Блюдо с рисом',
        'pasta': 'Блюдо с пастой',
        'noodle': 'Блюдо с лапшой',
        'potato': 'Блюдо с картофелем',
        'egg': 'Блюдо с яйцом',
        'cheese': 'Блюдо с сыром',
        'vegetable': 'Овощное блюдо',
        'tomato': 'Блюдо с помидорами',
        'salad': 'Салат',
        'soup': 'Суп',
        'sandwich': 'Сэндвич',
        'toast': 'Тост',
        'bread': 'Хлебное блюдо',
        'fruit': 'Фруктовое блюдо',
        'berry': 'Блюдо с ягодами',
        'yogurt': 'Йогурт',
        'oatmeal': 'Овсянка',
        'cereal': 'Хлопья',
        'pancake': 'Блины',
        'waffle': 'Вафли',
        'smoothie': 'Смузи',
        'protein': 'Протеиновое блюдо',
        'quinoa': 'Блюдо с киноа',
        'avocado': 'Блюдо с авокадо',
        'wrap': 'Ролл',
        'bowl': 'Боул'
    };

    const mealTypes = {
        'breakfast': 'Завтрак',
        'lunch': 'Обед',
        'dinner': 'Ужин',
        'snack': 'Перекус',
        'dessert': 'Десерт',
        'appetizer': 'Закуска',
        'salad': 'Салат',
        'soup': 'Суп',
        'smoothie': 'Смузи',
        'sandwich': 'Сэндвич',
        'wrap': 'Ролл',
        'pizza': 'Пицца',
        'burger': 'Бургер',
        'stew': 'Рагу',
        'casserole': 'Запеканка',
        'stir fry': 'Жаркое',
        'curry': 'Карри',
        'omelet': 'Омлет'
    };

    for (const [engType, rusType] of Object.entries(mealTypes)) {
        if (mealNameLower.includes(engType)) {
            return rusType;
        }
    }

    for (const [ingredient, russianName] of Object.entries(ingredientMappings)) {
        if (mealNameLower.includes(ingredient)) {
            return russianName;
        }
    }

    if (mealNameLower.includes('breakfast') ||
        mealNameLower.includes('morning') ||
        mealNameLower.includes('oatmeal') ||
        mealNameLower.includes('cereal')) {
        return "Завтрак";
    }

    if (mealNameLower.endsWith('salad')) {
        return "Салат";
    } else if (mealNameLower.endsWith('soup')) {
        return "Суп";
    } else if (mealNameLower.endsWith('sandwich') || mealNameLower.includes('toast')) {
        return "Сэндвич";
    } else if (mealNameLower.endsWith('bowl') || mealNameLower.includes('bowl')) {
        return "Боул";
    } else if (mealNameLower) {
        return "Блюдо";
    }

    return "Блюдо";
};
