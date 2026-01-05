import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace these values with your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyAVkpH0tOytLJXMGG200xGERboH6eb2Rzw",
    authDomain: "credify-600f7.firebaseapp.com",
    projectId: "credify-600f7",
    storageBucket: "credify-600f7.firebasestorage.app",
    messagingSenderId: "960955195600",
    appId: "1:960955195600:web:aa0b47a145b8c56ce7fed5",
    measurementId: "G-N955NJYZ9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
