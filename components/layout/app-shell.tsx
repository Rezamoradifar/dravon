"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTransition } from "@/components/layout/page-transition";

/**
 * The dashboard app's navbar/sidebar chrome only makes sense once someone is
 * actually inside the app. The landing page ("/") is a full-bleed marketing
 * page with its own header, so it (like /maintenance, handled by the caller)
 * renders children directly instead of wrapping them in the app shell.
 */
export function AppShell({ maintenanceMode, children }: { maintenanceMode: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = maintenanceMode || pathname === "/";

  if (bare) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-border/60 md:block">
          <div className="sticky top-16">
            <Sidebar />
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
