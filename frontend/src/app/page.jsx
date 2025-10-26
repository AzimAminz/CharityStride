"use client";

import { useState } from "react";
import LoginModal from "./login/LoginModal";

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-10">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-emerald-500 text-white rounded"
      >
        Open Login Modal
      </button>

      <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
