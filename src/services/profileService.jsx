import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const getProfileDataForMealPlan = async (user) => {
    if (!user?.uid) throw new Error('User not found');

    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
            throw new Error('Profile data not found');
        }

        const profileData = userDoc.data();

        // Проверяем обязательные поля
        const requiredFields = ['age', 'gender', 'weight', 'height', 'activityLevel', 'dietType'];
        const missingFields = requiredFields.filter(field => !profileData[field]);

        if (missingFields.length > 0) {
            throw new Error(`Для создания плана питания необходимо заполнить следующие поля: ${missingFields.join(', ')}`);
        }

        // Преобразуем в формат для Gemini
        return {
            age: Number(profileData.age),
            gender: profileData.gender,
            weight: Number(profileData.weight),
            height: Number(profileData.height),
            activityLevel: profileData.activityLevel,
            dietType: profileData.dietType,
            calorieTarget: Number(profileData.calorieTarget) || calculateDefaultCalories(profileData),
            foodPreferences: profileData.dietaryPreferences || [],
            allergies: profileData.allergies || [],
            healthGoals: profileData.healthGoals || []
        };
    } catch (error) {
        console.error('Error getting profile for meal plan:', error);
        throw error;
    }
};

export const updateProfileData = async (userId, profileData) => {
    if (!userId) throw new Error('User ID is required');

    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, profileData, { merge: true });
        return true;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

function calculateDefaultCalories(data) {
    const bmr = data.gender.toLowerCase() === 'female'
        ? 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age)
        : 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);

    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9
    };

    const multiplier = activityMultipliers[data.activityLevel.toLowerCase()] || activityMultipliers.moderate;
    return Math.round(bmr * multiplier);
}
