"use client";

import Link from "next/link";
import { ArrowUpRight, Wallet2 } from "lucide-react";

import { AuroraDashboardHero, AuroraQuickActions } from "@/components/dashboard/aurora-dashboard-intro";
import { WalletSearch } from "@/components/user/wallet-search";
import { UserDashboardCards } from "@/components/user/user-dashboard-cards";
import { WeeklyWindowCard } from "@/components/shared/weekly-window-card";
import { ReferralStreakBadge } from "@/components/genealogy/referral-streak-badge";
import { AddressAvatar } from "@/components/shared/address-avatar";
import { AddressPill } from "@/components/shared/address-pill";
import { useWalletView } from "@/context/wallet-view-context";
import { useTranslation } from "@/contexts/language-context";

export default function UserDashboardPage() {
  const { searchedAddress, setSearchedAddress, viewedAddress } = useWalletView();
  const { t, locale } = useTranslation();
  const fa = locale === "fa";

  return (
    <div>
      <AuroraDashboardHero variant="account" />
      <div className="scn-panel-heading">
        <div>
          <span className="scn-panel-kicker">{fa ? "کیف پول و حساب" : "WALLET & ACCOUNT"}</span>
          <h2>{fa ? "کیف پول خود را بررسی کنید" : "Find your wallet"}</h2>
          <p>{t("userPage.description")}</p>
        </div>
      </div>
      <section className="scn-user-search-card" aria-label={fa ? "جست‌وجوی کیف پول" : "Wallet search"}>
        <div className="flex items-center gap-3 mb-4">
          <div className="scn-quick-icon"><Wallet2 size={21} /></div>
          <div>
            <h3 className="text-base font-semibold">{t("userPage.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("userPage.walletPersists")}</p>
          </div>
        </div>
        <WalletSearch value={searchedAddress} onChange={setSearchedAddress} />
        {viewedAddress && (
          <div className="scn-user-wallet-meta">
            <AddressAvatar address={viewedAddress} size={44} />
            <AddressPill address={viewedAddress} chars={6} />
            <Link className="ms-auto inline-flex items-center gap-1 text-xs font-semibold text-primary" href="/history">
              {fa ? "تاریخچه" : "History"}<ArrowUpRight size={14} />
            </Link>
          </div>
        )}
      </section>

      <div className="scn-panel-heading">
        <div>
          <span className="scn-panel-kicker">{fa ? "اطلاعات ثبت‌شده" : "ON-CHAIN ACCOUNT DATA"}</span>
          <h2>{fa ? "آمار کیف پول" : "Wallet metrics"}</h2>
          <p>{fa ? "اطلاعات فقط در صورت دسترسی به قرارداد قابل مشاهده‌اند." : "Live metrics load from the contract when available."}</p>
        </div>
      </div>
      <UserDashboardCards address={viewedAddress} />

      <div className="scn-panel-heading">
        <div>
          <span className="scn-panel-kicker">{fa ? "صندوق و شبکه" : "WEEKLY & REFERRALS"}</span>
          <h2>{fa ? "دوره هفتگی و معرفی‌ها" : "Weekly activity & referrals"}</h2>
        </div>
        <Link href="/genealogy">{fa ? "شجره‌نامه" : "Genealogy"}<ArrowUpRight size={16} /></Link>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyWindowCard address={viewedAddress} />
        <ReferralStreakBadge address={viewedAddress} />
      </div>
      <div className="scn-panel-heading">
        <div>
          <span className="scn-panel-kicker">{fa ? "دسترسی سریع" : "QUICK ACTIONS"}</span>
          <h2>{fa ? "بخش‌های کاربردی" : "Keep exploring"}</h2>
        </div>
      </div>
      <AuroraQuickActions variant="account" />
      <div className="scn-panel-footer">
        <span>{fa ? "این رابط کاربری جایگزین بررسی جزئیات تراکنش در کیف پول نیست." : "This interface does not replace reviewing transactions in your wallet."}</span>
        <Link href="/help">{fa ? "راهنمای کاربری" : "User guide"}</Link>
      </div>
    </div>
  );
}
