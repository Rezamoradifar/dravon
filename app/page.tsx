"use client";

import Link from "next/link";
import Image from "next/image";
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
  Wallet,
  Package,
  UserPlus,
  LayoutDashboard,
  Dice5,
  Trophy,
  HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useMainBulkInfo } from "@/hooks/useMainBulkInfo";
import { useCountUp } from "@/hooks/useCountUp";
import { useTranslation } from "@/contexts/language-context";
import { getLocalizedHelpFaq } from "@/lib/help-content";
import { cn } from "@/lib/utils";

function toNumber(value?: string): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function AnimatedStat({ value, prefix = "", accent }: { value: number; prefix?: string; accent: "primary" | "accent-2" }) {
  const animated = useCountUp(value, 1200);
  return (
    <div
      className={cn(
        "font-mono text-2xl font-bold tabular-nums md:text-3xl",
        accent === "primary" ? "text-primary" : "text-[hsl(var(--accent-2))]",
      )}
    >
      {prefix}
      {Math.round(animated).toLocaleString("en-US")}
    </div>
  );
}

const FEATURES = [
  { key: "stages", icon: ShieldCheck, href: "/dashboard" },
  { key: "weekly", icon: Coins, href: "/weekly" },
  { key: "streak", icon: Flame, href: "/genealogy" },
  { key: "pulse", icon: Radio, href: "/pulse" },
  { key: "games", icon: Gamepad2, href: "/games" },
  { key: "network", icon: Sparkles, href: "/products" },
] as const;

const STEPS = [
  { key: "connect", icon: Wallet },
  { key: "choose", icon: Package },
  { key: "register", icon: UserPlus },
  { key: "track", icon: LayoutDashboard },
] as const;

const NAV_ITEMS = [
  { key: "howItWorks", href: "#how-it-works" },
  { key: "features", href: "#features" },
  { key: "games", href: "#games" },
  { key: "faq", href: "#faq" },
] as const;

const FOOTER_COLUMNS = [
  {
    key: "product",
    links: [
      { key: "dashboard", href: "/dashboard" },
      { key: "register", href: "/register" },
      { key: "genealogy", href: "/genealogy" },
      { key: "weeklyFund", href: "/weekly" },
      { key: "pulse", href: "/pulse" },
    ],
  },
  {
    key: "learn",
    links: [
      { key: "learningCenter", href: "/learn" },
      { key: "flashLoans", href: "/learn/flash-loans" },
      { key: "arbitrage", href: "/learn/arbitrage" },
      { key: "walletSecurity", href: "/learn/wallet-security" },
    ],
  },
  {
    key: "resources",
    links: [
      { key: "help", href: "/help" },
      { key: "products", href: "/products" },
      { key: "news", href: "/news" },
      { key: "games", href: "/games" },
    ],
  },
] as const;

export default function LandingPage() {
  const { t, locale } = useTranslation();
  const { info } = useMainBulkInfo(0);
  const faqPreview = getLocalizedHelpFaq(locale).slice(0, 4);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Ambient background - same neon duotone used across the app */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[480px] w-[480px] rounded-full bg-[hsl(var(--accent-2)/0.15)] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Marketing header with nav menu */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="h-4 w-4" />
            </span>
            {t("nav.brand")}
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
            {NAV_ITEMS.map((item) => (
              <a key={item.key} href={item.href} className="transition-colors hover:text-foreground">
                {t(`landing.nav.${item.key}`)}
              </a>
            ))}
          </nav>

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
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="/images/hero-lattice.png"
            alt=""
            fill
            priority
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center md:px-8 md:pt-28">
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
        </div>
      </section>

      {/* Live stats strip - real numbers, same data source as /pulse */}
      <section className="mx-auto max-w-5xl px-4 pb-20 md:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm md:grid-cols-4">
          <div className="text-center">
            <AnimatedStat value={toNumber(info?.allEnteredUSD)} prefix="$" accent="primary" />
            <div className="mt-1 text-xs text-muted-foreground">{t("landing.statVolume")}</div>
          </div>
          <div className="text-center">
            <AnimatedStat value={Number(info?.userCount ?? 0n)} accent="accent-2" />
            <div className="mt-1 text-xs text-muted-foreground">{t("landing.statUsers")}</div>
          </div>
          <div className="text-center">
            <AnimatedStat value={toNumber(info?.pointValue)} prefix="$" accent="primary" />
            <div className="mt-1 text-xs text-muted-foreground">{t("landing.statPointValue")}</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-[hsl(var(--accent-2))] md:text-3xl">BNB Chain</div>
            <div className="mt-1 text-xs text-muted-foreground">{t("landing.statNetwork")}</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 md:px-8">
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight md:text-3xl">
          {t("landing.howItWorksTitle")}
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-sm text-muted-foreground">
          {t("landing.howItWorksSubtitle")}
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="relative rounded-2xl border border-border/60 bg-card/40 p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mb-1.5 text-xs font-semibold text-primary">
                {t("landing.step", { n: String(i + 1) })}
              </div>
              <h3 className="mb-1.5 font-semibold">{t(`landing.steps.${key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`landing.steps.${key}.description`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 md:px-8">
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

      {/* Games spotlight */}
      <section id="games" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 md:px-8">
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight md:text-3xl">
          {t("landing.gamesTitle")}
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-sm text-muted-foreground">
          {t("landing.gamesSubtitle")}
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Link
            href="/games/backgammon"
            className="card-glow group block overflow-hidden rounded-2xl p-8 transition-transform hover:-translate-y-1"
          >
            <Dice5 className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-lg font-semibold">{t("landing.gameFree.title")}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{t("landing.gameFree.description")}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              {t("landing.playNow")}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </span>
          </Link>
          <Link
            href="/games/backgammon-onchain"
            className="card-glow group block overflow-hidden rounded-2xl p-8 transition-transform hover:-translate-y-1"
          >
            <Trophy className="mb-4 h-8 w-8 text-[hsl(var(--accent-2))]" />
            <h3 className="mb-2 text-lg font-semibold">{t("landing.gameOnchain.title")}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{t("landing.gameOnchain.description")}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--accent-2))]">
              {t("landing.playNow")}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </span>
          </Link>
        </div>
      </section>

      {/* FAQ preview */}
      <section id="faq" className="mx-auto max-w-4xl scroll-mt-20 px-4 pb-24 md:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight md:text-3xl">
          {t("landing.faqTitle")}
        </h2>
        <div className="space-y-3">
          {faqPreview.map((item, i) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="rounded-xl border border-border/60 bg-card/40 p-5"
            >
              <div className="mb-1.5 flex items-start gap-2 font-medium">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item.question}
              </div>
              <p className="ps-6 text-sm text-muted-foreground">{item.answer}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/help">{t("landing.viewAllFaq")}</Link>
          </Button>
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

      {/* Full footer */}
      <footer className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3 flex items-center gap-2 font-semibold tracking-tight">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Layers className="h-3.5 w-3.5" />
                </span>
                {t("nav.brand")}
              </div>
              <p className="text-xs text-muted-foreground">{t("landing.footerTagline")}</p>
            </div>
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.key}>
                <h4 className="mb-3 text-sm font-semibold">{t(`landing.footerCol.${col.key}`)}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.key}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {t(`landing.footerLink.${link.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground md:flex-row">
            <span>{t("landing.footer")}</span>
            <span>{t("landing.footerDisclaimer")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
