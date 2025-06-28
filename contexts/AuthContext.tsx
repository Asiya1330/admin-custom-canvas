'use client'
import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  invited?: boolean;
}

interface AuthContextType {
  user: string | null;
  adminUsers: AdminUser[];
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  inviteUser: (email: string, role: string) => void;
  removeUser: (id: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Mock data and functions for now
  const adminUsers = [
    { id: '1', name: 'Super Admin', email: 'asiya.batool987@gmail.com', role: 'super_admin' },
    { id: '2', name: 'John Doe', email: 'john@example.com', role: 'admin' },
  ]

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Fetch user doc from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists() || !userDoc.data().isAdmin) {
        throw new Error('You do not have access to this portal.');
      }
      // Store user in localStorage for persistence
      localStorage.setItem('adminUser', email)
      setUser(email)
    } catch (err: any) {
      throw new Error(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Fetch user doc from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists() || !userDoc.data().isAdmin) {
        throw new Error('You do not have access to this portal.');
      }
      localStorage.setItem('adminUser', user.email || '');
      setUser(user.email || null);
    } catch (err: any) {
      throw new Error(err.message || 'Google sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminUser')
    setUser(null)
  }

  const inviteUser = async (email: string, role: string) => {
    setLoading(true)
    try {
      console.log('Inviting user:', email, role)
      // Add your API call here
    } finally {
      setLoading(false)
    }
  }

  const removeUser = async (id: string) => {
    setLoading(true)
    try {
      console.log('Removing user:', id)
      // Add your API call here
    } finally {
      setLoading(false)
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('adminUser')
    if (savedUser) {
      setUser(savedUser)
    }
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, adminUsers, login, loginWithGoogle, logout, inviteUser, removeUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
