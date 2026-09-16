import { NextResponse } from "next/server";

import { getVpnConfig, isMarzbanConfigured } from "@/lib/vpn/config";
import { VPN_LOCATIONS } from "@/lib/vpn/types";

export const runtime = "nodejs";

/**
 * Public: every marketed server location plus whether it's actually live
 * right now (its Marzban credentials are configured - see
 * lib/vpn/config.ts). Single source of truth for both the website's
 * decorative country strip and the Telegram bot's real country picker, so
 * a new server going live never needs a code change on either storefront -
 * just its MARZBAN_<CODE>_* env vars.
 */
export async function GET() {
  const config = getVpnConfig();
  const locations = VPN_LOCATIONS.map((location) => ({
    ...location,
    available: isMarzbanConfigured(config, location.id),
  }));
  return NextResponse.json({ ok: true, locations });
}
