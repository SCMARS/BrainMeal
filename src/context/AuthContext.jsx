import React, { createContext, useState, useEffect, useContext } from 'react';
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
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const setupAuth = async () => {
            try {
                await setPersistence(auth, browserLocalPersistence);
                
                const unsubscribe = onAuthStateChanged(auth, (user) => {
                    if (mounted) {
                        setUser(user);
                        setLoading(false);
                        setError(null);
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

    const value = {
        user,
        loading,
        error,
        signup,
        login,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
} 