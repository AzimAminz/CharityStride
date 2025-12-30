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

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  if (isCheckingAuth) return <Loading />;

  return (
    <div className="flex h-screen bg-gray-50 animate-fadeIn">
      {isLoggedIn && (
        <Sidebar isCollapsed={!sidebarOpen} setIsCollapsed={setSidebarOpen} />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!isLoggedIn && (
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        )}

        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Notification Bar for Logged In Users - At top, not sticky */}
          {isLoggedIn && (
            <div className="bg-white border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-end gap-4">
                {/* Notification Bell */}
                <a
                  href="/user/notifications"
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                  title="Notifications"
                >
                  <svg
                    className="h-6 w-6 text-gray-600 group-hover:text-emerald-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {/* Unread Badge */}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </a>

                {/* User Profile */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{user.email || ""}</p>
                  </div>
                  <img
                    src={user.photo || "/default-avatar.png"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
