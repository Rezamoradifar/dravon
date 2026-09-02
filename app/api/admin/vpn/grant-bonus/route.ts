import { NextResponse } from "next/server";

import { verifyBotSecret } from "@/lib/vpn/botAuth";
import { grantBonusDays } from "@/lib/vpn/store";

export const runtime = "nodejs";

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;
const MAX_BONUS_DAYS = 90;

/**
 * Bot-secret-gated: grants free days to an existing account with no
 * on-chain payment - used for the Telegram bot's referral reward (a
 * referred user's first purchase gives their referrer 30 free days, if the
 * referrer already has an active account).
 */
export async function POST(request: Request) {
  if (!verifyBotSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { walletAddress, days } = (body ?? {}) as { walletAddress?: unknown; days?: unknown };
  if (typeof walletAddress !== "string" || !WALLET_RE.test(walletAddress)) {
    return NextResponse.json({ error: "Invalid walletAddress" }, { status: 400 });
  }
  if (typeof days !== "number" || !Number.isInteger(days) || days < 1 || days > MAX_BONUS_DAYS) {
    return NextResponse.json({ error: `days must be an integer between 1 and ${MAX_BONUS_DAYS}` }, { status: 400 });
  }

  const account = await grantBonusDays(walletAddress, days);
  if (!account) {
    return NextResponse.json(
      { error: "No qualifying account (must already have at least one paid device) for this wallet" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, account });
}
