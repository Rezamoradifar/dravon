"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTransition } from "@/components/layout/page-transition";
import { useLanguage } from "@/contexts/language-context";

/**
 * The landing is a standalone editorial experience.
 * Every signed-in/functional route shares the Aurora workspace shell.
 * Contract hooks, wallet providers and route implementations remain intact.
 */
export function AppShell({ maintenanceMode, children }: { maintenanceMode: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const { dir } = useLanguage();
  const bare = maintenanceMode || pathname === "/";

  if (bare) return <>{children}</>;

  return (
    <div className="scn-app flex min-h-screen flex-col" dir={dir}>
      <Navbar />
      <div className="flex min-h-0 flex-1">
        <aside className="scn-app-sidebar hidden w-[268px] shrink-0 md:block">
          <div className="sticky top-[76px] max-h-[calc(100vh-76px)] overflow-y-auto scrollbar-thin">
            <Sidebar />
          </div>
        </aside>
        <main id="app-main-content" className="scn-app-content">
          <div className="scn-app-container">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
