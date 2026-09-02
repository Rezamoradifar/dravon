import { randomUUID } from "crypto";
import { NodeSSH } from "node-ssh";

import { getVpnConfig, isServerConfigured, isMarzbanConfigured, type VpnConfig } from "@/lib/vpn/config";
import { provisionMarzbanDevice } from "@/lib/vpn/marzban";
import type { VpnBackend, VpnDevice } from "@/lib/vpn/store";

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;

export type ProvisionResult = { ok: true; device: VpnDevice } | { ok: false; error: string };

async function provisionWireguardDevice(walletAddress: string, label: string): Promise<ProvisionResult> {
  const config: VpnConfig = getVpnConfig();
  if (!isServerConfigured(config)) return { ok: false, error: "WireGuard server is not configured yet" };

  const ssh = new NodeSSH();
  try {
    await ssh.connect({
      host: config.server.host!,
      port: config.server.port,
      username: config.server.username!,
      privateKeyPath: config.server.privateKeyPath!,
    });

    const result = await ssh.execCommand(`sudo /opt/dravon-vpn/add-peer.sh "${walletAddress}"`);
    if (result.code !== 0) {
      return { ok: false, error: `Provisioning script failed: ${result.stderr || result.stdout}` };
    }

    return {
      ok: true,
      device: {
        id: randomUUID(),
        label,
        provisionedAt: new Date().toISOString(),
        backend: "wireguard",
        config: result.stdout,
      },
    };
  } catch (error) {
    return { ok: false, error: `Could not reach VPN server: ${error instanceof Error ? error.message : "unknown error"}` };
  } finally {
    ssh.dispose();
  }
}

/**
 * Provisions one real device on whichever backend the buyer picked:
 * "wireguard" SSHes into the WireGuard server and runs
 * scripts/vpn/add-peer.sh; "marzban" calls Marzban's REST API directly
 * (see lib/vpn/marzban.ts) and covers whatever protocols (Shadowsocks,
 * VLESS, ...) are currently configured there. Shared by both the automatic
 * post-payment path (verify-payment) and the admin panel's manual retry.
 */
export async function provisionDevice(
  walletAddress: string,
  deviceIndex: number,
  backend: VpnBackend,
): Promise<ProvisionResult> {
  if (!WALLET_RE.test(walletAddress)) return { ok: false, error: "Invalid wallet address" };
  const label = `Device ${deviceIndex}`;

  if (backend === "wireguard") return provisionWireguardDevice(walletAddress, label);

  const config = getVpnConfig();
  if (!isMarzbanConfigured(config)) return { ok: false, error: "Marzban is not configured yet" };

  // 30 days from now, matching SUBSCRIPTION_DAYS - Marzban tracks its own
  // per-user expiry independent of our account-level one, so a device stays
  // usable even if re-provisioned slightly before our own expiry check runs.
  const expireUnix = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
  const result = await provisionMarzbanDevice(walletAddress, deviceIndex, expireUnix);
  if (!result.ok) return { ok: false, error: result.error };

  return {
    ok: true,
    device: {
      id: randomUUID(),
      label,
      provisionedAt: new Date().toISOString(),
      backend: "marzban",
      config: result.subscriptionUrl,
    },
  };
}
