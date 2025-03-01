import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAs_jDVRkz77nWZa4czsw8In1Six0SuS8g",
  authDomain: "login-7f32e.firebaseapp.com",
  projectId: "login-7f32e",
  storageBucket: "login-7f32e.firebasestorage.app",
  messagingSenderId: "352029132678",
  appId: "1:352029132678:web:702a15339386015b614e07",
  measurementId: "G-B0H402GS8E"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;