import { initializeApp } from 'firebase/app';
// import { getDatabase } from 'firebase/database'; // Replaced with getFirestore
import { getFirestore } from 'firebase/firestore'; // Added for Firestore
import { getAnalytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
    apiKey: 'AIzaSyDnI2sHUYjFXyIqtWCe4KypG-_K5d2QnY0',
    authDomain: 'dox-box.firebaseapp.com',
    databaseURL: 'https://dox-box-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'dox-box',
    storageBucket: 'dox-box.firebasestorage.app',
    messagingSenderId: '689675724405',
    appId: '1:689675724405:web:756306ce8abe54afb07a3c',
    measurementId: 'G-B2L4C1PSBJ',
};

const app = initializeApp(firebaseConfig);
// const db = getDatabase(app); // Realtime Database instance
const firestore = getFirestore(app); // Firestore instance
const analytics = getAnalytics(app);

let appCheck;

if (import.meta.env.DEV) {
    appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LdDeT0rAAAAAA0rkF91bsn368tm2drnf7zDbW9v'),
        isTokenAutoRefreshEnabled: true,
        token: import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN,
    });
    console.log('Firebase App Check initialized with debug token.');
} else {
    appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LdDeT0rAAAAAA0rkF91bsn368tm2drnf7zDbW9v'),
        isTokenAutoRefreshEnabled: true,
    });
}

export { app, firestore }; // Export firestore instead of db
