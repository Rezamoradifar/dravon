import { NextResponse } from "next/server";
import { isAddress } from "viem";

import { verifyWalletSignature } from "@/lib/vpn/walletAuth";
import { provisionDevice } from "@/lib/vpn/provision";
import { addDevice, getAccount, DEVICE_LIMIT } from "@/lib/vpn/store";

export const runtime = "nodejs";

/**
 * Lets an account holder provision an additional device themselves, up to
 * their tier's DEVICE_LIMIT - e.g. a Pro subscriber adding their 2nd/3rd
 * device without waiting on an admin.
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
  if (!account) return NextResponse.json({ error: "No active subscription for this wallet" }, { status: 404 });
  if (new Date(account.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "Subscription has expired - renew first" }, { status: 403 });
  }
  if (account.devices.length >= DEVICE_LIMIT[account.tier]) {
    return NextResponse.json(
      { error: `Your ${account.tier} plan allows up to ${DEVICE_LIMIT[account.tier]} device(s)` },
      { status: 409 },
    );
  }

  const result = await provisionDevice(address, account.tier, `Device ${account.devices.length + 1}`);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });

  const updated = await addDevice(address, result.device);
  return NextResponse.json({ ok: true, account: updated });
}
