"use client";

import { Menu, User } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false); // ✅ prevent flicker
  const pathname = usePathname();

  useEffect(() => {
    setHydrated(true); // ✅ UI only render after client load
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!user && !!token);
  }, []);

  // ❗ Jangan render sebelum hydration siap — ini hilangkan flicker
  if (!hydrated) return null;

  const navItems = [
    { label: "Home", href: "/" , exact: true },
    { label: "Events", href: "/events" },
    { label: "About", href: "/about" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <div  className={`${isLoggedIn ? "md:hidden" : "hidden"} `}></div>
        
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className={`${isLoggedIn ? "md:hidden" : ""} w-8 h-8 bg-white rounded-lg border-2 border-emerald-500 flex items-center justify-center p-1`}>
              <img
                src="/charitystride_icon.png"
                alt="Charity Stride"
                className="w-full h-full object-contain"
              />
            </div>
            <span className={`${isLoggedIn ? "md:hidden" : ""} text-lg font-semibold text-emerald-900`}>
              Charity Stride
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center space-x-4 lg:space-x-8">
            {navItems.map(({ label, href , exact}, i) => {
              let isActive;
        
              if (exact) {

                isActive = pathname === href;
              } else {

                isActive = pathname.startsWith(href);
              }
              return (
                <Link
                  key={i}
                  href={href}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          {!isLoggedIn && (
            <Link
              href="/login"
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <User size={18} />
              <span>Log In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
          <div className="flex flex-col space-y-2">
            {navItems.map(({ label, href }, i) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={i}
                  href={href}
                  className={`px-4 py-3 rounded-lg transition-colors text-center ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
