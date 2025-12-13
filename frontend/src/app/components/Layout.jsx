"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
import { getStoredUser, isProfileComplete } from "@/app/lib/profile";

export default function Layout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");

    // Global profile completion enforcement
    if (user && token && !isProfileComplete(user)) {
      // Get current path
      const currentPath = window.location.pathname;

      // Allow only /complete-profile and /login paths
      if (
        !currentPath.includes("/complete-profile") &&
        !currentPath.includes("/login")
      ) {
        // Clear auth data and logout
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login with message
        router.push("/login?error=Please complete your profile to continue");
        setIsCheckingAuth(false);
        return;
      }
    }

    // User is logged in if has token AND profile is complete
    setIsLoggedIn(!!user && !!token && isProfileComplete(user));
    setIsCheckingAuth(false);
  }, [router]);

  if (isCheckingAuth) return <Loading />;

  return (
    <div className="flex h-screen bg-gray-50 animate-fadeIn">
      {isLoggedIn && (
        <Sidebar isCollapsed={!sidebarOpen} setIsCollapsed={setSidebarOpen} />
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
