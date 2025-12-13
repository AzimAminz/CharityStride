"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Ban, Mail, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Account Blocked Page
 * Shows when user with status=false tries to login
 * Protected - only shows if user came from 403 error
 */
export default function AccountBlockedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidAccess, setIsValidAccess] = useState(false);

  const message =
    searchParams.get("message") ||
    "Your account has been blocked. Please contact support.";

  useEffect(() => {
    // Check if user came from a valid 403 error
    // (has message parameter)
    const hasMessage = searchParams.get("message");

    if (!hasMessage) {
      // No message = direct access, redirect to login
      router.replace("/login");
      return;
    }

    // Valid access from 403 error
    setIsValidAccess(true);
  }, [searchParams, router]);

  // Don't render until we verify access
  if (!isValidAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <Ban className="h-16 w-16 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Account Blocked
        </h1>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">{message}</p>

        {/* Info Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Why was my account blocked?</strong>
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Violation of terms of service</li>
            <li>Administrative reasons</li>
            <li>NGO registration was blocked</li>
          </ul>
        </div>

        {/* Contact Support */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Need help?
              </p>
              <p className="text-sm text-blue-700">
                Contact our support team at{" "}
                <a
                  href="mailto:support@charitystride.com"
                  className="font-semibold underline"
                >
                  support@charitystride.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Login Button */}
        <button
          onClick={() => router.push("/login")}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Login
        </button>
      </motion.div>
    </div>
  );
}
