/**
 * Machine-to-machine auth for the Telegram bot (scripts/telegram-bot/bot.js)
 * talking to this app's internal admin API over localhost. The bot has no
 * wallet to sign with, so admin identity here is a shared secret instead of
 * the wallet-signature check used by the human /admin panel
 * (lib/vpn/adminAuth.ts). Only the bot process (gated itself to the site
 * owner's Telegram chat ID) ever sends this header.
 */
export function verifyBotSecret(request: Request): boolean {
  const configured = process.env.TELEGRAM_BOT_ADMIN_SECRET;
  if (!configured) return false;
  return request.headers.get("x-bot-secret") === configured;
}
