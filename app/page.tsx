"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Layers,
  ShieldCheck,
  Coins,
  Flame,
  Radio,
  Gamepad2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useMainBulkInfo } from "@/hooks/useMainBulkInfo";
import { useTranslation } from "@/contexts/language-context";

function toNumber(value?: string): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

const FEATURES = [
  { key: "stages", icon: ShieldCheck, href: "/dashboard" },
  { key: "weekly", icon: Coins, href: "/weekly" },
  { key: "streak", icon: Flame, href: "/genealogy" },
  { key: "pulse", icon: Radio, href: "/pulse" },
  { key: "games", icon: Gamepad2, href: "/games" },
  { key: "network", icon: Sparkles, href: "/products" },
] as const;

export default function LandingPage() {
  const { t } = useTranslation();
  const { info } = useMainBulkInfo(0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Ambient background - same neon duotone used across the app */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[480px] w-[480px] rounded-full bg-[hsl(var(--accent-2)/0.15)] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Minimal marketing header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="h-4 w-4" />
            </span>
            {t("nav.brand")}
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/dashboard">
                {t("landing.launchApp")}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center md:px-8 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t("landing.badge")}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-gradient text-4xl font-bold leading-tight tracking-tight md:text-6xl"
        >
          {t("landing.heroTitle")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          {t("landing.heroSubtitle")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              {t("landing.ctaPrimary")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pulse">{t("landing.ctaSecondary")}</Link>
          </Button>
        </motion.div>
      </section>

      {/* Live stats strip - real numbers, same data source as /pulse */}
      <section className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm md:grid-cols-4">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-primary md:text-3xl">
              ${toNumber(info?.allEnteredUSD).toLocaleString("en-US")}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{t("landing.statVolume")}</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-[hsl(var(--accent-2))] md:text-3xl">
              {Number(info?.userCount ?? 0n).toLocaleString("en-US")}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{t("landing.statUsers")}</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-primary md:text-3xl">
              ${toNumber(info?.pointValue).toLocaleString("en-US")}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{t("landing.statPointValue")}</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-[hsl(var(--accent-2))] md:text-3xl">BNB Chain</div>
            <div className="mt-1 text-xs text-muted-foreground">{t("landing.statNetwork")}</div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-4 pb-24 md:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight md:text-3xl">
          {t("landing.featuresTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ key, icon: Icon, href }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={href} className="card-glow block rounded-2xl p-6 transition-transform hover:-translate-y-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 font-semibold">{t(`landing.feature.${key}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`landing.feature.${key}.description`)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-24 text-center md:px-8">
        <div className="card-glow rounded-2xl px-8 py-14">
          <h2 className="text-gradient text-2xl font-bold tracking-tight md:text-3xl">
            {t("landing.closingTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            {t("landing.closingSubtitle")}
          </p>
          <Button asChild size="lg" className="mt-7 gap-2">
            <Link href="/dashboard">
              {t("landing.ctaPrimary")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        {t("landing.footer")}
      </footer>
    </div>
  );
}
