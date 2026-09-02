import { NextResponse } from "next/server";

import { listAllAccounts } from "@/lib/vpn/store";

export const runtime = "nodejs";

/**
 * Public, aggregate-only stats (no wallet addresses, no device configs) -
 * safe to call from anywhere, unlike /api/admin/vpn/list. Used by the
 * Telegram bot's /start message as real (not fabricated) social proof.
 */
export async function GET() {
  const accounts = await listAllAccounts();
  const totalDevices = accounts.reduce((sum, a) => sum + a.devices.length, 0);
  return NextResponse.json({ ok: true, totalAccounts: accounts.length, totalDevices });
}
