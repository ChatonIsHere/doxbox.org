import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

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
const db = getDatabase(app);
const analytics = getAnalytics(app);

export { app, db };
