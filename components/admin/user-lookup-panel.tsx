"use client";

import * as React from "react";
import type { Address } from "viem";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WalletSearch } from "@/components/user/wallet-search";
import { UserDashboardCards } from "@/components/user/user-dashboard-cards";
import { useTranslation } from "@/contexts/language-context";

export function UserLookupPanel() {
  const [searched, setSearched] = React.useState("");
  const { t } = useTranslation();

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>{t("userLookup.title")}</CardTitle>
        <CardDescription>{t("userLookup.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <WalletSearch value={searched} onChange={setSearched} />
        <UserDashboardCards address={(searched as Address) || undefined} />
      </CardContent>
    </Card>
  );
}
