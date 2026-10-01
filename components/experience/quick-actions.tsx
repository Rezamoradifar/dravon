"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Wallet,
  Network,
  History,
  LayoutGrid,
} from "lucide-react";
import { useExperienceCopy } from "@/lib/experience-copy";
export function QuickActions() {
  const c = useExperienceCopy();
  const actions = [
    { href: "/charge", label: c.charge, icon: Wallet },
    { href: "/genealogy", label: c.genealogy, icon: Network },
    { href: "/history", label: c.history, icon: History },
    { href: "/products", label: c.products, icon: LayoutGrid },
  ];
  return (
    <nav aria-label={c.quick} className="quick-actions">
      {actions.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="quick-action">
          <span className="quick-action-icon">
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1 text-sm font-medium">{label}</span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:-rotate-90" />
        </Link>
      ))}
    </nav>
  );
}
