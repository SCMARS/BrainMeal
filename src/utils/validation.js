const validateProfile = (data) => {
    const errors = {};

    // Проверяем обязательные поля
    const requiredFields = ['age', 'gender', 'weight', 'height', 'dietType', 'activityLevel'];
    requiredFields.forEach(field => {
        if (!data[field]) {
            errors[field] = `Поле ${field} обязательно для заполнения`;
        }
    });

    // Проверяем числовые поля
    if (data.age && (isNaN(Number(data.age)) || Number(data.age) <= 0)) {
        errors.age = 'Возраст должен быть положительным числом';
    }
    if (data.weight && (isNaN(Number(data.weight)) || Number(data.weight) <= 0)) {
        errors.weight = 'Вес должен быть положительным числом';
    }
    if (data.height && (isNaN(Number(data.height)) || Number(data.height) <= 0)) {
        errors.height = 'Рост должен быть положительным числом';
    }
    if (data.calorieTarget && (isNaN(Number(data.calorieTarget)) || Number(data.calorieTarget) <= 0)) {
        errors.calorieTarget = 'Целевые калории должны быть положительным числом';
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

export { validateProfile };

