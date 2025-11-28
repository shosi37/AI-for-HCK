// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZCprZtv9W51e_ZqAedZ6wTuBeuT6kdHw",
  authDomain: "ai-chatbot-for-hck.firebaseapp.com",
  projectId: "ai-chatbot-for-hck",
  storageBucket: "ai-chatbot-for-hck.appspot.com",   
  messagingSenderId: "469719977392",
  appId: "1:469719977392:web:79ba59366913f7281c9a75",
  measurementId: "G-QV0BXK046N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Auth
export const auth = getAuth(app);

// Google login provider
export const googleProvider = new GoogleAuthProvider();

// Firebase Storage (for profile pictures)
export const storage = getStorage(app);
