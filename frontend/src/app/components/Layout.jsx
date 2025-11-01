"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
  
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (user && token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {isLoggedIn && (
        <Sidebar
          isCollapsed={!sidebarOpen}
          setIsCollapsed={setSidebarOpen}
        />
      )}


      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
