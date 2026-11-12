"use client";

import * as React from "react";
import Link from "next/link";
import { WalletConnectControl } from "@/components/shared/wallet-connect-control";
import { ArrowLeft, Globe2, Layers3, Menu, X } from "lucide-react";

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
    <header className="scn-app-navbar">
      <div className="scn-app-header-inner flex items-center justify-between gap-2 px-3 sm:px-5 md:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="icon"
            className="scn-app-header-action shrink-0 md:hidden"
            aria-label={t("nav.toggleNavigation")}
            aria-expanded={mobileOpen}
            aria-controls="scn-app-mobile-navigation"
            onClick={() => setMobileOpen(value => !value)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5" aria-label="Smart Contract Platform Dashboard">
            <span className="scn-app-mark"><Layers3 className="h-5 w-5" /></span>
            <span className="scn-app-brand-name hidden min-[450px]:flex">
              <strong>SMART CONTRACT</strong>
              <small>PLATFORM</small>
            </span>
          </Link>
          <span className="scn-app-header-pill ms-4 hidden lg:inline-flex">
            <Globe2 className="h-4 w-4" />
            BNB SMART CHAIN
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button asChild variant="outline" size="sm" className="scn-app-header-action hidden gap-2 lg:inline-flex">
            <Link href="/"><ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("nav.backToLanding")}</Link>
          </Button>
          <LanguageToggle />
          <ThemeToggle />
          <NotificationBell />
          <div className="scn-app-nav-wallet min-w-0 whitespace-nowrap">
            <WalletConnectControl
              showBalance={false}
              chainStatus={{ smallScreen: "none", largeScreen: "icon" }}
              accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
            />
          </div>
        </div>
      </div>
      <div
        id="scn-app-mobile-navigation"
        className={cn(
          "scn-app-menu overflow-hidden transition-[max-height] duration-300 md:hidden",
          mobileOpen ? "max-h-[80vh]" : "max-h-0",
        )}
      >
        <div className="scn-app-sidebar max-h-[80vh] overflow-y-auto scrollbar-thin">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>
    </header>
  );
}
