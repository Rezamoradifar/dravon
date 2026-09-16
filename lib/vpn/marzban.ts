import { getVpnConfig, isMarzbanConfigured, type MarzbanServerConfig } from "@/lib/vpn/config";
import { DEFAULT_LOCATION_ID } from "@/lib/vpn/types";

interface MarzbanInboundInfo {
  tag: string;
  protocol: string;
}

type MarzbanInboundsByProtocol = Record<string, MarzbanInboundInfo[]>;

async function getMarzbanToken(server: MarzbanServerConfig): Promise<string> {
  const res = await fetch(`${server.apiUrl}/api/admin/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: server.username, password: server.password }),
  });
  if (!res.ok) throw new Error(`Marzban auth failed (${res.status})`);
  const json = await res.json();
  return json.access_token as string;
}

async function getMarzbanInbounds(server: MarzbanServerConfig, token: string): Promise<MarzbanInboundsByProtocol> {
  const res = await fetch(`${server.apiUrl}/api/inbounds`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Marzban inbounds fetch failed (${res.status})`);
  return res.json();
}

/** Marzban usernames are restricted to a small charset - this derives one
 * deterministically from a wallet address and device index (a plain
 * purchased device is numbered 1, 2, 3...; the free-trial device uses the
 * literal suffix "trial" instead, one per wallet). */
function marzbanUsername(walletAddress: string, deviceIndex: number | string): string {
  return `w${walletAddress.slice(2, 12).toLowerCase()}d${deviceIndex}`;
}

export type MarzbanResult =
  | { ok: true; subscriptionUrl: string }
  | { ok: false; error: string };

/**
 * Creates one Marzban user covering every currently-configured inbound
 * (whatever protocols the operator has set up - Shadowsocks today, VLESS/
 * VMess/Trojan whenever added - this never hardcodes a protocol list) and
 * returns its subscription URL, importable by any V2Ray/Xray/Shadowsocks
 * client app.
 *
 * `dataLimitBytes` caps total transfer for this Marzban user - 0 means
 * unlimited (Marzban's own convention). Used for both the paid GB-based
 * data plans and the free 100MB trial.
 *
 * `locationId` picks which Marzban server (see VPN_LOCATIONS /
 * lib/vpn/config.ts) actually gets the API calls - defaults to the
 * original single server ("us") so every existing caller keeps working
 * unchanged.
 */
export async function provisionMarzbanDevice(
  walletAddress: string,
  deviceIndex: number | string,
  expireUnixSeconds: number,
  dataLimitBytes: number = 0,
  locationId: string = DEFAULT_LOCATION_ID,
): Promise<MarzbanResult> {
  const config = getVpnConfig();
  if (!isMarzbanConfigured(config, locationId)) return { ok: false, error: "Marzban is not configured yet for this location" };
  const server = config.marzban[locationId]!;

  try {
    const token = await getMarzbanToken(server);
    const inboundsByProtocol = await getMarzbanInbounds(server, token);

    if (Object.keys(inboundsByProtocol).length === 0) {
      return { ok: false, error: "No inbounds configured on the Marzban server yet" };
    }

    const proxies: Record<string, object> = {};
    const inbounds: Record<string, string[]> = {};
    for (const [protocol, list] of Object.entries(inboundsByProtocol)) {
      proxies[protocol] = {};
      inbounds[protocol] = list.map((i) => i.tag);
    }

    const username = marzbanUsername(walletAddress, deviceIndex);
    const res = await fetch(`${server.apiUrl}/api/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        username,
        proxies,
        inbounds,
        expire: expireUnixSeconds,
        data_limit: dataLimitBytes,
        status: "active",
      }),
    });

    if (!res.ok) {
      // A device that already exists for this wallet (e.g. a renewal) is
      // fine - fetch its existing subscription instead of failing.
      if (res.status === 409) {
        const existing = await fetch(`${server.apiUrl}/api/user/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (existing.ok) {
          const json = await existing.json();
          return { ok: true, subscriptionUrl: `${server.apiUrl}${json.subscription_url}` };
        }
      }
      return { ok: false, error: `Marzban user creation failed (${res.status}): ${await res.text()}` };
    }

    const json = await res.json();
    return { ok: true, subscriptionUrl: `${server.apiUrl}${json.subscription_url}` };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown Marzban error" };
  }
}
