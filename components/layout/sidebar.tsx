"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Layers3, ShieldCheck } from "lucide-react";

import { NAV_GROUPS } from "./nav-links";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useTranslation } from "@/contexts/language-context";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const { t, locale } = useTranslation();

  return (
    <div className="flex min-h-0 flex-col">
      <div className="scn-side-header">
        <span className="scn-side-eyebrow">SMART CONTRACT / WEB3</span>
        <h2>{locale === "fa" ? "فضای کار شما" : "Your Workspace"}</h2>
        <p>{locale === "fa" ? "دسترسی روشن به حساب، شبکه و ابزارهای قرارداد." : "Your account, network and contract tools in one place."}</p>
      </div>
      <nav className="scn-side-nav" aria-label={t("nav.toggleNavigation")}>
        {NAV_GROUPS.map(group => {
          const links = group.links.filter(link => !link.adminOnly || isAdmin);
          if (!links.length) return null;
          return (
            <div key={group.labelKey} className="scn-side-group">
              <span className="scn-side-group-label">{t(group.labelKey)}</span>
              {links.map(link => {
                const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    data-active={active}
                    aria-current={active ? "page" : undefined}
                    className="scn-side-link"
                  >
                    <span className="scn-side-link-icon"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">{t(link.labelKey)}</span>
                    {link.adminOnly && <span className="scn-side-owner">{t("nav.owner")}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="scn-side-footer">
        <ShieldCheck size={18} className="text-[#7be2f2]" />
        <strong>{locale === "fa" ? "پیش از امضا، بررسی کنید" : "Verify before you sign"}</strong>
        <p>{locale === "fa" ? "هر تراکنش را در کیف پول خود بررسی کنید. برای مشاهده کد قرارداد به اکسپلورر بروید." : "Review every wallet transaction. Inspect the contract independently on BscScan."}</p>
        <Link onClick={onNavigate} href="/help">{locale === "fa" ? "راهنمای استفاده" : "Read the guide"}<ArrowUpRight size={15} /></Link>
      </div>
    </div>
  );
}
