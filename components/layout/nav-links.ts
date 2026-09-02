import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  UserPlus,
  Wallet,
  BarChart3,
  UserCircle,
  History,
  Network,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowLeftRight,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  Terminal,
  HelpCircle,
  Gamepad2,
  Radio,
  Coins,
} from "lucide-react";

export interface NavLink {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export interface NavGroup {
  labelKey: string;
  links: NavLink[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: "nav.section.overview",
    links: [
      { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
      { href: "/pulse", labelKey: "nav.pulse", icon: Radio },
      { href: "/weekly", labelKey: "nav.weeklyFund", icon: Coins },
      { href: "/statistics", labelKey: "nav.statistics", icon: BarChart3 },
    ],
  },
  {
    labelKey: "nav.section.account",
    links: [
      { href: "/user", labelKey: "nav.user", icon: UserCircle },
      { href: "/register", labelKey: "nav.register", icon: UserPlus },
      { href: "/genealogy", labelKey: "nav.genealogy", icon: Network },
      { href: "/history", labelKey: "nav.history", icon: History },
      { href: "/charge", labelKey: "nav.charge", icon: Wallet },
    ],
  },
  {
    labelKey: "nav.section.explore",
    links: [
      { href: "/swap", labelKey: "nav.swap", icon: ArrowLeftRight },
      { href: "/learn", labelKey: "nav.learn", icon: GraduationCap },
      { href: "/products", labelKey: "nav.products", icon: LayoutGrid },
      { href: "/products/vpn", labelKey: "nav.vpn", icon: Shield },
      { href: "/news", labelKey: "nav.news", icon: Megaphone },
      { href: "/games", labelKey: "nav.games", icon: Gamepad2 },
      { href: "/help", labelKey: "nav.help", icon: HelpCircle },
    ],
  },
  {
    labelKey: "nav.section.admin",
    links: [
      { href: "/account", labelKey: "nav.account", icon: ShieldAlert },
      { href: "/contract-actions", labelKey: "nav.contractActions", icon: Terminal },
      { href: "/admin", labelKey: "nav.admin", icon: ShieldCheck, adminOnly: true },
    ],
  },
];
