import { NextResponse } from "next/server";
import { isAddress } from "viem";

import { getVpnConfig, isMarzbanConfigured } from "@/lib/vpn/config";
import { provisionMarzbanTrial } from "@/lib/vpn/provision";
import { countTrialsInLast24h, hasUsedTrial, recordTrial } from "@/lib/vpn/trialStore";
import { TRIAL_DAILY_LIMIT, TRIAL_DATA_LIMIT_MB, TRIAL_DAYS } from "@/lib/vpn/types";

export const runtime = "nodejs";

/**
 * Free, no-payment, one-time-per-wallet Marzban trial (100MB / 3 days by
 * default - see lib/vpn/types.ts). No txHash, no on-chain check - the main
 * abuse guard is "one per wallet address" (see lib/vpn/trialStore.ts), plus
 * a global TRIAL_DAILY_LIMIT across all wallets, since a wallet address
 * costs nothing to generate and the per-wallet limit alone can't stop
 * someone from farming many. Neither is a real security boundary - this
 * exists to let someone try the service before paying, not to gate a
 * scarce resource.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { walletAddress } = (body ?? {}) as { walletAddress?: unknown };
  if (typeof walletAddress !== "string" || !isAddress(walletAddress)) {
    return NextResponse.json({ error: "Invalid walletAddress" }, { status: 400 });
  }

  const config = getVpnConfig();
  if (!isMarzbanConfigured(config)) {
    return NextResponse.json({ error: "The trial backend is not configured yet" }, { status: 503 });
  }

  if (await hasUsedTrial(walletAddress)) {
    return NextResponse.json({ error: "This wallet has already used its free trial" }, { status: 409 });
  }

  if ((await countTrialsInLast24h()) >= TRIAL_DAILY_LIMIT) {
    return NextResponse.json(
      { error: "The daily free trial limit has been reached - please try again later." },
      { status: 429 },
    );
  }

  const result = await provisionMarzbanTrial(walletAddress);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const expiresAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await recordTrial({
    walletAddress,
    subscriptionUrl: result.device.config,
    grantedAt: new Date().toISOString(),
    expiresAt,
  });

  return NextResponse.json({
    ok: true,
    subscriptionUrl: result.device.config,
    expiresAt,
    dataLimitMb: TRIAL_DATA_LIMIT_MB,
    days: TRIAL_DAYS,
  });
}
