import { getAuth } from 'firebase/auth';
import logger from '../utils/logger';

const API_BASE_URL = '/api';

const getAuthHeader = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    const token = await user.getIdToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
};

export const generateMealPlan = async (userProfile) => {
    try {
        const authHeader = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/meal-plan`, {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify(userProfile)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate meal plan');
        }

        const data = await response.json();
        logger.info('Meal plan generated successfully');
        return data;
    } catch (error) {
        logger.error('Error generating meal plan:', error);
        throw error;
    }
};

export const fetchMealPlan = async () => {
    try {
        const authHeader = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/meal-plan`, {
            method: 'GET',
            headers: authHeader
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch meal plan');
        }

        const data = await response.json();
        logger.info('Meal plan fetched successfully');
        return data;
    } catch (error) {
        logger.error('Error fetching meal plan:', error);
        throw error;
    }
}; 