"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { logout as logOut } from "@/app/lib/auth";
import { MENU_BY_ROLE, BOTTOM_MENU_BY_ROLE } from "@/app/config/menuItems";

import { X, ChevronLeft, ChevronRight, User, LogOut } from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;

  const role = user?.role;

  const menuItems = MENU_BY_ROLE[role] || [];
  const bottomMenuItems = BOTTOM_MENU_BY_ROLE[role] || [];

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const collapsed = isCollapsed && !isMobileOpen;

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const renderMenu = (items) =>
    items.map(({ icon: Icon, label, href }, index) => {
      const isActive = pathname === href;
      return (
        <Link
          key={index}
          href={href}
          onClick={() => setIsMobileOpen(false)}
          className={`group w-full flex items-center px-3 py-2.5 rounded-lg transition-all text-left ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Icon
            size={20}
            className={`
              ${collapsed ? "mx-auto" : "mr-3"}
              transition-all duration-200
            `}
          />

          <span
            className={`
              whitespace-nowrap overflow-hidden transition-all duration-100
              ${
                collapsed
                  ? "opacity-0 -translate-x-1.5 w-0"
                  : "opacity-100 w-auto translate-x-0"
              }
            `}
          >
            {label}
          </span>
        </Link>
      );
    });

    const logout = async () => {
      await logOut();   
      setShowLogoutModal(false);
      router.push("/events");
    };
    

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          h-full fixed md:static z-40
          ${collapsed ? "w-16 md:w-20" : "w-64"}
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between ${
            collapsed ? "p-1" : "p-4"
          }  border-b border-gray-200`}
        >
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "space-x-2"
            } flex-1`}
          >
            <div className="w-8 h-8 bg-white rounded-lg border-2 border-emerald-500 flex items-center justify-center p-1">
              <img
                src="/charitystride_icon.png"
                alt="Charity Stride"
                className="w-full h-full object-contain"
              />
            </div>

            <span
              className={`
                text-lg font-semibold text-emerald-900 
                ${collapsed ? "opacity-0 w-0 " : "opacity-100 w-auto "}
              `}
            >
              Charity Stride
            </span>
          </div>

          <button
            onClick={toggleCollapse}
            className="hidden md:block p-1.5 rounded-lg hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {isMobileOpen && (
            <button
              onClick={toggleMobile}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Profile */}
        {!collapsed && user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Welcome back
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {renderMenu(menuItems)}
        </nav>

        {/* Bottom Menu */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          {renderMenu(bottomMenuItems)}

          {/* ✅ Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-left text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} className={collapsed ? "mx-auto" : "mr-3"} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </div>

      {/* Mobile Open Button */}
      {!isMobileOpen && (
        <button
          className="md:hidden fixed top-2 left-4 z-50 bg-white p-2 rounded-lg border shadow"
          onClick={toggleMobile}
        >
          <ChevronRight />
        </button>
      )}

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Log Out?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to log out?
            </p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
