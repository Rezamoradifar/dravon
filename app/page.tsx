import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { LatestWindowBanner } from "@/components/shared/latest-window-banner";
import { PriceTicker } from "@/components/shared/price-ticker";
import { WalletInfoCard } from "@/components/dashboard/wallet-info-card";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { ContractAddressesCard } from "@/components/dashboard/contract-addresses-card";
import { RoundOverviewCards } from "@/components/dashboard/round-overview-cards";
import { NetworkGrowthChart } from "@/components/dashboard/network-growth-chart";
import { ActivityPanel } from "@/components/dashboard/activity-panel";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live overview of the current round window."
      />
      <NetworkBanner />
      <LatestWindowBanner />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PriceTicker />
        </div>
        <WalletInfoCard />
      </div>

      <DashboardCards />

      <h2 className="mb-3 mt-8 text-lg font-semibold">Current Round Overview</h2>
      <p className="mb-4 text-sm text-muted-foreground">Live from getMainBulkInfo(0).</p>
      <RoundOverviewCards roundsAgo={0} />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NetworkGrowthChart />
        </div>
        <ContractAddressesCard />
      </div>

      <div className="mt-6">
        <ActivityPanel />
      </div>
    </div>
  );
}
