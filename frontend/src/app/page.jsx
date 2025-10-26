"use client";

import { useState } from "react";
import LoginModal from "./login/components/LoginModal";
import { useEffect } from "react";
import axios from "axios";


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
