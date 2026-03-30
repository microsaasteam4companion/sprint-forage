import { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { auth, githubProvider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // 1. Set Auth state immediately so the UI can proceed
      setUser(currentUser);
      setLoading(false);

      // 2. Perform Firestore Sync in the background
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            const githubData = currentUser.providerData.find(p => p.providerId === "github.com");
            await setDoc(userRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              githubUsername: (currentUser as any).reloadUserInfo?.screenName || githubData?.displayName || "Anonymous",
              karma: 0,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
          } else {
            await updateDoc(userRef, { lastLogin: serverTimestamp() });
          }
        } catch (error) {
          console.error("Background Firestore sync error:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGitHub = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      console.error("Error logging in with GitHub:", error);
    }
  };

  const logout = () => signOut(auth);

  return { user, loading, loginWithGitHub, logout };
};
