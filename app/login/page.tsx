'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Mail } from 'lucide-react'
import Loader from '../../components/Loader'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user, login, loginWithGoogle, loading: authLoading } = useAuth()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/')
    } catch (error: any) {
      if (error.message === 'You do not have admin access to this portal.') {
        setError('You do not have admin access to this portal. Please contact support.')
      } else if (error.message === 'User not found. Please contact support.') {
        setError('User not found. Please contact support.')
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    )
  }

  // Don't show login form if user is already authenticated
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-2">
      <div className="glass-effect rounded-lg p-4 w-full max-w-sm">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-1">
            Admin Portal
          </h1>
          <p className="text-gray-400 text-xs">Sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-300 text-xs mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-6 pr-3 py-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:border-violet-400 text-white placeholder-gray-400 text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-xs mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:border-violet-400 text-white placeholder-gray-400 text-sm"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-xs"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2 bg-red-500/20 border border-red-500/30 rounded">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded hover:from-violet-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-2">
          <button
            type="button"
            onClick={async () => {
              setError("");
              setLoading(true);
              try {
                await loginWithGoogle();
                router.push("/");
              } catch (error: any) {
                if (error.message === "You do not have admin access to this portal.") {
                  setError("You do not have admin access to this portal. Please contact support.");
                } else if (error.message === "User not found. Please contact support.") {
                  setError("User not found. Please contact support.");
                } else {
                  setError("Google sign-in failed. Please try again.");
                }
              } finally {
                setLoading(false);
              }
            }}
            className="w-full py-2 bg-white text-gray-900 rounded hover:bg-gray-200 transition-all duration-300 font-medium flex items-center justify-center space-x-1 text-sm"
            disabled={loading}
          >
            <Mail className="w-4 h-4 mr-1" />
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-xs">
            Access restricted to authorized administrators only
          </p>
        </div>
      </div>
    </div>
  )
} 