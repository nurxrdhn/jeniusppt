import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHtuiynW5nVWsnuePKiR5UTLQz2iZMcNk",
  authDomain: "jeniusppt.firebaseapp.com",
  projectId: "jeniusppt",
  storageBucket: "jeniusppt.firebasestorage.app",
  messagingSenderId: "921396494579",
  appId: "1:921396494579:web:203ddac297642436203786",
  measurementId: "G-8QQFZNRP8X",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
