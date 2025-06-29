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
import { useAuth } from '@/contexts/AuthContext'

interface MenuItem {
  name: string
  href: string
  icon: LucideIcon
  editable?: boolean
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
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
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth();

  return (
    <div className={`fixed left-0 top-0 h-full glass-effect transition-all duration-500 ease-in-out z-50 ${
      collapsed ? 'w-12' : 'w-56'
    }`}>
      {/* Header */}
      <div className="p-2 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="animate-fadeInUp">
              <h1 className="text-sm font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                Admin Portal
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Firebase Management</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 max-h-[calc(100vh-7rem)] overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center p-1.5 rounded transition-all duration-300 hover:bg-white/10 ${
                isActive ? 'bg-violet-500/20 neon-glow' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon 
                size={14} 
                className={`transition-colors ${
                  isActive ? 'text-violet-400' : 'text-gray-400 group-hover:text-white'
                }`} 
              />
              {!collapsed && (
                <div className="ml-2 flex-1">
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.name}
                  </span>
                  {item.editable && (
                    <span className="ml-1 px-1 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full align-middle">
                      Editable
                    </span>
                  )}
                </div>
              )}
              {!collapsed && isActive && (
                <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="glass-effect rounded p-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{user?.displayName?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
