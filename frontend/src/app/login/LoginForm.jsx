"use client";

import { motion } from "framer-motion";
import { Heart, Eye, EyeOff, ArrowLeft } from "lucide-react";
import useLogin from "./hooks/useLogin";

export default function LoginPage() {
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
    back,
  } = useLogin();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Kiri */}
      <div className="hidden lg:block lg:w-7/12 bg-gray-900 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: "url('/login.jpg')" }}
        ></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>

        {/* Butang Back */}
        <button
          onClick={back}
          className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft size={18} />
          <span className="font-medium text-sm">Back</span>
        </button>

        {/* Teks */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-10">
          <h1 className="text-5xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg text-gray-200 max-w-md">
            Continue your journey of kindness. Let’s empower communities
            together.
          </p>
        </div>
      </div>

      {/* Kanan */}
      <div className="flex flex-col justify-center items-center lg:w-5/12 w-full px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-white w-full max-w-md shadow-xl rounded-3xl p-8"
        >
          {/* 🟢 Button Back */}
          <button
            onClick={back}
            className="absolute lg:hidden -top-12 left-0 sm:top-4 sm:left-4 flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-medium transition-all z-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className=" sm:inline">Back</span>
          </button>
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Heart className="text-emerald-500 w-10 h-10" />
            </motion.div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
            Sign in to CharityStride
          </h2>
          <p className="text-gray-500 text-center mb-8">Empowering Kindness</p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 mt-1 border rounded-xl focus:ring-2 outline-none ${
                  emailError
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-emerald-400"
                }`}
                placeholder="you@example.com"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-600">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 mt-1 pr-10 border rounded-xl focus:ring-2 outline-none transition-all ${
                    passwordError
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-emerald-400"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="mx-3 text-slate-500 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-medium shadow-sm transition-all"
          >
            <img
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
            <a
              href="/register"
              className="text-emerald-600 font-medium hover:underline"
            >
              Sign up
            </a>
          </div>

          {/* Gradient Line */}
          <div className="h-1 w-20 bg-linear-to-r from-emerald-500 via-blue-400 to-orange-400 mx-auto mt-8 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}
