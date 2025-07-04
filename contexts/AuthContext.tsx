"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { auth, db } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getSingleUser } from "@/services/crud";

export interface User {
  displayName: string;
  email: string;
  photoURL: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // Fetch user doc from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        throw new Error("User not found. Please contact support.");
      }
      
      const userData = userDoc.data();
      // Only allow users with isAdmin === true
      if (userData.isAdmin !== true) {
        // Sign out the user since they don't have admin access
        await signOut(auth);
        throw new Error("You do not have admin access to this portal.");
      }
      
      setUser({
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        isAdmin: true,
      });
    } catch (err: any) {
      throw new Error(
        firebaseMessagesToUsersFriendlyMessages(err.message) ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Fetch user doc from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        throw new Error("User not found. Please contact support.");
      }
      
      const userData = userDoc.data();
      // Only allow users with isAdmin === true
      if (userData.isAdmin !== true) {
        // Sign out the user since they don't have admin access
        await signOut(auth);
        throw new Error("You do not have admin access to this portal.");
      }
      
      setUser({
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        isAdmin: true,
      });
    } catch (err: any) {
      throw new Error(
        firebaseMessagesToUsersFriendlyMessages(err.message) ||
          "Google sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const firebaseMessagesToUsersFriendlyMessages = (message: string) => {
    if (message.includes("auth/user-not-found")) {
      return "User not found. Please check your email and password.";
    }
    if (message.includes("auth/wrong-password")) {
      return "Invalid password. Please try again.";
    }
    if (message.includes("auth/invalid-email")) {
      return "Invalid email. Please check your email and password.";
    }
    if (message.includes("auth/user-disabled")) {
      return "User is disabled. Please contact support.";
    }
    if (message.includes("auth/too-many-requests")) {
      return "Too many requests. Please try again later.";
    }
    if (message.includes("auth/network-request-failed")) {
      return "Network request failed. Please check your internet connection.";
    }
    if (message.includes("auth/email-already-in-use")) {
      return "Email already in use. Please use a different email.";
    }
    if (message.includes("auth/invalid-credential")) {
      return "Invalid credential. Please check your email and password.";
    }
    if (message.includes("auth/invalid-action-code")) {
      return "Invalid action code. Please check your email and password.";
    }
    if (message.includes("auth/invalid-verification-code")) {
      return "Invalid verification code. Please check your email and password.";
    }
    if (message.includes("auth/invalid-verification-id")) {
      return "Invalid verification ID. Please check your email and password.";
    }
    return message;
  };

  const logout = () => {
    setUser(null);
    signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const user = await getSingleUser(firebaseUser.uid);
          if (!user) {
            // User doesn't exist in Firestore, sign them out
            await signOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Only allow users with isAdmin === true
          if (user.isAdmin !== true) {
            // User is not an admin, sign them out
            await signOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }
          
          setUser({
            displayName: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
            isAdmin: true,
          });
        } catch (error) {
          console.error("Error checking user admin status:", error);
          // If there's an error, sign out the user for security
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithGoogle, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
