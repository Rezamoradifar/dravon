import { NextResponse } from "next/server";
import { isAddress } from "viem";

import { verifyWalletSignature } from "@/lib/vpn/walletAuth";
import { getAccount } from "@/lib/vpn/store";

export const runtime = "nodejs";

/**
 * Returns the caller's own VPN account - tier, expiry, and every stored
 * device config. Gated by a wallet signature (not just the address in the
 * body) because a device's config contains a WireGuard private key.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { address, timestamp, signature } = (body ?? {}) as {
    address?: unknown;
    timestamp?: unknown;
    signature?: unknown;
  };

  if (typeof address !== "string" || !isAddress(address) || typeof timestamp !== "number" || typeof signature !== "string") {
    return NextResponse.json({ error: "Missing auth fields" }, { status: 400 });
  }
  const auth = await verifyWalletSignature({ address, timestamp, signature: signature as `0x${string}` });
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const account = await getAccount(address);
  return NextResponse.json({ ok: true, account: account ?? null });
}
