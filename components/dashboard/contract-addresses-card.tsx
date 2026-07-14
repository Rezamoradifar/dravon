"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddressPill } from "@/components/shared/address-pill";
import { FACTORY_ADDRESS } from "@/contracts/addresses";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import { useTranslation } from "@/contexts/language-context";

export function ContractAddressesCard() {
  const { address: windowAddress, isConfirmed } = useLatestRoundWindow();
  const { t } = useTranslation();

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>{t("contractAddresses.title")}</CardTitle>
        <CardDescription>{t("contractAddresses.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">{t("contractAddresses.factory")}</span>
          <AddressPill address={FACTORY_ADDRESS} chars={6} />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">
            {t("contractAddresses.activeWindow")}
            {!isConfirmed && t("contractAddresses.cachedSuffix")}
          </span>
          <AddressPill address={windowAddress} chars={6} />
        </div>
      </CardContent>
    </Card>
  );
}
