"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "./nav-links";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useTranslation } from "@/contexts/language-context";
import { useExperienceCopy } from "@/lib/experience-copy";
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const { t } = useTranslation();
  const c = useExperienceCopy();
  return (
    <nav className="dr-sidebar" aria-label={c.navLabel}>
      {NAV_GROUPS.map((group) => {
        const links = group.links.filter((link) => !link.adminOnly || isAdmin);
        if (!links.length) return null;
        return (
          <div key={group.labelKey} className="space-y-1">
            <span className="sidebar-label">{t(group.labelKey)}</span>
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/products" &&
                  link.href !== "/learn" &&
                  link.href !== "/games" &&
                  pathname.startsWith(`${link.href}/`));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn("sidebar-link", active && "is-active")}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{t(link.labelKey)}</span>
                  {link.adminOnly && (
                    <span className="ms-auto text-[10px]">
                      {t("nav.owner")}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
      <Link href="/help" onClick={onNavigate} className="sidebar-help">
        <LifeBuoy className="mb-3 h-5 w-5 text-primary" />
        <strong className="text-sm">{c.supportTitle}</strong>
        <span className="mt-2 block text-xs leading-6 text-muted-foreground">
          {c.supportBody}
        </span>
        <ArrowUpRight className="mt-3 h-4 w-4 text-primary rtl:-rotate-90" />
      </Link>
    </nav>
  );
}
