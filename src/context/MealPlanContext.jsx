import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { generateMealPlan } from '../services/mealPlanService';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import logger from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MealPlanContext = createContext();

export const useMealPlan = () => {
    const context = useContext(MealPlanContext);
    if (!context) {
        throw new Error('useMealPlan must be used within a MealPlanProvider');
    }
    return context;
};

export const MealPlanProvider = ({ children }) => {
    const { user, getIdToken } = useAuth();
    const [mealPlan, setMealPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatedPlansCount, setGeneratedPlansCount] = useState(0);

    const getAuthHeader = async () => {
        const token = await getIdToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        if (user) {
            fetchMealPlan();
        } else {
            setMeals([]);
            setLoading(false);
        }
    }, [user]);

    const fetchMealPlan = async () => {
        try {
            setLoading(true);
            const headers = await getAuthHeader();
            const response = await fetch(`${API_URL}/meal-plan`, { headers });
            
            if (!response.ok) {
                throw new Error('Failed to fetch meal plan');
            }

            const data = await response.json();
            setMealPlan(data);
            setMeals(data.plan || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateMealPlan = async (userProfile) => {
        if (!user) {
            setError('User not authenticated');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Validate required fields
            const requiredFields = ['age', 'gender', 'weight', 'height', 'dietType', 'calorieTarget', 'activityLevel'];
            const missingFields = requiredFields.filter(field => !userProfile[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Validate numeric fields
            const numericFields = ['age', 'weight', 'height', 'calorieTarget'];
            const invalidFields = numericFields.filter(field => {
                const value = userProfile[field];
                return isNaN(value) || value <= 0;
            });

            if (invalidFields.length > 0) {
                throw new Error(`Invalid values for fields: ${invalidFields.join(', ')}`);
            }

            // Prepare user profile data
            const profileData = {
                ...userProfile,
                age: Number(userProfile.age),
                weight: Number(userProfile.weight),
                height: Number(userProfile.height),
                calorieTarget: Number(userProfile.calorieTarget),
                dietaryPreferences: userProfile.dietaryPreferences || [],
                allergies: userProfile.allergies || [],
                activityLevel: userProfile.activityLevel,
                dietType: userProfile.dietType
            };

            const generatedPlan = await generateMealPlan(profileData);
            
            if (generatedPlan) {
                setMealPlan(generatedPlan);
                await saveMealPlan(generatedPlan);
                setGeneratedPlansCount(prev => prev + 1);
                localStorage.setItem('generatedPlansCount', generatedPlansCount + 1);
            }
        } catch (error) {
            logger.error('Error generating meal plan:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateMealPlan = async (newPlan) => {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_URL}/meal-plan/${mealPlan.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ plan: newPlan })
            });

            if (!response.ok) {
                throw new Error('Failed to update meal plan');
            }

            setMeals(newPlan);
            setMealPlan(prev => ({ ...prev, plan: newPlan }));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const deleteMealPlan = async () => {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_URL}/meal-plan/${mealPlan.id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error('Failed to delete meal plan');
            }

            setMealPlan(null);
            setMeals([]);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const getMealsByDate = (date) => {
        return meals.filter(meal => {
            const mealDate = new Date(meal.date).toDateString();
            return mealDate === new Date(date).toDateString();
        });
    };

    const getMealsByWeek = (startDate) => {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        return meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= startDate && mealDate < endDate;
        });
    };

    const getNutritionSummary = (date) => {
        const dayMeals = getMealsByDate(date);
        return dayMeals.reduce((summary, meal) => ({
            calories: summary.calories + (meal.calories || 0),
            protein: summary.protein + (meal.protein || 0),
            carbs: summary.carbs + (meal.carbs || 0),
            fat: summary.fat + (meal.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    };

    const value = {
        mealPlan,
        meals,
        isLoading,
        loading,
        error,
        generateMealPlan,
        updateMealPlan,
        deleteMealPlan,
        getMealsByDate,
        getMealsByWeek,
        getNutritionSummary,
        generatedPlansCount
    };

    return (
        <MealPlanContext.Provider value={value}>
            {children}
        </MealPlanContext.Provider>
    );
}; 