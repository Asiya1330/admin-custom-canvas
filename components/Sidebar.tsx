'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Image, 
  ShoppingCart, 
  Package, 
  Palette, 
  BookOpen, 
  Home,
  Settings,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Database,
  Activity,
  LucideIcon
} from 'lucide-react'

interface MenuItem {
  name: string
  href: string
  icon: LucideIcon
  editable?: boolean
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Images', href: '/images', icon: Image },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Home Images', href: '/home-images', icon: Database, editable: true },
  { name: 'Artists', href: '/artists', icon: Palette, editable: true },
  { name: 'Subjects', href: '/subjects', icon: BookOpen, editable: true },
  { name: 'Processing Queue', href: '/queue', icon: Activity },
  { name: 'Admin Users', href: '/admin-users', icon: UserPlus },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={`fixed left-0 top-0 h-full glass-effect transition-all duration-500 ease-in-out z-50 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="animate-fadeInUp">
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                Admin Portal
              </h1>
              <p className="text-xs text-gray-400 mt-1">Firebase Management</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-4 pb-24 max-h-[calc(100vh-10rem)] overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center p-3 rounded-xl transition-all duration-300 hover:bg-white/10 ${
                isActive ? 'bg-violet-500/20 neon-glow' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon 
                size={20} 
                className={`transition-colors ${
                  isActive ? 'text-violet-400' : 'text-gray-400 group-hover:text-white'
                }`} 
              />
              {!collapsed && (
                <div className="ml-3 flex-1">
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.name}
                  </span>
                  {item.editable && (
                    <span className="ml-3 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full align-middle">
                      Editable
                    </span>
                  )}
                </div>
              )}
              {!collapsed && isActive && (
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-effect rounded-xl p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">SA</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Super Admin</p>
                <p className="text-xs text-gray-400 truncate">admin@example.com</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
