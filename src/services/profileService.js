export const updateProfileData = async (userData, formData) => {
    try {
        const updatedUserData = {
            ...userData,
            name: formData.name,
            age: Number(formData.age),
            weight: Number(formData.weight),
            height: Number(formData.height),
            activityLevel: formData.activityLevel,
            targetCalories: Number(formData.targetCalories),
            dietaryPreferences: formData.dietaryPreferences,
            allergies: formData.allergies,
            goals: formData.goals
        };

        // Сохраняем в localStorage
        localStorage.setItem('userData', JSON.stringify(updatedUserData));

        // Возвращаем обновленные данные
        return updatedUserData;
    } catch (error) {
        console.error('Error updating profile data:', error);
        throw error;
    }
}; 