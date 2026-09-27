import { NextResponse } from "next/server";

import { verifyBotSecret } from "@/lib/vpn/botAuth";
import { deliverNextDevice } from "@/lib/vpn/delivery";
import { getAccount } from "@/lib/vpn/store";

export const runtime = "nodejs";

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;

/**
 * Bot-secret-gated twin of /api/admin/vpn/provision (which requires a human
 * wallet signature) - lets the Telegram admin bot manually retry a stuck
 * device the same way the /admin panel's "Provision" button does.
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

  const { walletAddress } = (body ?? {}) as { walletAddress?: unknown };
  if (typeof walletAddress !== "string" || !WALLET_RE.test(walletAddress)) {
    return NextResponse.json({ error: "Invalid walletAddress" }, { status: 400 });
  }

  const account = await getAccount(walletAddress);
  if (!account) return NextResponse.json({ error: "No account found for this wallet" }, { status: 404 });
  if (account.devices.length >= account.paidDeviceCount) {
    return NextResponse.json({ error: "Nothing pending - this account already has every device it paid for." }, { status: 409 });
  }

  const result = await deliverNextDevice(walletAddress);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });

  return NextResponse.json(result);
}
