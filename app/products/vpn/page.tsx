"use client";

import { CheckCircle2, Loader2, Lock, ShieldOff } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVpnPayment, type VpnTier } from "@/hooks/useVpnPayment";
import { VPN_PAYMENTS_LIVE, VPN_PRICE_USD } from "@/lib/vpn/publicConfig";
import { useTranslation } from "@/contexts/language-context";

const TIERS: VpnTier[] = ["plus", "pro"];

function TierCard({ tier }: { tier: VpnTier }) {
  const { pay, phase, error, reset } = useVpnPayment();
  const { t } = useTranslation();
  const isBusy = phase === "paying" || phase === "confirming" || phase === "verifying";

  return (
    <Card className="card-glow flex flex-col">
      <CardHeader>
        <CardTitle>{t(`vpnPage.${tier}.name`)}</CardTitle>
        <CardDescription>{t(`vpnPage.${tier}.description`)}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <p className="text-3xl font-bold">
          ${VPN_PRICE_USD[tier]}
          <span className="text-sm font-normal text-muted-foreground"> / {t("vpnPage.perMonth")}</span>
        </p>

        {phase === "done" ? (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {t("vpnPage.paidSuccess")}
          </div>
        ) : (
          <Button className="w-full gap-1.5" disabled={isBusy} onClick={() => pay(tier)}>
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

        <p className="text-xs text-muted-foreground">{t("vpnPage.afterPayNotice")}</p>
      </CardContent>
    </Card>
  );
}

export default function VpnProductPage() {
  const { t } = useTranslation();

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TIERS.map((tier) => (
              <TierCard key={tier} tier={tier} />
            ))}
          </div>
        </ConnectWalletGuard>
      )}
    </div>
  );
}
