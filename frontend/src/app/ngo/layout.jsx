"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/app/components/Layout";
import { useAuth } from "../hooks/useAuth";
import { AlertCircle } from "lucide-react";
import Loading from "@/app/loading";

export default function NGOLayout({ children }) {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth("ngo");
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect countdown for users with auth errors
  useEffect(() => {
    if (authError && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (authError && countdown === 0) {
      // Redirect based on login status
      if (user) {
        router.push("/user/dashboard"); // Logged in, wrong role
      } else {
        router.push(
          "/login?redirect=" + encodeURIComponent(window.location.pathname)
        ); // Not logged in
      }
    }
  }, [authError, user, countdown, router]);

  if (authLoading) {
    return <Loading />;
  }

  if (authError) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user ? "Access Denied" : "Authentication Required"}
            </h2>
            <p className="text-gray-600 mb-6">{authError}</p>
            <div className="space-y-4">
              <button
                onClick={() => router.push(user ? "/user/dashboard" : "/login")}
                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                {user ? "Back to Dashboard" : "Go to Login"}
              </button>
              <p className="text-sm text-gray-400">
                Redirecting in{" "}
                <span className="font-bold text-emerald-600">{countdown}</span>{" "}
                second{countdown !== 1 ? "s" : ""}...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}
