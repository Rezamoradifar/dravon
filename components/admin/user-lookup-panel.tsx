"use client";

import * as React from "react";
import type { Address } from "viem";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WalletSearch } from "@/components/user/wallet-search";
import { UserDashboardCards } from "@/components/user/user-dashboard-cards";

export function UserLookupPanel() {
  const [searched, setSearched] = React.useState("");

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>User Lookup</CardTitle>
        <CardDescription>Search any wallet&apos;s on-chain round data via getUserBulkInfo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <WalletSearch value={searched} onChange={setSearched} />
        <UserDashboardCards address={(searched as Address) || undefined} />
      </CardContent>
    </Card>
  );
}
