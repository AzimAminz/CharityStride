// app/config/menuItems.js
import {
    LayoutDashboard,
    Package,
    Truck,
    BarChart3,
    Settings,
    CalendarDays,
    CreditCard
  } from "lucide-react";
  
  // Set per role
  export const MENU_BY_ROLE = {
    user: [
      { icon: CalendarDays, label: "Events", href: "/events" },
      { icon: LayoutDashboard, label: "Dashboard", href: "/user/dashboard" },
      { icon: CreditCard, label: "Payment History", href: "/payment/history" },
    ],
  
    ngo: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      { icon: Package, label: "Products", href: "/products" },
      { icon: BarChart3, label: "Reports", href: "/reports" },
    ],
  
    admin: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    ],
  };
  
  export const BOTTOM_MENU_BY_ROLE = {
    user: [{ icon: Settings, label: "Settings", href: "/settings" }],
    ngo: [{ icon: Settings, label: "Settings", href: "/settings" }],
    admin: [],
  };
  