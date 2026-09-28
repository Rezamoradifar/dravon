"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { ChargeAccountForm } from "@/components/forms/charge-account-form";
import { canPayOffInstallment, canTopUp } from "@/lib/contract-v74";
import { formatUnits } from "viem";
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
  const { isRegistered, currentEntrance, periodEarnable, debt, topupsSinceFlash, isLoading } = useUserRegistration(address);
  const { cap: cap100 } = useEntranceCap(100);
  const [selectedEntrance, setSelectedEntrance] = React.useState<number | undefined>(undefined);
  const { t } = useTranslation();

  const payoffEligible = canPayOffInstallment(currentEntrance, debt);
  const eligible = (target: number) => canTopUp(target, currentEntrance, debt, periodEarnable, cap100, topupsSinceFlash);
  const validSelection = selectedEntrance !== undefined && eligible(selectedEntrance) ? selectedEntrance : undefined;
  const options = payoffEligible ? [50, 100] : [100];

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
            {debt !== undefined && debt > 0n && (
              <div role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm space-y-2">
                <p>{t("contractV74.debt", { amount: formatUnits(debt, 18) })}</p>
                <p>{t("contractV74.upgradeDebt")}</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {options.map((target) => (
                <Card key={target} className={validSelection === target ? "ring-2 ring-primary" : ""}>
                  <CardContent className="space-y-4 p-5">
                    <h2 className="font-semibold">{t(target === 50 ? "contractV74.payoff" : "contractV74.pro")}</h2>
                    <p className="text-sm text-muted-foreground">{t(target === 50 ? "contractV74.payoffDetails" : "contractV74.proDetails")}</p>
                    <Button type="button" disabled={!eligible(target)} aria-pressed={validSelection === target}
                      onClick={() => setSelectedEntrance(target)}>
                      {t(validSelection === target ? "packageTierCards.selected" : "packageTierCards.selectThisPackage")}
                    </Button>
                    {!eligible(target) && <p className="text-xs text-muted-foreground">{t("contractV74.unavailable")}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="max-w-xl">
              <ChargeAccountForm key={`${address}-${validSelection}`} entrance={validSelection} />
            </div>
          </div>
        )}
      </ConnectWalletGuard>
    </div>
  );
}
