import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  githubUsername: string;
  karma: number;
  projectsCount: number;
  streak: number;
  rating: number;
  registeredForNextSprint: boolean;
  isVerified: boolean;
  isAdmin: boolean;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          uid: user.uid,
          displayName: data.displayName || null,
          email: data.email || null,
          photoURL: data.photoURL || null,
          githubUsername: data.githubUsername || "Anonymous",
          karma: data.karma || 0,
          projectsCount: data.projectsCount || 0,
          streak: data.streak || 0,
          rating: data.rating || 0.0,
          registeredForNextSprint: data.registeredForNextSprint || false,
          isVerified: data.isVerified || false,
          isAdmin: data.isAdmin || false,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { profile, loading };
};
