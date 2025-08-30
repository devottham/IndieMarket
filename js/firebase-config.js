// js/firebase-config.js (Corrected and Simplified)

// Import the functions you need from the Firebase SDKs using their full URLs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

// Your web app's Firebase configuration
// These values will be securely provided by the hosting service (Netlify) during deployment.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_API_KEY,
  authDomain:        import.meta.env.VITE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and EXPORT Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
