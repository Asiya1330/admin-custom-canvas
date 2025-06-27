'use client'
import { createContext, useContext, ReactNode, useState, useEffect } from 'react'

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
  login: (email: string) => Promise<void>;
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

  const login = async (email: string) => {
    setLoading(true)
    try {
      // Store user in localStorage for persistence
      localStorage.setItem('adminUser', email)
      setUser(email)
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
    <AuthContext.Provider value={{ user, adminUsers, login, logout, inviteUser, removeUser, loading }}>
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
