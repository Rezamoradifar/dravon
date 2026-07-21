"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dices, Trophy, History, Users, Settings, BookOpenText, Vault, ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/games/backgammon-onchain/lobby", label: "Play", icon: Dices },
  { href: "/games/backgammon-onchain/how-to-play", label: "How to play", icon: BookOpenText },
  { href: "/games/backgammon-onchain/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/games/backgammon-onchain/shop", label: "Shop", icon: ShoppingBag },
  { href: "/games/backgammon-onchain/revenue", label: "Revenue plan", icon: Vault },
  { href: "/games/backgammon-onchain/history", label: "History", icon: History },
  { href: "/games/backgammon-onchain/referral", label: "Referral", icon: Users },
  { href: "/games/backgammon-onchain/settings", label: "Settings", icon: Settings },
];

export function OnchainBackgammonSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-white/10 px-4 py-2 text-sm sm:px-6">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white",
            pathname === href && "bg-white/10 text-white",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
