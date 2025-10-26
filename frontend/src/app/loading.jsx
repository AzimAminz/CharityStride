"use client";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function Loading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-linear-to-b from-emerald-50 to-white z-50"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Heart className="text-emerald-500 w-12 h-12" />
      </motion.div>
      <p className="text-gray-600 mt-4 font-semibold">Loading kindness...</p>
    </motion.div>
  );
}
