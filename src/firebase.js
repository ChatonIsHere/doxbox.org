import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDnI2sHUYjFXyIqtWCe4KypG-_K5d2QnY0',
  authDomain: 'dox-box.firebaseapp.com',
  databaseURL: 'https://dox-box-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'dox-box',
  storageBucket: 'dox-box.appspot.com',
  messagingSenderId: '689675724405',
  appId: '1:689675724405:web:756306ce8abe54afb07a3c',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };
