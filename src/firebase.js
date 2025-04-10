import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

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

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true
});

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics }; 