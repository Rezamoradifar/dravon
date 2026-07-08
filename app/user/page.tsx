"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import type { Address } from "viem";

import { PageHeader } from "@/components/shared/page-header";
import { WalletSearch } from "@/components/user/wallet-search";
import { UserDashboardCards } from "@/components/user/user-dashboard-cards";

export default function UserDashboardPage() {
  const { address } = useAccount();
  const [searched, setSearched] = React.useState("");

  const target = (searched || address || "") as Address | "";

  return (
    <div>
      <PageHeader title="My Dashboard" description="Look up a wallet's round performance." />
      <div className="mb-6 rounded-xl border bg-card p-4">
        <WalletSearch value={searched} onChange={setSearched} />
      </div>
      <UserDashboardCards address={target || undefined} />
    </div>
  );
}
