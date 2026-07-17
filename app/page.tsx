"use client";

import { useAccount } from "wagmi";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { PriceTicker } from "@/components/shared/price-ticker";
import { WalletInfoCard } from "@/components/dashboard/wallet-info-card";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { ContractAddressesCard } from "@/components/dashboard/contract-addresses-card";
import { RoundOverviewCards } from "@/components/dashboard/round-overview-cards";
import { NetworkGrowthChart } from "@/components/dashboard/network-growth-chart";
import { ActivityPanel } from "@/components/dashboard/activity-panel";
import { NetworkActivityFeed } from "@/components/dashboard/network-activity-feed";
import { TeamBreakdownCard } from "@/components/shared/team-breakdown-card";
import { useTranslation } from "@/contexts/language-context";

export default function DashboardPage() {
  const { address } = useAccount();
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("dashboardPage.title")}
        description={t("dashboardPage.description")}
      />
      <NetworkBanner />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PriceTicker />
        </div>
        <div className="space-y-4">
          <WalletInfoCard />
          <TeamBreakdownCard address={address} />
        </div>
      </div>

      <DashboardCards />

      <h2 className="mb-3 mt-8 text-lg font-semibold">{t("dashboardPage.currentRoundOverview")}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{t("dashboardPage.currentRoundHint")}</p>
      <RoundOverviewCards roundsAgo={0} />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NetworkGrowthChart />
        </div>
        <ContractAddressesCard />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NetworkActivityFeed />
        <ActivityPanel />
      </div>
    </div>
  );
}
