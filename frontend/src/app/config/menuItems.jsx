// app/config/menuItems.js
import {
    LayoutDashboard,
    Package,
    Calendar,
    Truck,
    BarChart3,
    Settings,
  } from "lucide-react";
  
  // Set per role
  export const MENU_BY_ROLE = {
    user: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      { icon: Package, label: "Products", href: "/products" },
      { icon: Calendar, label: "Calendar", href: "/calendar" },
      { icon: Truck, label: "Suppliers", href: "/suppliers" },
      { icon: BarChart3, label: "Reports", href: "/reports" },
    ],
  
    ngo: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      { icon: Package, label: "Products", href: "/products" },
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
  