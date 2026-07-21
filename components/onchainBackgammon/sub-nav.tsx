"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/games/backgammon-onchain/lobby", label: "Play" },
  { href: "/games/backgammon-onchain/leaderboard", label: "Leaderboard" },
  { href: "/games/backgammon-onchain/history", label: "History" },
  { href: "/games/backgammon-onchain/referral", label: "Referral" },
  { href: "/games/backgammon-onchain/settings", label: "Settings" },
];

export function OnchainBackgammonSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-white/10 px-4 py-2 text-sm sm:px-6">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-full px-3 py-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white",
            pathname === link.href && "bg-white/10 text-white",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
