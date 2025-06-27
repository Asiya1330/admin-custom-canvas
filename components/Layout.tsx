"use client";
import { ReactNode, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  useEffect(() => {
    console.log("render layout");
  }, []);

  if (!user) {
    return null; // This will be handled by the login page
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-6 overflow-x-hidden">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user}</h1>
            <p className="text-gray-400">Manage your platform from the dashboard</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <span>Logout</span>
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
