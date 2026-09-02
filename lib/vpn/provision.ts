import { randomUUID } from "crypto";
import { NodeSSH } from "node-ssh";

import { getVpnConfig, isServerConfigured, type VpnConfig } from "@/lib/vpn/config";
import type { VpnDevice } from "@/lib/vpn/store";

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;

export type ProvisionResult = { ok: true; device: VpnDevice } | { ok: false; error: string };

/**
 * SSHes into the configured VPN server and runs scripts/vpn/add-peer.sh to
 * create one real WireGuard peer. Shared by both the automatic
 * post-payment path (verify-payment) and the admin panel's manual retry,
 * so there is exactly one place that talks to the server.
 */
export async function provisionDevice(walletAddress: string, label: string): Promise<ProvisionResult> {
  if (!WALLET_RE.test(walletAddress)) return { ok: false, error: "Invalid wallet address" };

  const config: VpnConfig = getVpnConfig();
  if (!isServerConfigured(config)) return { ok: false, error: "VPN server is not configured yet" };

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
      device: { id: randomUUID(), label, provisionedAt: new Date().toISOString(), config: result.stdout },
    };
  } catch (error) {
    return { ok: false, error: `Could not reach VPN server: ${error instanceof Error ? error.message : "unknown error"}` };
  } finally {
    ssh.dispose();
  }
}
