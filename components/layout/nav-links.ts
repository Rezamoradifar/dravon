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
  HelpCircle,
  Gamepad2,
} from "lucide-react";

export interface NavLink {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/help", labelKey: "nav.help", icon: HelpCircle },
  { href: "/register", labelKey: "nav.register", icon: UserPlus },
  { href: "/charge", labelKey: "nav.charge", icon: Wallet },
  { href: "/statistics", labelKey: "nav.statistics", icon: BarChart3 },
  { href: "/user", labelKey: "nav.user", icon: UserCircle },
  { href: "/history", labelKey: "nav.history", icon: History },
  { href: "/genealogy", labelKey: "nav.genealogy", icon: Network },
  { href: "/swap", labelKey: "nav.swap", icon: ArrowLeftRight },
  { href: "/learn", labelKey: "nav.learn", icon: GraduationCap },
  { href: "/products", labelKey: "nav.products", icon: LayoutGrid },
  { href: "/news", labelKey: "nav.news", icon: Megaphone },
  { href: "/games", labelKey: "nav.games", icon: Gamepad2 },
  { href: "/contract-actions", labelKey: "nav.contractActions", icon: Terminal },
  { href: "/account", labelKey: "nav.account", icon: ShieldAlert },
  { href: "/admin", labelKey: "nav.admin", icon: ShieldCheck, adminOnly: true },
];
