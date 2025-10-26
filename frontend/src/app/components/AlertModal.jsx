"use client";
import React from "react";
import { X } from "lucide-react";

export default function Modal({ type = "info", message, onClose, isOpen }) {
  if (!isOpen) return null;

  const bgColor =
    type === "success"
      ? "bg-emerald-100 text-emerald-800"
      : type === "error"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <div className={`max-w-md w-full p-6 rounded-xl ${bgColor} relative`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          <X size={20} />
        </button>
        <p className="text-center text-lg">{message}</p>
      </div>
    </div>
  );
}
