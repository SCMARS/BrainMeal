// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
export const auth = getAuth(app);