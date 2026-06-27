import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDHtuiynW5nVWsnuePKiR5UTLQz2iZMcNk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "jeniusppt.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "jeniusppt",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "jeniusppt.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "921396494579",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:921396494579:web:203ddac297642436203786",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8QQFZNRP8X",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
