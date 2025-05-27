import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    deleteDoc,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { generateMealPlan as generateMealPlanService } from '../services/geminiService';

const MealPlanContext = createContext();

export const useMealPlan = () => useContext(MealPlanContext);

export const MealPlanProvider = ({ children }) => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const [mealPlan, setMealPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Функция для получения блюд из Firebase с реальным временем
    const fetchMeals = useCallback(async () => {
        try {
            setLoading(true);
            const mealsRef = collection(db, 'meals');

            // Упрощенный запрос без orderBy для избежания ошибки индекса
            const q = query(
                mealsRef,
                where('userId', '==', user.uid)
            );

            // Используем onSnapshot для обновлений в реальном времени
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const mealsData = [];
                snapshot.forEach((doc) => {
                    mealsData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                // Сортируем на клиенте по дате создания (новые сначала)
                mealsData.sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.date || 0);
                    const dateB = new Date(b.createdAt || b.date || 0);
                    return dateB - dateA;
                });

                console.log('📊 Loaded meals from Firebase:', mealsData.length);
                setMeals(mealsData);
                setLoading(false);
                setError(null);

                // Обновляем локальный кэш
                localStorage.setItem('cachedMeals', JSON.stringify({
                    userId: user.uid,
                    meals: mealsData,
                    timestamp: Date.now()
                }));
            }, (err) => {
                console.error('❌ Error fetching meals:', err);
                setError('Ошибка загрузки планов питания');
                setLoading(false);

                // Загрузка из кэша при ошибке сети
                const cachedData = localStorage.getItem('cachedMeals');
                if (cachedData) {
                    try {
                        const { meals: cachedMeals, userId } = JSON.parse(cachedData);
                        if (userId === user.uid) {
                            console.log('📱 Loading meals from cache');
                            setMeals(cachedMeals);
                        }
                    } catch (cacheError) {
                        console.error('Error parsing cached meals:', cacheError);
                    }
                }
            });

            // Возвращаем функцию отписки для очистки
            return unsubscribe;
        } catch (err) {
            console.error('❌ Error setting up meals listener:', err);
            setError('Ошибка подключения к базе данных');
            setLoading(false);
        }
    }, [user]);

    // Загрузка данных при изменении пользователя
    useEffect(() => {
        if (user) {
            fetchMeals();
        } else {
            setMeals([]);
            setLoading(false);
        }
    }, [user, fetchMeals]);

    // Генерация плана питания
    const generateMealPlan = async (userData) => {
        setIsLoading(true);
        setError(null);

        try {
            // Проверяем обязательные поля профиля
            const requiredFields = ['age', 'gender', 'weight', 'height', 'dietType', 'activityLevel'];
            const missingFields = requiredFields.filter(field => !userData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Не заполнены обязательные поля профиля: ${missingFields.join(', ')}`);
            }

            // Генерация плана питания
            console.log('Calling generateMealPlanService with userData:', userData);
            const userDataWithLanguage = { ...userData, language };
            const generatedPlan = await generateMealPlanService(userDataWithLanguage, meals);
            console.log('Generated plan received:', generatedPlan);

            if (!generatedPlan || !generatedPlan.plan) {
                console.error('Invalid plan structure:', generatedPlan);
                throw new Error('Не удалось сгенерировать план питания');
            }

            console.log('Setting meal plan to state:', generatedPlan);
            setMealPlan(generatedPlan);
            console.log('Meal plan set successfully');
            return generatedPlan;
        } catch (error) {
            console.error('Error generating meal plan:', error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Обновление плана питания
    const updateMealPlan = async (newPlan) => {
        if (!user?.uid) return;

        try {
            setIsLoading(true);
            console.log('🔄 updateMealPlan called with:', newPlan);

            // Определяем, что передали - массив или объект с планом
            let mealsToSave;
            if (Array.isArray(newPlan)) {
                mealsToSave = newPlan;
            } else if (newPlan && newPlan.plan) {
                mealsToSave = newPlan.plan;
            } else {
                console.error('❌ Invalid plan format:', newPlan);
                throw new Error('Неверный формат плана');
            }

            console.log('💾 Meals to save:', mealsToSave.length, 'items');

            // Сохраняем каждое блюдо отдельно в коллекцию meals
            const batch = [];
            const mealsRef = collection(db, 'meals');

            // Удаляем старые блюда пользователя
            const oldMealsQuery = query(mealsRef, where('userId', '==', user.uid));
            const oldMealsSnapshot = await getDocs(oldMealsQuery);

            for (const doc of oldMealsSnapshot.docs) {
                batch.push(deleteDoc(doc.ref));
            }

            // Добавляем новые блюда
            for (const meal of mealsToSave) {
                const mealData = {
                    ...meal,
                    userId: user.uid,
                    createdAt: meal.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                batch.push(addDoc(mealsRef, mealData));
            }

            // Выполняем все операции
            await Promise.all(batch);

            // Также сохраняем общий план в mealPlans
            const mealPlanRef = doc(db, 'mealPlans', user.uid);
            const updatedPlan = {
                meals: mealsToSave,
                updatedAt: new Date().toISOString(),
                userId: user.uid,
                totalMeals: mealsToSave.length,
                ...(newPlan.generatedAt && { generatedAt: newPlan.generatedAt })
            };

            await setDoc(mealPlanRef, updatedPlan, { merge: true });

            // Обновляем локальное состояние (onSnapshot обновит автоматически)
            if (newPlan && typeof newPlan === 'object' && !Array.isArray(newPlan)) {
                setMealPlan(newPlan);
            }

            console.log('✅ Meal plan updated successfully');

        } catch (error) {
            console.error('❌ Error updating meal plan:', error);
            setError('Ошибка сохранения плана питания');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Добавление отдельного блюда
    const addMeal = async (mealData) => {
        if (!user?.uid) return;

        try {
            setIsLoading(true);
            const mealsRef = collection(db, 'meals');

            const newMeal = {
                ...mealData,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            await addDoc(mealsRef, newMeal);
            console.log('✅ Meal added successfully');

        } catch (error) {
            console.error('❌ Error adding meal:', error);
            setError('Ошибка добавления блюда');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Обновление отдельного блюда
    const updateMeal = async (mealId, mealData) => {
        if (!user?.uid) return;

        try {
            setIsLoading(true);
            console.log('🔄 Updating meal with ID:', mealId);

            // Сначала найдем документ по кастомному ID или Firebase ID
            const mealsRef = collection(db, 'meals');
            let mealDocRef = null;

            // Попробуем найти по кастомному ID в поле id
            const q = query(
                mealsRef,
                where('userId', '==', user.uid),
                where('id', '==', mealId)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Найден документ по кастомному ID
                mealDocRef = querySnapshot.docs[0].ref;
                console.log('📄 Found meal by custom ID');
            } else {
                // Попробуем использовать mealId как Firebase document ID
                try {
                    mealDocRef = doc(db, 'meals', mealId);
                    // Проверим, существует ли документ
                    const docSnap = await getDoc(mealDocRef);
                    if (!docSnap.exists()) {
                        throw new Error('Document not found');
                    }
                    console.log('📄 Found meal by Firebase ID');
                } catch (docError) {
                    console.error('❌ Meal not found:', docError);
                    throw new Error('Блюдо не найдено');
                }
            }

            const updatedMeal = {
                ...mealData,
                updatedAt: new Date().toISOString()
            };

            await updateDoc(mealDocRef, updatedMeal);
            console.log('✅ Meal updated successfully');

        } catch (error) {
            console.error('❌ Error updating meal:', error);
            setError('Ошибка обновления блюда');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Удаление отдельного блюда
    const deleteMeal = async (mealId) => {
        if (!user?.uid) return;

        try {
            setIsLoading(true);
            console.log('🗑️ Deleting meal with ID:', mealId);

            // Сначала найдем документ по кастомному ID или Firebase ID
            const mealsRef = collection(db, 'meals');
            let mealDocRef = null;

            // Попробуем найти по кастомному ID в поле id
            const q = query(
                mealsRef,
                where('userId', '==', user.uid),
                where('id', '==', mealId)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Найден документ по кастомному ID
                mealDocRef = querySnapshot.docs[0].ref;
                console.log('📄 Found meal by custom ID for deletion');
            } else {
                // Попробуем использовать mealId как Firebase document ID
                try {
                    mealDocRef = doc(db, 'meals', mealId);
                    // Проверим, существует ли документ
                    const docSnap = await getDoc(mealDocRef);
                    if (!docSnap.exists()) {
                        throw new Error('Document not found');
                    }
                    console.log('📄 Found meal by Firebase ID for deletion');
                } catch (docError) {
                    console.error('❌ Meal not found for deletion:', docError);
                    throw new Error('Блюдо не найдено');
                }
            }

            await deleteDoc(mealDocRef);
            console.log('✅ Meal deleted successfully');

        } catch (error) {
            console.error('❌ Error deleting meal:', error);
            setError('Ошибка удаления блюда');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Очистка всех блюд пользователя
    const clearAllMeals = async () => {
        if (!user?.uid) return;

        try {
            setIsLoading(true);
            const mealsRef = collection(db, 'meals');
            const q = query(mealsRef, where('userId', '==', user.uid));
            const snapshot = await getDocs(q);

            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            console.log('✅ All meals cleared successfully');

        } catch (error) {
            console.error('❌ Error clearing meals:', error);
            setError('Ошибка очистки блюд');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Генерация отдельного блюда по типу
    const generateSingleMeal = async (mealType, userData, targetDate) => {
        if (!user?.uid) return;

        try {
            setIsLoading(true);
            setError(null);

            // Проверяем обязательные поля профиля
            const requiredFields = ['age', 'gender', 'weight', 'height', 'dietType', 'activityLevel'];
            const missingFields = requiredFields.filter(field => !userData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Не заполнены обязательные поля профиля: ${missingFields.join(', ')}`);
            }

            // Генерируем блюдо через сервис
            const generatedMeal = await generateMealPlanService({
                ...userData,
                language,
                singleMealType: mealType,
                targetDate: targetDate.toISOString()
            }, meals);

            if (!generatedMeal || !generatedMeal.plan || generatedMeal.plan.length === 0) {
                throw new Error('Не удалось сгенерировать блюдо');
            }

            // Берем первое сгенерированное блюдо
            const newMeal = generatedMeal.plan[0];

            // Добавляем блюдо в Firebase
            await addMeal(newMeal);

            console.log('✅ Single meal generated and added successfully');
            return newMeal;

        } catch (error) {
            console.error('❌ Error generating single meal:', error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        mealPlan,
        isLoading,
        meals,
        loading,
        error,
        generateMealPlan,
        updateMealPlan,
        fetchMeals,
        addMeal,
        updateMeal,
        deleteMeal,
        clearAllMeals,
        generateSingleMeal
    };

    return (
        <MealPlanContext.Provider value={value}>
            {children}
        </MealPlanContext.Provider>
    );
};

MealPlanProvider.propTypes = {
    children: PropTypes.node.isRequired
};
