"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminSignature } from "@/hooks/useAdminSignature";
import { useTranslation } from "@/contexts/language-context";
import type { VpnSubscription } from "@/lib/vpn/store";

export function VpnAdminPanel() {
  const [pending, setPending] = React.useState<VpnSubscription[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [provisioningTx, setProvisioningTx] = React.useState<string | null>(null);
  const [lastConfig, setLastConfig] = React.useState<{ txHash: string; config: string } | null>(null);
  const { address } = useAccount();
  const { signAdminAction } = useAdminSignature();
  const { t } = useTranslation();

  async function loadPending() {
    if (!address) return;
    setIsLoading(true);
    try {
      const { timestamp, signature } = await signAdminAction();
      const res = await fetch("/api/admin/vpn/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, timestamp, signature }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setPending(json.pending);
    } catch (error) {
      toast.error(t("vpnAdmin.loadFailed"), { description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsLoading(false);
    }
  }

  async function provision(sub: VpnSubscription) {
    if (!address) return;
    setProvisioningTx(sub.txHash);
    try {
      const { timestamp, signature } = await signAdminAction();
      const res = await fetch("/api/admin/vpn/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, timestamp, signature, txHash: sub.txHash }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Provisioning failed");
      setLastConfig({ txHash: sub.txHash, config: json.wireguardConfig });
      toast.success(t("vpnAdmin.provisioned"));
      loadPending();
    } catch (error) {
      toast.error(t("vpnAdmin.provisionFailed"), { description: error instanceof Error ? error.message : undefined });
    } finally {
      setProvisioningTx(null);
    }
  }

  return (
    <Card className="card-glow">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{t("vpnAdmin.title")}</CardTitle>
          <CardDescription>{t("vpnAdmin.description")}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={loadPending} disabled={isLoading} className="gap-1.5">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {t("vpnAdmin.refresh")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("vpnAdmin.empty")}</p>
        ) : (
          pending.map((sub) => (
            <div key={sub.txHash} className="rounded-lg border p-3 text-sm">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{sub.tier}</Badge>
                <span className="font-mono text-xs">{sub.walletAddress}</span>
                <span className="text-xs text-muted-foreground">${sub.amountUsdt}</span>
              </div>
              <a
                href={`https://bscscan.com/tx/${sub.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 block truncate text-xs text-primary hover:underline"
              >
                {sub.txHash}
              </a>
              <Button
                size="sm"
                className="gap-1.5"
                disabled={provisioningTx === sub.txHash}
                onClick={() => provision(sub)}
              >
                {provisioningTx === sub.txHash ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                {t("vpnAdmin.provision")}
              </Button>
            </div>
          ))
        )}

        {lastConfig && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-2 text-xs font-medium">{t("vpnAdmin.configFor", { tx: lastConfig.txHash.slice(0, 10) })}</p>
            <textarea
              readOnly
              dir="ltr"
              className="h-40 w-full resize-none rounded-md border bg-background p-2 font-mono text-xs"
              value={lastConfig.config}
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
