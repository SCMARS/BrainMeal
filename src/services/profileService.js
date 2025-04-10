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

export const saveProfileData = async (profileData) => {
    try {
        const authHeader = await getAuthHeader();
        const auth = getAuth();
        const user = auth.currentUser;

        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify({
                firebaseId: user.uid,
                ...profileData
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save profile data');
        }

        const data = await response.json();
        logger.info('Profile data saved successfully');
        return data;
    } catch (error) {
        logger.error('Error saving profile data:', error);
        throw error;
    }
};

export const getProfileData = async () => {
    try {
        const authHeader = await getAuthHeader();
        const auth = getAuth();
        const user = auth.currentUser;

        const response = await fetch(`${API_BASE_URL}/profile/${user.uid}`, {
            method: 'GET',
            headers: authHeader
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch profile data');
        }

        const data = await response.json();
        logger.info('Profile data fetched successfully');
        return data;
    } catch (error) {
        logger.error('Error fetching profile data:', error);
        throw error;
    }
};

export const updateProfileData = async (profileData) => {
    try {
        const authHeader = await getAuthHeader();
        const auth = getAuth();
        const user = auth.currentUser;

        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify({
                firebaseId: user.uid,
                ...profileData
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile data');
        }

        const data = await response.json();
        logger.info('Profile data updated successfully');
        return data;
    } catch (error) {
        logger.error('Error updating profile data:', error);
        throw error;
    }
}; 