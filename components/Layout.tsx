"use client";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) {
    return null; // This will be handled by the login page
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      {/* Mobile sidebar */}
      <div className={`bg-gray-900 fixed left-0 top-0 h-full z-50 transition-transform duration-300 lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-screen w-56 glass-effect fixed left-0 top-0 z-50 overflow-y-auto">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Main content */}
      <main
        className={`flex-1 ml-0
          ${sidebarCollapsed ? 'lg:ml-12' : 'lg:ml-56'}
          h-screen overflow-y-auto transition-all duration-300 p-2 md:p-3`}
      >
        {/* Header with logout and mobile menu toggle */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            
            <div>
              <h1 className="text-lg font-bold text-white">Welcome back, {user?.displayName || user?.email || ''}</h1>
              <p className="text-xs text-gray-400">Manage your platform from the dashboard</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
          >
            <span>Logout</span>
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
