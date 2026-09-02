import { NextResponse } from "next/server";

import { verifyBotSecret } from "@/lib/vpn/botAuth";
import { listAllAccounts } from "@/lib/vpn/store";

export const runtime = "nodejs";

/**
 * Full account list for the Telegram admin bot (see scripts/telegram-bot/bot.js)
 * - includes device configs, so this must only ever be called with the bot
 * secret over localhost, never exposed publicly or called from the browser.
 */
export async function GET(request: Request) {
  if (!verifyBotSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accounts = await listAllAccounts();
  return NextResponse.json({ ok: true, accounts });
}
