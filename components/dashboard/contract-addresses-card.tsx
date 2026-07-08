"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddressPill } from "@/components/shared/address-pill";
import { FACTORY_ADDRESS } from "@/contracts/addresses";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";

export function ContractAddressesCard() {
  const { address: windowAddress, isConfirmed } = useLatestRoundWindow();

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>Contracts</CardTitle>
        <CardDescription>
          The factory that deploys round windows, and the latest window it currently points to.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">Factory</span>
          <AddressPill address={FACTORY_ADDRESS} chars={6} />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">
            Active Window{!isConfirmed && " (cached)"}
          </span>
          <AddressPill address={windowAddress} chars={6} />
        </div>
      </CardContent>
    </Card>
  );
}
