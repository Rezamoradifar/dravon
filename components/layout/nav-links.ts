import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  UserPlus,
  Wallet,
  BarChart3,
  UserCircle,
  History,
  Network,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/register", label: "Register", icon: UserPlus },
  { href: "/charge", label: "Charge Account", icon: Wallet },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/user", label: "My Dashboard", icon: UserCircle },
  { href: "/history", label: "Round History", icon: History },
  { href: "/genealogy", label: "Genealogy", icon: Network },
  { href: "/account", label: "Account Actions", icon: ShieldAlert },
  { href: "/admin", label: "Admin Panel", icon: ShieldCheck, adminOnly: true },
];
