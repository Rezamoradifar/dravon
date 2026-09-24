"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { Sidebar } from "./sidebar";
import { NotificationBell } from "@/components/shared/notification-bell";
import { Brand } from "@/components/experience/brand";
import { WalletButton } from "@/components/experience/wallet-button";
import { useExperienceCopy } from "@/lib/experience-copy";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const c = useExperienceCopy();
  return (
    <header className="app-navbar sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
      <div className="flex h-[72px] items-center justify-between gap-2 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={c.menu}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <Link href="/" aria-label={c.ecosystem}>
            <span className="hidden sm:inline">
              <Brand />
            </span>
            <span className="sm:hidden">
              <Brand compact />
            </span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            className="me-4 hidden items-center gap-1 text-xs text-muted-foreground xl:flex"
          >
            {c.home}
            <ArrowUpRight className="h-3 w-3 rtl:-rotate-90" />
          </Link>
          <LanguageToggle />
          <ThemeToggle />
          <NotificationBell />
          <WalletButton compact />
        </div>
      </div>
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="mobile-drawer max-h-[90dvh] overflow-y-auto"
        >
          <DialogTitle className="px-3 pt-2">
            <Brand />
          </DialogTitle>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}
