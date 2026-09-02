"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Copy, Download, Loader2, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWalletSignature } from "@/hooks/useWalletSignature";
import { useTranslation } from "@/contexts/language-context";
import type { VpnAccount, VpnDevice } from "@/lib/vpn/types";

function downloadConfig(device: VpnDevice) {
  const slug = device.label.replace(/\s+/g, "-").toLowerCase();
  // WireGuard devices carry a real .conf file; Marzban devices carry a
  // subscription URL (importable by any V2Ray/Shadowsocks/Xray client) -
  // saved as plain text rather than mislabeled as a .conf file.
  const filename = device.backend === "wireguard" ? `${slug}.conf` : `${slug}-subscription.txt`;
  const blob = new Blob([device.config], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Re-fetches whenever refreshToken changes - the parent bumps it after a
 * successful payment so a newly-provisioned device shows up immediately. */
export function MyVpnAccount({ refreshToken }: { refreshToken: number }) {
  const { address, isConnected } = useAccount();
  const { signWalletAction } = useWalletSignature();
  const { t } = useTranslation();
  const [account, setAccount] = React.useState<VpnAccount | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const { timestamp, signature } = await signWalletAction();
      const res = await fetch("/api/vpn/my-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, timestamp, signature }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load account");
      setAccount(json.account);
    } catch (error) {
      toast.error(t("myVpn.loadFailed"), { description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refreshToken]);

  React.useEffect(() => {
    if (isConnected) load();
  }, [isConnected, load]);

  if (!isConnected || (!account && !isLoading)) return null;

  const expired = account ? new Date(account.expiresAt).getTime() < Date.now() : false;
  const awaitingCount = account ? account.paidDeviceCount - account.devices.length : 0;

  return (
    <Card className="card-glow mt-6">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {t("myVpn.title")}
          </CardTitle>
          {account && (
            <CardDescription className="flex flex-wrap items-center gap-1.5">
              <span>
                {expired
                  ? t("myVpn.expired")
                  : t("myVpn.expiresOn", { date: new Date(account.expiresAt).toLocaleDateString() })}
              </span>
              <Badge variant="outline" className="uppercase">
                {account.backend}
              </Badge>
            </CardDescription>
          )}
        </div>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </CardHeader>
      <CardContent className="space-y-3">
        {account?.devices.length === 0 && awaitingCount === 0 && (
          <p className="text-sm text-muted-foreground">{t("myVpn.noAccountYet")}</p>
        )}
        {account?.devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{device.label}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(device.provisionedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => {
                  navigator.clipboard.writeText(device.config);
                  toast.success(t("myVpn.copied"));
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => downloadConfig(device)}>
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {awaitingCount > 0 && (
          <p className="text-xs text-muted-foreground">{t("myVpn.awaitingProvisioning", { count: awaitingCount })}</p>
        )}
      </CardContent>
    </Card>
  );
}
