"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, Info } from "lucide-react";

export default function StatusModal({
  isOpen,
  onClose,
  type = "success",
  title,
  message,
  confirmText = "Continue",
  autoClose = false,
  duration = 3000,
}) {
  if (!isOpen) return null;

  const config = {
    success: {
      color: "emerald",
      icon: Check,
      glow: "shadow-emerald-500/30",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      ring: "ring-emerald-500",
    },
    error: {
      color: "red",
      icon: X,
      glow: "shadow-red-500/30",
      bg: "bg-red-50",
      border: "border-red-100",
      ring: "ring-red-500",
    },
    warning: {
      color: "amber",
      icon: AlertCircle,
      glow: "shadow-amber-500/30",
      bg: "bg-amber-50",
      border: "border-amber-100",
      ring: "ring-amber-500",
    },
    info: {
      color: "blue",
      icon: Info,
      glow: "shadow-blue-500/30",
      bg: "bg-blue-50",
      border: "border-blue-100",
      ring: "ring-blue-500",
    },
  };

  const current = config[type] || config.info;
  const colors = {
    emerald: "text-emerald-600",
    red: "text-red-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
  };

  const Icon = current.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative bg-white rounded-[2rem] shadow-2xl ${current.glow} border border-white/50 w-full max-w-sm overflow-hidden`}
          >
            <div className="p-8 flex flex-col items-center text-center">
              {/* Icon Animation Container */}
              <div className="relative mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.1,
                    type: "spring",
                    damping: 12,
                    stiffness: 200,
                  }}
                  className={`w-20 h-20 rounded-full ${current.bg} ${current.border} border-2 flex items-center justify-center`}
                >
                  <Icon className={`w-10 h-10 ${colors[current.color]}`} />
                </motion.div>

                {/* Decorative Rings */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  className={`absolute inset-0 rounded-full border-2 ${current.border} pointer-events-none`}
                />
              </div>

              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                  {title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {message}
                </p>
              </motion.div>

              {/* Action Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={onClose}
                className={`mt-8 w-full py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                  type === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                    : type === "error"
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                    : "bg-gray-900 hover:bg-black text-white shadow-gray-200"
                }`}
              >
                {confirmText}
              </motion.button>
            </div>

            {/* Bottom Progress Bar for autoClose? */}
            {autoClose && (
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className={`h-1 w-full bg-${current.color}-500 origin-left`}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
