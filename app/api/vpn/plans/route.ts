import { NextResponse } from "next/server";

import { MARZBAN_DATA_PLANS } from "@/lib/vpn/types";

export const runtime = "nodejs";

/**
 * Public: the current Marzban GB data plans and prices (see
 * lib/vpn/types.ts). Single source of truth for both the website and the
 * Telegram bot, so a price change here never drifts out of sync between
 * the two storefronts.
 */
export async function GET() {
  return NextResponse.json({ ok: true, plans: MARZBAN_DATA_PLANS });
}
