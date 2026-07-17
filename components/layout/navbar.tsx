"use client";

import * as React from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { Sidebar } from "./sidebar";
import { NotificationBell } from "@/components/shared/notification-bell";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={t("nav.toggleNavigation")}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu />
          </Button>
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">{t("nav.brand")}</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <NotificationBell />
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 transition-[max-height] duration-300 md:hidden",
          mobileOpen ? "max-h-[80vh]" : "max-h-0",
        )}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>
    </header>
  );
}
