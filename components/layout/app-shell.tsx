"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserRound,
  LayoutGrid,
  Settings2,
} from "lucide-react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { PageTransition } from "./page-transition";
import { useExperienceCopy } from "@/lib/experience-copy";
import { cn } from "@/lib/utils";
export function AppShell({
  maintenanceMode,
  children,
}: {
  maintenanceMode: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const c = useExperienceCopy();
  if (maintenanceMode || pathname === "/") return <>{children}</>;
  const links = [
    { href: "/dashboard", label: c.overview, icon: LayoutDashboard },
    { href: "/user", label: c.user, icon: UserRound },
    { href: "/products", label: c.products, icon: LayoutGrid },
    { href: "/account", label: c.preferences, icon: Settings2 },
  ];
  return (
    <div className="app-workspace min-h-screen">
      <a href="#main-content" className="skip-link">
        {c.skip}
      </a>
      <Navbar />
      <div className="flex">
        <aside className="app-sidebar hidden w-[232px] shrink-0 border-e lg:block">
          <div className="sticky top-[72px] max-h-[calc(100dvh-72px)] overflow-y-auto scrollbar-thin">
            <Sidebar />
          </div>
        </aside>
        <main
          id="main-content"
          className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-7 lg:pb-12 xl:px-10"
        >
          <div className="mx-auto max-w-[1400px]">
            <PageTransition>{children}</PageTransition>
            <footer className="workspace-footer">
              <span dir="ltr">{c.ecosystem}</span>
              <Link href="/help">{c.help}</Link>
            </footer>
          </div>
        </main>
      </div>
      <nav aria-label={c.mobileNav} className="mobile-bottom-nav">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(pathname === href && "active")}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
