"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./nav-links";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useTranslation } from "@/contexts/language-context";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const { t } = useTranslation();

  const links = NAV_LINKS.filter((link) => !link.adminOnly || isAdmin);

  return (
    <nav className="flex flex-col gap-1 p-3">
      {links.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="active-nav-pill"
                className="absolute inset-0 rounded-lg bg-primary"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4 shrink-0" />
            <span className="relative z-10">{t(link.labelKey)}</span>
            {link.adminOnly && (
              <span className="relative z-10 ml-auto rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
                {t("nav.owner")}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
