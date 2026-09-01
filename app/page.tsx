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
  Wallet,
  Package,
  UserPlus,
  LayoutDashboard,
  Dice5,
  Trophy,
  HelpCircle,
  BadgeCheck,
  Rocket,
  Lock,
  Cpu,
  FileCode2,
  Box,
  Globe2,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { NetworkCanvas } from "@/components/landing/network-canvas";
import { useMainBulkInfo } from "@/hooks/useMainBulkInfo";
import { useCountUp } from "@/hooks/useCountUp";
import { useTranslation } from "@/contexts/language-context";
import { getLocalizedHelpFaq } from "@/lib/help-content";
import { FACTORY_ADDRESS } from "@/contracts/addresses";

const VERIFIED_SOURCE_URL = `https://bscscan.com/address/${FACTORY_ADDRESS}#code`;

/** A small abstract circuit-board glyph for the (not-yet-live) arbitrage bot tiers -
 * deliberately iconographic rather than a fabricated product screenshot. */
function BotCircuitIcon({ variant }: { variant: "plus" | "pro" }) {
  const accent = variant === "pro" ? "var(--fx-accent)" : "var(--fx-secondary)";
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden="true">
      <rect x="15" y="15" width="18" height="18" rx="3" stroke="var(--fx-primary)" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="3.5" fill="var(--fx-primary)" />
      <path d="M24 15V5M24 33v10M15 24H5M33 24h10" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="5" r="2" fill={accent} />
      <circle cx="24" cy="43" r="2" fill={accent} />
      <circle cx="5" cy="24" r="2" fill={accent} />
      <circle cx="43" cy="24" r="2" fill={accent} />
    </svg>
  );
}

const NETWORK_FLOW = [
  { key: "node", icon: Cpu },
  { key: "validator", icon: ShieldCheck },
  { key: "smartContract", icon: FileCode2 },
  { key: "block", icon: Box },
  { key: "network", icon: Globe2 },
] as const;

function toNumber(value?: string): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

const STAT_ACCENT_VAR: Record<"primary" | "secondary" | "accent", string> = {
  primary: "var(--fx-primary)",
  secondary: "var(--fx-secondary)",
  accent: "var(--fx-accent)",
};

