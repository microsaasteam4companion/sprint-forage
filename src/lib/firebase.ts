import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// --- ENVIRONMENT GUARD ---
// This check blocks the app from initializing if the environment variables 
// are still using placeholders from the .env.example file.
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value || value.includes("your_firebase") || value === "undefined") {
    console.error(`🔥 FIREBASE CONFIG ERROR: The ${key} is missing or invalid.`);
    throw new Error(`CRITICAL: Firebase ${key} is not configured on the hosting provider.`);
  }
});
// -------------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const githubProvider = new GithubAuthProvider();

export { auth, db, githubProvider };
