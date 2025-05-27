import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        let mounted = true;

        const setupAuth = async () => {
            try {
                await setPersistence(auth, browserLocalPersistence);
                
                const unsubscribe = onAuthStateChanged(auth, async (user) => {
                    if (mounted) {
                        if (user) {
                            try {
                                // Получаем данные профиля пользователя
                                const profileData = await getDoc(doc(db, 'users', user.uid));
                                const profile = profileData.exists() ? profileData.data() : null;

                                setUser(user);
                                setUserProfile(profile);
                            } catch (error) {
                                console.error('Error loading user profile:', error);
                                setError(error.message);
                            }
                        } else {
                            setUser(null);
                            setUserProfile(null);
                        }
                        setLoading(false);
                    }
                }, (error) => {
                    if (mounted) {
                        console.error('Auth state change error:', error);
                        setError(error);
                        setLoading(false);
                    }
                });

                return unsubscribe;
            } catch (error) {
                if (mounted) {
                    console.error('Auth setup error:', error);
                    setError(error);
                    setLoading(false);
                }
            }
        };

        const cleanup = setupAuth();

        return () => {
            mounted = false;
            if (cleanup) {
                cleanup.then(unsubscribe => unsubscribe && unsubscribe());
            }
        };
    }, []);

    const signup = async (email, password) => {
        try {
            await setPersistence(auth, browserLocalPersistence);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            setError(null);
            return result;
        } catch (error) {
            console.error('Signup error:', error);
            setError(error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            await setPersistence(auth, browserLocalPersistence);
            const result = await signInWithEmailAndPassword(auth, email, password);
            setError(null);
            return result;
        } catch (error) {
            console.error('Login error:', error);
            setError(error);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            await setPersistence(auth, browserLocalPersistence);
            const result = await signInWithPopup(auth, provider);
            setError(null);
            return result;
        } catch (error) {
            console.error('Google login error:', error);
            setError(error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setError(null);
        } catch (error) {
            console.error('Logout error:', error);
            setError(error);
            throw error;
        }
    };

    const updateUserProfile = async (profileData) => {
        if (!user) throw new Error('No user logged in');

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                ...profileData,
                updatedAt: new Date().toISOString()
            });

            setUserProfile(profileData);
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    };

    const value = {
        user,
        userProfile,
        loading,
        error,
        signup,
        login,
        loginWithGoogle,
        logout,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export { AuthContext };
