import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { LatestWindowBanner } from "@/components/shared/latest-window-banner";
import { PriceTicker } from "@/components/shared/price-ticker";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { ContractAddressesCard } from "@/components/dashboard/contract-addresses-card";
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

      <div className="mb-6">
        <PriceTicker />
      </div>

      <DashboardCards />

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
