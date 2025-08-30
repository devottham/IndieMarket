// js/firebase-config.js (Corrected and Simplified)

// Import the functions you need from the Firebase SDKs using their full URLs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-MMY5xaHGH1o3cvyikxA5SXeet8CYhRg",
  authDomain: "indiemarket-eed6a.firebaseapp.com",
  projectId: "indiemarket-eed6a",
  storageBucket: "indiemarket-eed6a.firebasestorage.app",
  messagingSenderId: "912038487275",
  appId: "1:912038487275:web:db4c09d51885bd17a2caae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and EXPORT Firebase services so other files can use them.
export const auth = getAuth(app);
export const db = getFirestore(app);