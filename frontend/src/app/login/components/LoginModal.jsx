"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import Link from "next/link";
import useLogin from "../hooks/useLogin";
import { PasswordField } from "../../components/PasswordField";
import { InputField } from "../../components/InputField";
import GoogleField from "../../components/GoogleField.";

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
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                placeholder="your@example.com"
              />

              {/* Password Field */}
              <PasswordField
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                show={showPassword}
                setShow={setShowPassword}
                error={passwordError}
              />

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
            <GoogleField />

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-slate-600">
              Don’t have an account?{" "}
              <Link href="/register" className="text-emerald-600 font-medium hover:underline">
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