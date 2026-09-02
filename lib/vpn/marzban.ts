import { getVpnConfig, isMarzbanConfigured } from "@/lib/vpn/config";

interface MarzbanInboundInfo {
  tag: string;
  protocol: string;
}

type MarzbanInboundsByProtocol = Record<string, MarzbanInboundInfo[]>;

async function getMarzbanToken(): Promise<string> {
  const config = getVpnConfig();
  const res = await fetch(`${config.marzban.apiUrl}/api/admin/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: config.marzban.username!, password: config.marzban.password! }),
  });
  if (!res.ok) throw new Error(`Marzban auth failed (${res.status})`);
  const json = await res.json();
  return json.access_token as string;
}

async function getMarzbanInbounds(token: string): Promise<MarzbanInboundsByProtocol> {
  const config = getVpnConfig();
  const res = await fetch(`${config.marzban.apiUrl}/api/inbounds`, {
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
 */
export async function provisionMarzbanDevice(
  walletAddress: string,
  deviceIndex: number | string,
  expireUnixSeconds: number,
  dataLimitBytes: number = 0,
): Promise<MarzbanResult> {
  const config = getVpnConfig();
  if (!isMarzbanConfigured(config)) return { ok: false, error: "Marzban is not configured yet" };

  try {
    const token = await getMarzbanToken();
    const inboundsByProtocol = await getMarzbanInbounds(token);

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
    const res = await fetch(`${config.marzban.apiUrl}/api/user`, {
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
        const existing = await fetch(`${config.marzban.apiUrl}/api/user/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (existing.ok) {
          const json = await existing.json();
          return { ok: true, subscriptionUrl: `${config.marzban.apiUrl}${json.subscription_url}` };
        }
      }
      return { ok: false, error: `Marzban user creation failed (${res.status}): ${await res.text()}` };
    }

    const json = await res.json();
    return { ok: true, subscriptionUrl: `${config.marzban.apiUrl}${json.subscription_url}` };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown Marzban error" };
  }
}
