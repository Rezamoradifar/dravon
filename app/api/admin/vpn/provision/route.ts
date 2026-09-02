import { NextResponse } from "next/server";

import { verifyAdminSignature } from "@/lib/vpn/adminAuth";
import { provisionDevice } from "@/lib/vpn/provision";
import { addDevice, getAccount } from "@/lib/vpn/store";

export const runtime = "nodejs";

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { address, timestamp, signature, walletAddress } = (body ?? {}) as {
    address?: unknown;
    timestamp?: unknown;
    signature?: unknown;
    walletAddress?: unknown;
  };

  if (typeof address !== "string" || typeof timestamp !== "number" || typeof signature !== "string") {
    return NextResponse.json({ error: "Missing admin auth fields" }, { status: 400 });
  }
  const auth = await verifyAdminSignature({ address, timestamp, signature: signature as `0x${string}` });
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  if (typeof walletAddress !== "string" || !WALLET_RE.test(walletAddress)) {
    return NextResponse.json({ error: "Invalid walletAddress" }, { status: 400 });
  }

  let account = await getAccount(walletAddress);
  if (!account) return NextResponse.json({ error: "No account found for this wallet" }, { status: 404 });
  if (account.devices.length >= account.paidDeviceCount) {
    return NextResponse.json({ error: "Nothing pending - this account already has every device it paid for." }, { status: 409 });
  }

  const result = await provisionDevice(walletAddress, account.devices.length + 1, account.backend);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });

  account = await addDevice(walletAddress, result.device);
  return NextResponse.json({ ok: true, config: result.device.config, account });
}
