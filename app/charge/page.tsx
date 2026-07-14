"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { ChargeAccountForm } from "@/components/forms/charge-account-form";
import { PackageTierCards, type TierStatus } from "@/components/registration/package-tier-cards";
import { PriceTicker } from "@/components/shared/price-ticker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUserRegistration } from "@/hooks/useUserRegistration";
import { useEntranceCap } from "@/hooks/useEntranceCap";
import { tierByEntrance } from "@/lib/packages";
import { useTranslation } from "@/contexts/language-context";

function NotRegisteredNotice() {
  const { t } = useTranslation();
  return (
    <Card className="card-glow">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-medium">{t("chargePage.notRegisteredTitle")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("chargePage.notRegisteredBody")}</p>
        <Button asChild className="gap-1.5">
          <Link href="/register">
            {t("chargePage.goToRegister")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ChargeAccountPage() {
  const { address } = useAccount();
  const { isRegistered, currentEntrance, periodEarnable, isLoading } = useUserRegistration(address);
  const { cap: cap100 } = useEntranceCap(100);
  const [selectedEntrance, setSelectedEntrance] = React.useState<number | undefined>(undefined);
  const { t } = useTranslation();

  function getStatus(entrance: number): TierStatus {
    if (currentEntrance === undefined) return { valid: false, reason: t("chargePage.loadingCurrentTier") };
    if (entrance > currentEntrance) return { valid: true };
    if (entrance === 100 && currentEntrance === 100) {
      if (cap100 === undefined) return { valid: false, reason: t("chargePage.loadingCap") };
      if (periodEarnable !== undefined && periodEarnable < cap100) return { valid: true };
      return { valid: false, reason: t("chargePage.renewalLocked") };
    }
    return { valid: false, reason: t("chargePage.alreadyAtTier") };
  }

  return (
    <div>
      <PageHeader title={t("chargePage.title")} description={t("chargePage.description")} />
      <NetworkBanner />

      <div className="mb-6">
        <PriceTicker />
      </div>

      <ConnectWalletGuard>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !isRegistered ? (
          <NotRegisteredNotice />
        ) : (
          <div className="space-y-6">
            {currentEntrance !== undefined && (
              <p className="text-sm text-muted-foreground">
                {t("chargePage.currentPackage")}{" "}
                <Badge variant="outline">
                  {tierByEntrance(currentEntrance)?.name ?? t("chargePage.boxLabel", { n: currentEntrance })}
                </Badge>
              </p>
            )}
            <PackageTierCards selectedEntrance={selectedEntrance} onSelect={setSelectedEntrance} getStatus={getStatus} />
            <div className="max-w-xl">
              <ChargeAccountForm entrance={selectedEntrance} />
            </div>
          </div>
        )}
      </ConnectWalletGuard>
    </div>
  );
}
