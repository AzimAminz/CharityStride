"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import Loading from "@/app/loading";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const user = typeof window !== "undefined" && localStorage.getItem("user");
    const token = typeof window !== "undefined" && localStorage.getItem("token");

    setIsLoggedIn(!!user && !!token);
    setIsCheckingAuth(false);
  }, []);

  if (isCheckingAuth) return <Loading />;

  return (
    <div className="flex h-screen bg-gray-50 animate-fadeIn">
      {isLoggedIn && (
        <Sidebar
          isCollapsed={!sidebarOpen}
          setIsCollapsed={setSidebarOpen}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
