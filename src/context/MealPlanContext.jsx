import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { generateMealPlan as generateMealPlanService } from '../services/geminiService';

const MealPlanContext = createContext();

export const useMealPlan = () => {
    const context = useContext(MealPlanContext);
    if (!context) {
        throw new Error('useMealPlan must be used within a MealPlanProvider');
    }
    return context;
};

export const MealPlanProvider = ({ children }) => {
    const { user } = useAuth();
    const [mealPlan, setMealPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchMeals();
        } else {
            setMeals([]);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        const loadMealPlan = () => {
            try {
                const storedPlan = localStorage.getItem('mealPlan');
                if (storedPlan) {
                    const parsedPlan = JSON.parse(storedPlan);
                    setMeals(parsedPlan.plan || []);
                }
            } catch (err) {
                console.error('Error loading meal plan:', err);
                setError('Ошибка загрузки плана питания');
            }
        };

        loadMealPlan();
    }, []);

    useEffect(() => {
        if (mealPlan && mealPlan.length > 0) {
            localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        }
    }, [mealPlan]);

    const fetchMeals = async () => {
        try {
            setLoading(true);
            const mealsRef = collection(db, 'meals');
            const q = query(mealsRef, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const mealsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMeals(mealsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addMeal = async (mealData) => {
        try {
            const mealsRef = collection(db, 'meals');
            const docRef = await addDoc(mealsRef, {
                ...mealData,
                userId: user.uid,
                createdAt: new Date().toISOString()
            });
            setMeals(prev => [...prev, { id: docRef.id, ...mealData }]);
            return docRef.id;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updateMeal = async (mealId, mealData) => {
        try {
            const mealRef = doc(db, 'meals', mealId);
            await updateDoc(mealRef, mealData);
            setMeals(prev => prev.map(meal => 
                meal.id === mealId ? { ...meal, ...mealData } : meal
            ));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const deleteMeal = async (mealId) => {
        try {
            const mealRef = doc(db, 'meals', mealId);
            await deleteDoc(mealRef);
            setMeals(prev => prev.filter(meal => meal.id !== mealId));
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

    const generateMealPlan = async (userData, existingMeals = []) => {
        setIsLoading(true);
        setError(null);

        try {
            const plan = await generateMealPlanService(userData, existingMeals);
            setMealPlan(plan);

            // Увеличиваем счетчик сгенерированных планов
            const planCount = parseInt(localStorage.getItem('mealPlanCount') || '0');
            localStorage.setItem('mealPlanCount', (planCount + 1).toString());

            return plan;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateMealPlan = (newPlan) => {
        try {
            setMeals(newPlan);
            const mealPlan = {
                plan: newPlan,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        } catch (err) {
            console.error('Error updating meal plan:', err);
            setError('Ошибка обновления плана питания');
        }
    };

    const value = {
        mealPlan,
        isLoading,
        meals,
        loading,
        error,
        addMeal,
        updateMeal,
        deleteMeal,
        getMealsByDate,
        getMealsByWeek,
        getNutritionSummary,
        refreshMeals: fetchMeals,
        generateMealPlan,
        updateMealPlan
    };

    return (
        <MealPlanContext.Provider value={value}>
            {children}
        </MealPlanContext.Provider>
    );
}; 