import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { LatestWindowBanner } from "@/components/shared/latest-window-banner";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { ContractAddressesCard } from "@/components/dashboard/contract-addresses-card";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live overview of the current round window."
      />
      <NetworkBanner />
      <LatestWindowBanner />
      <DashboardCards />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ContractAddressesCard />
      </div>
    </div>
  );
}
