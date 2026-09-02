"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Lock, Minus, Plus as PlusIcon, ShieldOff } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MyVpnAccount } from "@/components/vpn/my-vpn-account";
import { useVpnPayment, type PaymentMethod } from "@/hooks/useVpnPayment";
import { VPN_PAYMENTS_LIVE, PRICE_PER_DEVICE_USD } from "@/lib/vpn/publicConfig";
import { useTranslation } from "@/contexts/language-context";

const MAX_DEVICES = 10;

function PurchaseCard({ onPaid }: { onPaid: () => void }) {
  const { pay, phase, error, reset, requiredUsd, estimatedBnb } = useVpnPayment();
  const { t } = useTranslation();
  const [deviceCount, setDeviceCount] = React.useState(1);
  const [method, setMethod] = React.useState<PaymentMethod>("usdt");
  const isBusy = phase === "paying" || phase === "confirming" || phase === "verifying";

  React.useEffect(() => {
    if (phase === "done") onPaid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <Card className="card-glow flex flex-col">
      <CardHeader>
        <CardTitle>{t("vpnPage.productName")}</CardTitle>
        <CardDescription>{t("vpnPage.productTagline")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t("vpnPage.deviceCount")}</span>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={deviceCount <= 1 || phase === "done"}
              onClick={() => setDeviceCount((c) => Math.max(1, c - 1))}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-6 text-center font-mono text-lg font-bold">{deviceCount}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={deviceCount >= MAX_DEVICES || phase === "done"}
              onClick={() => setDeviceCount((c) => Math.min(MAX_DEVICES, c + 1))}
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {(["usdt", "bnb"] as const).map((m) => (
            <button
              key={m}
              type="button"
              disabled={phase === "done"}
              onClick={() => setMethod(m)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium uppercase transition-colors",
                method === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <p className="text-2xl font-bold">
            ${requiredUsd(deviceCount)}
            <span className="text-sm font-normal text-muted-foreground"> / {t("vpnPage.perMonth")}</span>
          </p>
          {method === "bnb" && (
            <p className="mt-1 text-xs text-muted-foreground">
              ≈ {estimatedBnb(deviceCount)?.toFixed(4) ?? "..."} BNB
            </p>
          )}
        </div>

        {phase === "done" ? (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {t("vpnPage.paidSuccess")}
          </div>
        ) : (
          <Button className="w-full gap-1.5" disabled={isBusy} onClick={() => pay(deviceCount, method)}>
            {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
            {phase === "paying" && t("vpnPage.confirmInWallet")}
            {phase === "confirming" && t("vpnPage.waitingOnChain")}
            {phase === "verifying" && t("vpnPage.verifying")}
            {!isBusy && t("vpnPage.payWithWallet")}
          </Button>
        )}

        {error && (
          <div className="space-y-1.5">
            <p className="text-xs text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={reset}>
              {t("vpnPage.tryAgain")}
            </Button>
          </div>
        )}

        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>{t("vpnPage.featureUnlimited")}</li>
          <li>{t("vpnPage.featureSingleDevice", { price: PRICE_PER_DEVICE_USD })}</li>
        </ul>
        <p className="text-xs text-muted-foreground">{t("vpnPage.afterPayNotice")}</p>
      </CardContent>
    </Card>
  );
}

export default function VpnProductPage() {
  const { t } = useTranslation();
  const [refreshToken, setRefreshToken] = React.useState(0);

  return (
    <div>
      <PageHeader title={t("vpnPage.title")} description={t("vpnPage.description")} />
      <NetworkBanner />

      {!VPN_PAYMENTS_LIVE ? (
        <Card className="card-glow border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ShieldOff className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">{t("vpnPage.notLive")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t("vpnPage.notLiveBody")}</p>
          </CardContent>
        </Card>
      ) : (
        <ConnectWalletGuard>
          <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            {t("vpnPage.payDisclaimer")}
          </div>
          <div className="mx-auto max-w-md">
            <PurchaseCard onPaid={() => setRefreshToken((v) => v + 1)} />
          </div>
          <MyVpnAccount refreshToken={refreshToken} />
        </ConnectWalletGuard>
      )}
    </div>
  );
}
