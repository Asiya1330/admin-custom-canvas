"use client";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) {
    return null; // This will be handled by the login page
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 overflow-x-hidden p-2 md:p-3 ${
          sidebarCollapsed ? 'ml-12' : 'ml-56'
        }`}
      >
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-lg font-bold text-white">Welcome back, {user?.displayName || user?.email || ''}</h1>
            <p className="text-xs text-gray-400">Manage your platform from the dashboard</p>
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
