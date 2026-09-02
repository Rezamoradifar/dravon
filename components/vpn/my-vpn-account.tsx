"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, Loader2, QrCode, ShieldCheck, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/language-context";
import { backendDisplayLabel, type VpnAccount, type VpnDevice } from "@/lib/vpn/types";

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

function DeviceRow({ device }: { device: VpnDevice }) {
  const { t } = useTranslation();
  const [showQr, setShowQr] = React.useState(false);

  return (
    <div className="rounded-lg border p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{device.label}</Badge>
          <Badge variant="outline">{backendDisplayLabel(device.backend)}</Badge>
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
            title={t("myVpn.copy")}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => downloadConfig(device)}
            title={t("myVpn.download")}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant={showQr ? "default" : "ghost"}
            className="h-8 w-8"
            onClick={() => setShowQr((v) => !v)}
            title={showQr ? t("myVpn.hideQr") : t("myVpn.showQr")}
          >
            <QrCode className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <User className="h-3 w-3 shrink-0" />
        {t("myVpn.singleUserNotice")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {device.backend === "wireguard" ? t("myVpn.howToWireguard") : t("myVpn.howToMarzban")}
      </p>

      {showQr && (
        <div className="mt-3 flex justify-center">
          <div className="rounded-lg border bg-white p-3">
            <QRCodeSVG value={device.config} size={180} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Account state is loaded once by the parent page (useVpnAccount) and
 * shared with the purchase card, so both use a single signature prompt
 * instead of two. `error` surfaces a load failure via toast. */
export function MyVpnAccount({
  account,
  isLoading,
  error,
}: {
  account: VpnAccount | null;
  isLoading: boolean;
  error: string | null;
}) {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (error) toast.error(t("myVpn.loadFailed"), { description: error });
  }, [error, t]);

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
            {address && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            )}
          </CardTitle>
          {account && (
            <CardDescription className="flex flex-wrap items-center gap-1.5">
              <span>
                {expired
                  ? t("myVpn.expired")
                  : t("myVpn.expiresOn", { date: new Date(account.expiresAt).toLocaleDateString() })}
              </span>
              <Badge variant="outline">{backendDisplayLabel(account.backend)}</Badge>
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
          <DeviceRow key={device.id} device={device} />
        ))}

        {awaitingCount > 0 && (
          <p className="text-xs text-muted-foreground">{t("myVpn.awaitingProvisioning", { count: awaitingCount })}</p>
        )}
      </CardContent>
    </Card>
  );
}
