import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2ZvIF8Ckq-r-xI1tRg11GbhfD0hiAMc0",
  authDomain: "sprintforge-3385f.firebaseapp.com",
  projectId: "sprintforge-3385f",
  storageBucket: "sprintforge-3385f.firebasestorage.app",
  messagingSenderId: "291643082524",
  appId: "1:291643082524:web:334fe3959093c0d6b61cd9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const githubProvider = new GithubAuthProvider();

export { auth, db, githubProvider };
