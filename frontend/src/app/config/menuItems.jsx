// app/config/menuItems.js
import {
  LayoutDashboard,
  Package,
  Truck,
  BarChart3,
  Settings,
  CalendarDays,
  CreditCard,
  Building2,
  FileText,
  Receipt,
  Award,
  HelpCircle,
  Bell,
} from "lucide-react";

// Set per role
export const MENU_BY_ROLE = {
  user: [
    { icon: CalendarDays, label: "Events", href: "/events" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/user/dashboard" },
    { icon: FileText, label: "My Registrations", href: "/user/registrations" },
    { icon: Award, label: "My Certificates", href: "/user/certificates" },
  ],

  ngo: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/ngo/dashboard" },
    { icon: CalendarDays, label: "Events", href: "/ngo/events" },
    { icon: FileText, label: "Registrations", href: "/ngo/registrations" },
    { icon: BarChart3, label: "Analytics", href: "/ngo/analytics" },
  ],

  admin: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Building2, label: "NGO Management", href: "/admin/ngos" },
  ],
};

export const BOTTOM_MENU_BY_ROLE = {
  user: [{ icon: Settings, label: "Settings", href: "/user/settings" }],
  ngo: [{ icon: Settings, label: "Settings", href: "/ngo/settings" }],
  admin: [],
};