function AnimatedStat({
  value,
  prefix = "",
  accent,
}: {
  value: number;
  prefix?: string;
  accent: "primary" | "secondary" | "accent";
}) {
  const animated = useCountUp(value, 1200);
  return (
    <div
      className="font-mono text-lg font-bold tabular-nums md:text-2xl"
      style={{ color: STAT_ACCENT_VAR[accent] }}
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
    <div className="landing-fx relative min-h-screen overflow-x-hidden bg-background text-foreground">
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
      <section className="relative overflow-hidden bg-[color:var(--fx-bg)]">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <NetworkCanvas className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[color:var(--fx-bg)]/50 to-background" />
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center md:px-8 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium"
          style={{
            borderColor: "color-mix(in srgb, var(--fx-primary) 30%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--fx-primary) 10%, transparent)",
            color: "var(--fx-primary)",
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t("landing.badge")}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-gradient-fx text-4xl font-bold uppercase leading-tight tracking-tight md:text-6xl"
        >
          {t("landing.heroTitle")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-2xl text-base md:text-lg"
          style={{ color: "var(--fx-text-muted)" }}
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
            <Link href="/pulse">
              {t("landing.ctaPrimary")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">{t("landing.ctaSecondary")}</Link>
          </Button>
        </motion.div>
        </div>
      </section>

      {/* Smart contract execution */}
      <section className="border-y" style={{ borderColor: "var(--fx-border)", backgroundColor: "var(--fx-surface)" }}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 md:grid-cols-2 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--fx-secondary)" }}
            >
              {t("landing.smartContract.eyebrow")}
            </div>
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl" style={{ color: "var(--fx-text)" }}>
              {t("landing.smartContract.title")}
            </h2>
            <p className="mb-6 text-sm md:text-base" style={{ color: "var(--fx-text-muted)" }}>
              {t("landing.smartContract.description")}
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={VERIFIED_SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide transition-opacity hover:opacity-80"
                style={{ borderColor: "var(--fx-border)", color: "var(--fx-success)" }}
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                {t("landing.smartContract.verified")}
                <ExternalLink className="h-3 w-3" />
              </a>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide"
                style={{ borderColor: "var(--fx-border)", color: "var(--fx-secondary)" }}
              >
                <Rocket className="h-3.5 w-3.5" />
                {t("landing.smartContract.deployed")}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide"
                style={{ borderColor: "var(--fx-border)", color: "var(--fx-accent)" }}
              >
                <Lock className="h-3.5 w-3.5" />
                {t("landing.smartContract.secure")}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="overflow-hidden rounded-2xl border shadow-2xl"
            style={{ borderColor: "var(--fx-border)", backgroundColor: "var(--fx-surface-2)" }}
          >
            <div
              className="flex items-center gap-1.5 border-b px-4 py-3"
              style={{ borderColor: "var(--fx-border)" }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5570]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFC93E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#21D19F]" />
              <span className="ms-2 font-mono text-[11px]" style={{ color: "var(--fx-text-muted)" }}>
                Window.sol
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-relaxed md:text-[13px]" dir="ltr">
              <code style={{ color: "var(--fx-text-muted)" }}>
                <span style={{ color: "var(--fx-accent)" }}>function</span>{" "}
                <span style={{ color: "var(--fx-primary)" }}>begin</span>({"\n"}
                {"    "}
                <span style={{ color: "var(--fx-secondary)" }}>uint24</span> startBox,{"\n"}
                {"    "}
                <span style={{ color: "var(--fx-secondary)" }}>address</span> direct,{"\n"}
                {"    "}
                <span style={{ color: "var(--fx-secondary)" }}>address</span> referral{"\n"}
                ) <span style={{ color: "var(--fx-accent)" }}>external payable</span>{"\n"}
                {"    "}
                nonReentrant onlyLatestWindow {"{"}
                {"\n"}
                {"    "}(uint256 enterUSD, ) = _calculateEntryRequirements({"\n"}
                {"        "}startBox, msg.value, msg.sender{"\n"}
                {"    "});{"\n"}
                {"    "}factory.join(msg.sender, direct, referral, startBox, enterUSD);{"\n"}
                {"}"}
              </code>
            </pre>
          </motion.div>
        </div>
      </section>

      {/* Network architecture flow */}
      <section
        className="border-b py-20"
        style={{ borderColor: "var(--fx-border)", backgroundColor: "var(--fx-bg)" }}
      >
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <div
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--fx-secondary)" }}
            >
              {t("landing.network.eyebrow")}
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl" style={{ color: "var(--fx-text)" }}>
              {t("landing.network.title")}
            </h2>
          </div>

          <div className="relative flex flex-col items-center gap-8">
            <div
              className="absolute inset-y-0 start-1/2 w-px -translate-x-1/2"
              style={{ background: "linear-gradient(to bottom, var(--fx-primary), var(--fx-accent))", opacity: 0.25 }}
            />
            {NETWORK_FLOW.map(({ key, icon: Icon }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="relative z-10 flex items-center gap-3 rounded-xl border px-6 py-3.5 backdrop-blur-sm"
                style={{ borderColor: "var(--fx-border)", backgroundColor: "var(--fx-surface)" }}
              >
                <Icon className="h-4 w-4" style={{ color: "var(--fx-primary)" }} />
                <span className="font-mono text-sm font-semibold tracking-wide" style={{ color: "var(--fx-text)" }}>
                  {t(`landing.network.${key}`)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live stats strip - real numbers, same data source as /pulse */}
      <section className="py-16" style={{ backgroundColor: "var(--fx-surface)" }}>
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div
            className="grid grid-cols-2 gap-4 rounded-2xl border p-6 backdrop-blur-sm sm:grid-cols-3 lg:grid-cols-5"
            style={{ borderColor: "var(--fx-border)", backgroundColor: "var(--fx-surface-2)" }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full"
                    style={{ backgroundColor: info ? "var(--fx-success)" : "var(--fx-text-muted)", opacity: 0.6 }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: info ? "var(--fx-success)" : "var(--fx-text-muted)" }}
                  />
                </span>
                <div className="font-mono text-lg font-bold tabular-nums md:text-2xl" style={{ color: "var(--fx-success)" }}>
                  {info ? t("landing.stats.online") : t("landing.stats.syncing")}
                </div>
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--fx-text-muted)" }}>{t("landing.stats.status")}</div>
            </div>
            <div className="text-center">
              <AnimatedStat value={toNumber(info?.allEnteredUSD)} prefix="$" accent="primary" />
              <div className="mt-1 text-xs" style={{ color: "var(--fx-text-muted)" }}>{t("landing.statVolume")}</div>
            </div>
            <div className="text-center">
              <AnimatedStat value={Number(info?.userCount ?? 0n)} accent="secondary" />
              <div className="mt-1 text-xs" style={{ color: "var(--fx-text-muted)" }}>{t("landing.stats.participants")}</div>
            </div>
            <div className="text-center">
              <AnimatedStat value={toNumber(info?.pointValue)} prefix="$" accent="accent" />
              <div className="mt-1 text-xs" style={{ color: "var(--fx-text-muted)" }}>{t("landing.statPointValue")}</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-xl font-bold md:text-2xl" style={{ color: "var(--fx-primary)" }}>12h</div>
              <div className="mt-1 text-xs" style={{ color: "var(--fx-text-muted)" }}>{t("landing.stats.cadence")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* New products - DEX arbitrage bot (in development) */}
      <section className="py-20" style={{ backgroundColor: "var(--fx-bg)" }}>
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <div
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--fx-secondary)" }}
            >
              {t("landing.arbitrageBot.eyebrow")}
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl" style={{ color: "var(--fx-text)" }}>
              {t("landing.arbitrageBot.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm" style={{ color: "var(--fx-text-muted)" }}>
              {t("landing.arbitrageBot.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {(["plus", "pro"] as const).map((tier, i) => (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border p-6"
                style={{ borderColor: "var(--fx-border)", backgroundColor: "var(--fx-surface)" }}
              >
                <div className="mb-4 flex items-start justify-between">
                  <BotCircuitIcon variant={tier} />
                  <span
                    className="rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide"
                    style={{ borderColor: "var(--fx-border)", color: "var(--fx-text-muted)" }}
                  >
                    {t("landing.arbitrageBot.badge")}
                  </span>
                </div>
                <h3 className="mb-1.5 text-lg font-semibold" style={{ color: "var(--fx-text)" }}>
                  {t(`landing.arbitrageBot.${tier}.name`)}
                </h3>
                <p className="text-sm" style={{ color: "var(--fx-text-muted)" }}>
                  {t(`landing.arbitrageBot.${tier}.description`)}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <p className="text-xs" style={{ color: "var(--fx-text-muted)" }}>
              {t("landing.arbitrageBot.disclaimer")}
            </p>
            <Link
              href="/learn/arbitrage"
              className="text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: "var(--fx-primary)" }}
            >
              {t("landing.arbitrageBot.learnMore")}
            </Link>
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
