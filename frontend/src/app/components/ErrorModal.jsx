"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, ArrowRight } from "lucide-react";

export default function ErrorModal({
  isOpen,
  onClose,
  title,
  message,
  actionText = "Go Back",
  onAction,
}) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

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
                       bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Error Icon */}
            <div className="flex flex-col items-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4"
              >
                <AlertCircle className="text-red-500 w-8 h-8" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-800 text-center">
                {title}
              </h2>
            </div>

            {/* Message */}
            <p className="text-slate-600 text-center mb-8 leading-relaxed">
              {message}
            </p>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAction}
              className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg transition-all flex items-center justify-center gap-3"
            >
              {actionText}
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
