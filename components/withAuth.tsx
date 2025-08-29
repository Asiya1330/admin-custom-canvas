'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Loader from './Loader'

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login')
      }
    }, [user, loading, router])

    // Show loading state while checking authentication
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Loader />
        </div>
      )
    }

    // Don't render component if user is not authenticated
    if (!user) {
      return null
    }

    return <WrappedComponent {...props} />
  }
} 