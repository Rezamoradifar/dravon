"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AuroraDashboardHero, AuroraQuickActions } from "@/components/dashboard/aurora-dashboard-intro";
import { NetworkBanner } from "@/components/shared/network-banner";
import { PriceTicker } from "@/components/shared/price-ticker";
import { WalletInfoCard } from "@/components/dashboard/wallet-info-card";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { ContractAddressesCard } from "@/components/dashboard/contract-addresses-card";
import { RoundOverviewCards } from "@/components/dashboard/round-overview-cards";
import { NetworkGrowthChart } from "@/components/dashboard/network-growth-chart";
import { ActivityPanel } from "@/components/dashboard/activity-panel";
import { NetworkActivityFeed } from "@/components/dashboard/network-activity-feed";
import { StageIndicator } from "@/components/shared/stage-indicator";
import { WeeklyWindowCard } from "@/components/shared/weekly-window-card";
import { useTranslation } from "@/contexts/language-context";

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const fa = locale === "fa";

  return (
    <div className="space-y-0">
      <AuroraDashboardHero />
      <div className="mt-6"><NetworkBanner /></div>

      <div className="scn-panel-heading">
        <div>
          <span className="scn-panel-kicker">{fa ? "دسترسی‌های کاربردی" : "YOUR SHORTCUTS"}</span>
          <h2>{fa ? "از اینجا شروع کن" : "Quick access"}</h2>
          <p>{fa ? "راه‌های اصلی مشاهده حساب و استفاده از شبکه." : "The parts of your workspace you use most."}</p>
        </div>
      </div>
      <AuroraQuickActions />

      <div className="scn-panel-heading mt-9">
        <div>
          <span className="scn-panel-kicker">{fa ? "اطلاعات زنده" : "LIVE DATA"}</span>
          <h2>{fa ? "نمای کلی بازار و کیف پول" : "Market & wallet overview"}</h2>
          <p>{fa ? "در صورت دسترس‌بودن داده‌ها، اطلاعات از ارائه‌دهندگان قیمت و شبکه دریافت می‌شود." : "Data is loaded from available price providers and the blockchain."}</p>
        </div>
        <Link href="/user">{fa ? "حساب من" : "My account"}<ArrowUpRight size={16} /></Link>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><PriceTicker /></div>
        <WalletInfoCard />
      </div>

      <div className="scn-panel-heading">
        <div>
          <span className="scn-panel-kicker">{fa ? "قرارداد" : "CONTRACT"}</span>
          <h2>{fa ? "وضعیت قرارداد و توکن‌ها" : "Contract & token status"}</h2>
          <p>{fa ? "همه اطلاعات قابل دریافت از داده قرارداد نمایش داده می‌شوند." : "Values reflect contract reads when available."}</p>
        </div>
        <Link href="/contract-actions">{fa ? "عملیات قرارداد" : "Contract actions"}<ArrowUpRight size={16} /></Link>
      </div>
      <DashboardCards />

      <div className="scn-panel-heading">
        <div>
          <span className="scn-panel-kicker">{fa ? "راند فعلی" : "CURRENT ROUND"}</span>
          <h2>{t("dashboardPage.currentRoundOverview")}</h2>
          <p>{t("dashboardPage.currentRoundHint")}</p>
        </div>
        <Link href="/statistics">{fa ? "آمار کامل" : "Detailed stats"}<ArrowUpRight size={16} /></Link>
      </div>
      <RoundOverviewCards roundsAgo={0} />

      <div className="scn-panel-heading">
        <div>
          <span className="scn-panel-kicker">{fa ? "قوانین و دوره هفتگی" : "ROUND & WEEKLY WINDOW"}</span>
          <h2>{fa ? "وضعیت مرحله و صندوق هفتگی" : "Stage & weekly progress"}</h2>
          <p>{fa ? "مقادیر این قسمت از قرارداد دریافت می‌شوند." : "This section displays contract-backed values."}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StageIndicator /><WeeklyWindowCard />
      </div>

      <div className="scn-panel-heading">
        <div>
          <span className="scn-panel-kicker">{fa ? "دید تحلیلی" : "NETWORK ANALYTICS"}</span>
          <h2>{fa ? "روند شبکه و قرارداد" : "Network trends & addresses"}</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><NetworkGrowthChart /></div>
        <ContractAddressesCard />
      </div>

      <div className="scn-panel-heading">
        <div>
          <span className="scn-panel-kicker">{fa ? "تاریخچه و رویدادها" : "ACTIVITY"}</span>
          <h2>{fa ? "تراکنش‌ها و فعالیت شبکه" : "Transactions & network activity"}</h2>
        </div>
        <Link href="/history">{fa ? "تاریخچه بیشتر" : "See history"}<ArrowUpRight size={16} /></Link>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NetworkActivityFeed /><ActivityPanel />
      </div>
      <div className="scn-panel-footer">
        <span>{fa ? "قبل از تأیید هر تراکنش، جزئیات و هزینه شبکه را در کیف پول بررسی کن." : "Always verify the transaction and network fee in your wallet before signing."}</span>
        <Link href="/help">{fa ? "مرکز راهنما" : "Help Center"}</Link>
      </div>
    </div>
  );
}
