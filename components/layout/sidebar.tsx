"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "./nav-links";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useTranslation } from "@/contexts/language-context";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const { t } = useTranslation();

  return (
    <nav className="flex flex-col gap-4 p-3">
      {NAV_GROUPS.map((group) => {
        const links = group.links.filter((link) => !link.adminOnly || isAdmin);
        if (links.length === 0) return null;
        return (
          <div key={group.labelKey} className="flex flex-col gap-0.5">
            <span className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
              {t(group.labelKey)}
            </span>
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="active-nav-pill"
                      className="nav-active-glow absolute inset-0 rounded-xl bg-primary"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                      active ? "bg-primary-foreground/15" : "bg-muted/60",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="relative z-10">{t(link.labelKey)}</span>
                  {link.adminOnly && (
                    <span className="relative z-10 ml-auto rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
                      {t("nav.owner")}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
