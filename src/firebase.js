import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyAz0MdUTgFX660gXhhB4eOGiDA8FFkw1FY",
    authDomain: "brainmeal-9923f.firebaseapp.com",
    projectId: "brainmeal-9923f",
    storageBucket: "brainmeal-9923f.appspot.com",
    messagingSenderId: "641061515416",
    appId: "1:641061515416:web:b601dbfbdfaf87364c60ed",
    measurementId: "G-WML4ZGKXW9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore with persistent cache
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    cache: {
        persistent: true,
        maxSize: 500 * 1024 * 1024 // 500MB
    }
});

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Functions
const functions = getFunctions(app);

// Функция для очистки кэша Firestore
export const clearFirestoreCache = async () => {
    try {
        const dbTemp = initializeFirestore(app, {
            cache: {
                persistent: false
            }
        });

        // Очищаем кэш
        await dbTemp.clearPersistence();
        console.log('Кэш Firestore успешно очищен');

        // Перезагружаем страницу для применения изменений
        window.location.reload();
    } catch (error) {
        console.error('Ошибка при очистке кэша:', error);
        throw error;
    }
};

export { app, auth, db, storage, analytics, functions };
export default app;

