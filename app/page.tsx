'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { Users, Image, ShoppingCart, Package } from 'lucide-react'

interface StatCard {
  title: string
  value: string
  icon: any
  color: string
}

const stats: StatCard[] = [
  {
    title: 'Total Users',
    value: '1,234',
    icon: Users,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Generated Images',
    value: '5,678',
    icon: Image,
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Total Orders',
    value: '890',
    icon: ShoppingCart,
    color: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Products',
    value: '123',
    icon: Package,
    color: 'from-orange-500 to-red-500'
  }
]

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user?.email) {
      router.push('/login')
    }
  }, [user?.email, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user?.email) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.title}
                className="glass-effect rounded-lg p-3 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">{stat.title}</p>
                    <p className="text-lg font-bold text-white mt-0.5">{stat.value}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon size={16} className="text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="glass-effect rounded-lg p-3">
          <h2 className="text-base font-bold text-white mb-3">Recent Activity</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-white/5 rounded">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-xs">New user registered</p>
                <p className="text-gray-400 text-xs">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-white/5 rounded">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-xs">Image generated successfully</p>
                <p className="text-gray-400 text-xs">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-white/5 rounded">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-xs">New order placed</p>
                <p className="text-gray-400 text-xs">10 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

