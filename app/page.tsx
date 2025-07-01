'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { Users, Image, ShoppingCart, Package, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getDashboardStats, getDashboardTrends } from '../services/crud'
import { withAuth } from '../components/withAuth'

interface StatCard {
  title: string
  value: string
  icon: any
  color: string
  isCurrency?: boolean
}

const statConfig = [
  {
    key: 'totalUsers',
    title: 'Total Users',
    icon: Users,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    key: 'totalImages',
    title: 'Generated Images',
    icon: Image,
    color: 'from-purple-500 to-pink-500'
  },
  {
    key: 'totalOrders',
    title: 'Total Orders',
    icon: ShoppingCart,
    color: 'from-green-500 to-emerald-500'
  },
  {
    key: 'totalProducts',
    title: 'Products',
    icon: Package,
    color: 'from-orange-500 to-red-500'
  },
  {
    key: 'totalEarnings',
    title: 'Amount Earned',
    icon: DollarSign,
    color: 'from-yellow-400 to-yellow-600',
    isCurrency: true,
  },
]

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [trends, setTrends] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true)
      try {
        const [statsData, trendsData] = await Promise.all([
          getDashboardStats(),
          getDashboardTrends()
        ])
        setStats(statsData)
        setTrends(trendsData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (statsLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Net Revenue */}
          <div className="bg-[#181C23] rounded-xl p-5 shadow flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Net Revenue</span>
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-white">${(stats.totalEarnings ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`flex items-center text-xs font-medium ${trends?.totalEarnings?.up ? 'text-green-400' : 'text-red-400'}`}>
                {trends?.totalEarnings?.up ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {trends?.totalEarnings?.percent?.toFixed(1) || '0'}%
              </span>
            </div>
            <span className="text-gray-500 text-xs">vs last month</span>
          </div>
          {/* Total Orders */}
          <div className="bg-[#181C23] rounded-xl p-5 shadow flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Total Orders</span>
              <ShoppingCart className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-white">{stats.totalOrders ?? '-'}</span>
              <span className={`flex items-center text-xs font-medium ${trends?.totalOrders?.up ? 'text-green-400' : 'text-red-400'}`}>
                {trends?.totalOrders?.up ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {trends?.totalOrders?.percent?.toFixed(1) || '0'}%
              </span>
            </div>
            <span className="text-gray-500 text-xs">vs last month</span>
          </div>
          {/* Total Users */}
          <div className="bg-[#181C23] rounded-xl p-5 shadow flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Total Users</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-white">{stats.totalUsers ?? '-'}</span>
              <span className={`flex items-center text-xs font-medium ${trends?.totalUsers?.up ? 'text-green-400' : 'text-red-400'}`}>
                {trends?.totalUsers?.up ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {trends?.totalUsers?.percent?.toFixed(1) || '0'}%
              </span>
            </div>
            <span className="text-gray-500 text-xs">vs last month</span>
          </div>
          {/* Generated Images */}
          <div className="bg-[#181C23] rounded-xl p-5 shadow flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Generated Images</span>
              <Image className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-white">{stats.totalImages ?? '-'}</span>
              <span className={`flex items-center text-xs font-medium ${trends?.totalImages?.up ? 'text-green-400' : 'text-red-400'}`}>
                {trends?.totalImages?.up ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {trends?.totalImages?.percent?.toFixed(1) || '0'}%
              </span>
            </div>
            <span className="text-gray-500 text-xs">vs last month</span>
          </div>
        </div>

        {/* Lower Section: Placeholder for charts and breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Sales Overview (Donut/Pie Chart Placeholder) */}
          <div className="bg-[#181C23] rounded-xl p-5 shadow flex flex-col">
            <span className="text-white font-bold mb-2">Sales Overview</span>
            <div className="flex flex-col items-center justify-center flex-1">
              {/* Placeholder for Donut/Pie Chart */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-green-400/30 to-green-700/30 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">${(stats.totalEarnings ?? 0).toLocaleString()}</span>
              </div>
              <span className="text-gray-400 text-xs mt-2">Total Revenue</span>
            </div>
          </div>
          {/* Products Card */}
          <div className="bg-[#181C23] rounded-xl p-5 shadow flex flex-col items-center justify-center">
            <span className="text-white font-bold mb-2">Products</span>
            <Package className="w-10 h-10 text-orange-400 mb-2" />
            <span className="text-3xl font-bold text-white">{stats.totalProducts ?? '-'}</span>
            <span className="text-gray-400 text-xs mt-2">Total Products</span>
          </div>
          {/* Recent Activity Card */}
          <div className="bg-[#181C23] rounded-xl p-5 shadow flex flex-col">
            <span className="text-white font-bold mb-2">Recent Activity</span>
            <div className="flex-1 overflow-y-auto max-h-40">
              {(stats.recentActivity && stats.recentActivity.length > 0) ? (
                stats.recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2 p-2 bg-white/5 rounded mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <div className="flex-1">
                      <p className="text-white text-xs">{activity.action}</p>
                      <p className="text-gray-400 text-xs">{activity.timestamp?.toDate ? new Date(activity.timestamp.toDate()).toLocaleString() : ''}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-xs">No recent activity.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default withAuth(Dashboard)

