"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import {
  Activity, ArrowRight, ArrowUpRight, BookOpen, GitBranch,
  History, Layers3, Network, ShieldCheck, Wallet2,
  type LucideIcon,
} from "lucide-react";

import { useTranslation } from "@/contexts/language-context";
import { useMainBulkInfo } from "@/hooks/useMainBulkInfo";

type Variant = "overview" | "account";

type Action = {
  href: string;
  icon: LucideIcon;
  en: { title: string; subtitle: string };
  fa: { title: string; subtitle: string };
};

const DASHBOARD_ACTIONS: Action[] = [
  { href: "/user", icon: Wallet2, en: { title: "My Account", subtitle: "Wallet and account data" }, fa: { title: "حساب من", subtitle: "کیف پول و اطلاعات حساب" } },
  { href: "/genealogy", icon: GitBranch, en: { title: "My Network", subtitle: "Genealogy and referrals" }, fa: { title: "شبکه من", subtitle: "شجره‌نامه و معرفی‌ها" } },
  { href: "/history", icon: History, en: { title: "Round History", subtitle: "Review past activity" }, fa: { title: "تاریخچه", subtitle: "بررسی فعالیت‌های قبلی" } },
  { href: "/register", icon: BookOpen, en: { title: "Registration", subtitle: "Review contract packages" }, fa: { title: "ثبت‌نام", subtitle: "بررسی بسته‌های قرارداد" } },
];

const ACCOUNT_ACTIONS: Action[] = [
  { href: "/dashboard", icon: Activity, en: { title: "Overview", subtitle: "Network dashboard" }, fa: { title: "داشبورد", subtitle: "نمای کلی شبکه" } },
  { href: "/genealogy", icon: GitBranch, en: { title: "Genealogy", subtitle: "See your referral tree" }, fa: { title: "شجره‌نامه", subtitle: "نمایش درخت معرفی" } },
  { href: "/history", icon: History, en: { title: "History", subtitle: "Your round history" }, fa: { title: "تاریخچه", subtitle: "تاریخچه راندهای شما" } },
  { href: "/charge", icon: Wallet2, en: { title: "Account Upgrade", subtitle: "Review eligible levels" }, fa: { title: "ارتقای حساب", subtitle: "مشاهده سطوح مجاز" } },
];

export function AuroraDashboardHero({ variant = "overview" }: { variant?: Variant }) {
  const { locale } = useTranslation();
  const { isConnected } = useAccount();
  const { info } = useMainBulkInfo(0);
  const fa = locale === "fa";
  const userCount = info ? info.userCount.toLocaleString(fa ? "fa-IR" : "en-US") : "—";
  const stage = info && info.stage >= 1 && info.stage <= 4 ? String(info.stage) : "—";
  const text = variant === "overview"
    ? {
        eyebrow: fa ? "نمای کلی قرارداد و شبکه" : "ON-CHAIN NETWORK OVERVIEW",
        title: fa ? "همه‌چیز، روشن و یکپارچه." : "Your network. One clear view.",
        subtitle: fa
          ? "داده‌های قرارداد، وضعیت کیف پول و ابزارهای اصلی را یکجا ببین. قبل از هر تراکنش، جزئیات را در کیف پول بررسی کن."
          : "Explore contract data, wallet access and network tools in one workspace. Review every transaction before signing.",
      }
    : {
        eyebrow: fa ? "فضای کار شخصی" : "YOUR WEB3 WORKSPACE",
        title: fa ? "کنترل حساب، در دست شما." : "Your account. Your control.",
        subtitle: fa
          ? "آدرس کیف پول خود را جست‌وجو کنید، داده‌های واقعی قرارداد را ببینید و تاریخچه و شبکه را بررسی کنید."
          : "Search your wallet, review on-chain account information and navigate your round history and network.",
      };

  return (
    <section className="scn-dashboard-hero" aria-label={text.eyebrow}>
      <div className="relative z-10">
        <div className="scn-hero-eyebrow"><span className="h-2 w-2 rounded-full bg-[#68e5ef]" />{text.eyebrow}</div>
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>
        <div className="scn-hero-action-row">
          <Link href={variant === "overview" ? "/user" : "/history"} className="scn-hero-action scn-hero-action-main">
            {fa ? (variant === "overview" ? "مشاهده حساب من" : "تاریخچه حساب") : (variant === "overview" ? "Explore My Account" : "Account History")}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href={variant === "overview" ? "/pulse" : "/genealogy"} className="scn-hero-action">
            {fa ? (variant === "overview" ? "نبض شبکه" : "شبکه من") : (variant === "overview" ? "Network Pulse" : "My Network")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="scn-hero-mini-metrics">
          <div>
            <span>{fa ? "وضعیت کیف پول" : "Wallet status"}</span>
            <strong className="!text-[12px]">{isConnected ? (fa ? "متصل" : "Connected") : (fa ? "متصل نیست" : "Not connected")}</strong>
          </div>
          <div>
            <span>{fa ? "کاربران راند" : "Round users"}</span>
            <strong>{userCount}</strong>
          </div>
          <div>
            <span>{fa ? "مرحله فعلی" : "Round stage"}</span>
            <strong>{stage}</strong>
          </div>
        </div>
      </div>
      <div className="scn-hero-illustration" aria-hidden="true">
        <div className="scn-hero-orbit" />
        <div className="scn-hero-core"><Layers3 className="h-16 w-16" strokeWidth={1.15} /></div>
        <span className="scn-hero-tag scn-hero-tag-top"><Network size={13} />BNB SMART CHAIN</span>
        <span className="scn-hero-tag scn-hero-tag-bottom"><ShieldCheck size={13} />SMART CONTRACT PLATFORM</span>
      </div>
    </section>
  );
}

export function AuroraQuickActions({ variant = "overview" }: { variant?: Variant }) {
  const { locale } = useTranslation();
  const fa = locale === "fa";
  const actions = variant === "account" ? ACCOUNT_ACTIONS : DASHBOARD_ACTIONS;
  return (
    <nav className="scn-quick-grid" aria-label={fa ? "دسترسی سریع" : "Quick navigation"}>
      {actions.map(({ href, icon: Icon, en, fa: faText }) => {
        const item = fa ? faText : en;
        return (
          <Link href={href} key={href} className="scn-quick-card">
            <span className="scn-quick-icon"><Icon size={21} strokeWidth={1.8} /></span>
            <strong className="scn-quick-title">{item.title}</strong>
            <span className="scn-quick-hint">{item.subtitle}</span>
          </Link>
        );
      })}
    </nav>
  );
}
