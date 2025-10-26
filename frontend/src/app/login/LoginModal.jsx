"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import useLogin from "./hooks/useLogin";
export default function LoginModal({ isOpen, onClose }) {
  const {
    email,
    setEmail,
    emailError,
    password,
    setPassword,
    passwordError,
    showPassword,
    setShowPassword,
    loading,
    handleLogin,
  } = useLogin();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            {/* Logo + Title */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Heart className="text-emerald-500 w-10 h-10" />
              </motion.div>
              <h1 className="mt-3 text-3xl font-bold text-slate-800">
                CharityStride
              </h1>
              <p className="text-slate-500 text-sm">Empowering Kindness</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border ${
                    emailError ? "border-red-400" : "border-slate-200"
                  } focus:ring-2 focus:ring-emerald-400 focus:outline-none`}
                  placeholder="you@example.com"
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-2 pr-10 rounded-xl border ${
                      passwordError ? "border-red-400" : "border-slate-200"
                    } focus:ring-2 focus:ring-emerald-400 focus:outline-none`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  Remember me
                </label>
                <Link href="#" className="text-emerald-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-medium shadow-md transition-all ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Logging in..." : "Log In"}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="mx-3 text-slate-500 text-sm">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google Login */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-medium shadow-sm transition-all"
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                width={20}
                height={20}
              />
              Continue with Google
            </motion.button>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-slate-600">
              Don’t have an account?{" "}
              <Link href="#" className="text-emerald-600 font-medium hover:underline">
                Sign up
              </Link>
            </div>

            {/* Gradient Line */}
            <div className="h-1 w-20 bg-linear-to-r from-emerald-500 via-blue-400 to-orange-400 mx-auto mt-8 rounded-full" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}