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
  ArrowLeftRight,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  Terminal,
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
  { href: "/swap", label: "Swap", icon: ArrowLeftRight },
  { href: "/learn", label: "Learning Center", icon: GraduationCap },
  { href: "/products", label: "Products", icon: LayoutGrid },
  { href: "/news", label: "News", icon: Megaphone },
  { href: "/contract-actions", label: "Contract Actions", icon: Terminal },
  { href: "/account", label: "Account Actions", icon: ShieldAlert },
  { href: "/admin", label: "Admin Panel", icon: ShieldCheck, adminOnly: true },
];
