"use client";

import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Loading from "../loading";
import { useState, useEffect } from "react";

/**
 * Admin Layout - Sidebar only, no navbar
 * Protected route - Admin role only
 */
export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth("admin");
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect countdown for users with errors
  useEffect(() => {
    if (authError && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (authError && countdown === 0) {
      // Redirect based on login status
      if (user) {
        router.push("/user/dashboard"); // Logged in, wrong role
      } else {
        router.push("/login"); // Not logged in
      }
    }
  }, [authError, user, countdown, router]);

  // Show loading while checking auth
  if (authLoading) {
    return <Loading />;
  }

  // Show error if auth check failed
  if (authError) {
    const isLoggedIn = !!user;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLoggedIn ? "Access Denied" : "Authentication Required"}
          </h2>
          <p className="text-gray-600 mb-6">{authError}</p>

          {isLoggedIn ? (
            <div className="space-y-3">
              <button
                onClick={() => router.push("/user/dashboard")}
                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <div className="text-sm text-gray-500">
                Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Login
              </button>
              <div className="text-sm text-gray-500">
                Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
