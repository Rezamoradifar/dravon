"use client";

import { PageHeader } from "@/components/shared/page-header";
import { WalletSearch } from "@/components/user/wallet-search";
import { UserDashboardCards } from "@/components/user/user-dashboard-cards";
import { useWalletView } from "@/context/wallet-view-context";

export default function UserDashboardPage() {
  const { searchedAddress, setSearchedAddress, viewedAddress } = useWalletView();

  return (
    <div>
      <PageHeader title="My Dashboard" description="Look up a wallet's round performance." />
      <div className="mb-6 rounded-xl border bg-card p-4">
        <WalletSearch value={searchedAddress} onChange={setSearchedAddress} />
        <p className="mt-2 text-xs text-muted-foreground">
          This wallet stays selected across My Dashboard, Round History and Genealogy.
        </p>
      </div>
      <UserDashboardCards address={viewedAddress} />
    </div>
  );
}
