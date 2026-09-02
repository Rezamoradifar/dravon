#!/usr/bin/env node
"use strict";

/**
 * Standalone NodeShield sales + admin bot - a second, independent storefront
 * next to the website's /products/vpn page, using the exact same on-chain
 * verification: the buyer sends USDT/BNB from their own wallet (any wallet
 * app - there's no in-Telegram wallet connect), pastes the transaction hash
 * back here, and this bot calls the site's own /api/vpn/verify-payment over
 * localhost - the same endpoint the website's payment flow calls - so both
 * storefronts share one source of truth for pricing, verification, and
 * provisioning. No VPN/account logic is duplicated here.
 *
 * Run as its own process (not part of the Next.js app):
 *   pm2 start scripts/telegram-bot/bot.js --name dravon-bot \
 *     --node-args="--env-file-if-exists=.env.local"
 *
 * Required env vars (see .env.example):
 *   TELEGRAM_BOT_TOKEN         - from @BotFather
 *   TELEGRAM_BOT_ADMIN_CHAT_ID - the owner's numeric Telegram user ID
 *   TELEGRAM_BOT_ADMIN_SECRET  - shared secret for the bot-only admin API
 *                                routes (lib/vpn/botAuth.ts) - generate a
 *                                long random string, put the same value in
 *                                both this bot's env and the site's .env.local
 *   NEXT_PUBLIC_VPN_PAYMENT_ADDRESS, NEXT_PUBLIC_VPN_PRICE_PER_DEVICE_USD
 *                              - same values the website uses
 *   SITE_BASE_URL              - defaults to http://localhost:3000
 */

const TelegramBot = require("node-telegram-bot-api");
const QRCode = require("qrcode");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_BOT_ADMIN_CHAT_ID
  ? String(process.env.TELEGRAM_BOT_ADMIN_CHAT_ID)
  : null;
const BOT_SECRET = process.env.TELEGRAM_BOT_ADMIN_SECRET;
const SITE_BASE_URL = process.env.SITE_BASE_URL || "http://localhost:3000";
const PAYMENT_ADDRESS = process.env.NEXT_PUBLIC_VPN_PAYMENT_ADDRESS;
const PRICE_PER_DEVICE_USD = Number(process.env.NEXT_PUBLIC_VPN_PRICE_PER_DEVICE_USD || "1");
const MAX_DEVICES = 10;
const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;
const TXHASH_RE = /^0x[0-9a-fA-F]{64}$/;

if (!TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is not set - refusing to start.");
  process.exit(1);
}
if (!ADMIN_CHAT_ID) {
  console.error("TELEGRAM_BOT_ADMIN_CHAT_ID is not set - the admin commands would be unreachable. Refusing to start.");
  process.exit(1);
}
if (!BOT_SECRET) {
  console.error("TELEGRAM_BOT_ADMIN_SECRET is not set - the admin API calls would all fail. Refusing to start.");
  process.exit(1);
}
if (!PAYMENT_ADDRESS) {
  console.warn("NEXT_PUBLIC_VPN_PAYMENT_ADDRESS is not set - purchases will be rejected until it is.");
}

const bot = new TelegramBot(TOKEN, { polling: true });

/** In-memory per-chat purchase wizard state. Lost on a bot restart - a user
 * mid-flow just runs /buy again. Nothing sensitive is kept here longer than
 * one conversation (no configs, no keys). */
const sessions = new Map();

function isAdmin(chatId) {
  return String(chatId) === ADMIN_CHAT_ID;
}

function resetSession(chatId) {
  sessions.delete(chatId);
}

async function callSiteApi(path, options) {
  const res = await fetch(`${SITE_BASE_URL}${path}`, options);
  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json };
}

async function fetchBnbUsdPrice() {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT");
    const json = await res.json();
    const price = Number(json.price);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}

async function sendDeviceConfigs(chatId, devices) {
  for (const device of devices) {
    const backendLabel = device.backend === "wireguard" ? "WireGuard" : "VPN";
    await bot.sendMessage(
      chatId,
      `✅ ${device.label} (${backendLabel})\n\n\`${device.config}\`\n\nتک‌کاربر و تک‌دستگاه - این کانفیگ رو با کسی به اشتراک نذار.`,
      { parse_mode: "Markdown" },
    );
    try {
      const qrBuffer = await QRCode.toBuffer(device.config, { width: 400 });
      await bot.sendPhoto(chatId, qrBuffer, { caption: `کد QR برای ${device.label}` });
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  }
}

bot.onText(/^\/start/, (msg) => {
  resetSession(msg.chat.id);
  bot.sendMessage(
    msg.chat.id,
    "به NodeShield خوش اومدی 🛡️\n\nهر کانفیگ VPN، ماهی $1، پهنای‌باند نامحدود، تک‌کاربر.\n\nپرداخت مستقیم از کیف‌پول خودت (USDT یا BNB روی BNB Smart Chain) - همون روش سایت.\n\nبرای خرید: /buy\nبرای لغو یه فرآیند نیمه‌کاره: /cancel",
  );
});

bot.onText(/^\/cancel/, (msg) => {
  resetSession(msg.chat.id);
  bot.sendMessage(msg.chat.id, "لغو شد. هر وقت خواستی /buy رو بزن.");
});

bot.onText(/^\/buy/, (msg) => {
  const chatId = msg.chat.id;
  if (!PAYMENT_ADDRESS) {
    bot.sendMessage(chatId, "فروش هنوز فعال نشده - بعداً دوباره امتحان کن.");
    return;
  }
  sessions.set(chatId, { step: "deviceCount" });
  bot.sendMessage(chatId, `چند تا کانفیگ می‌خوای؟ یه عدد بین 1 تا ${MAX_DEVICES} بفرست.`);
});

// --- Admin-only commands -----------------------------------------------

bot.onText(/^\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return;
  const { ok, json } = await callSiteApi("/api/admin/vpn/list", {
    headers: { "x-bot-secret": BOT_SECRET },
  });
  if (!ok || !json?.ok) {
    bot.sendMessage(chatId, `خطا در خوندن دیتا: ${json?.error || "unknown"}`);
    return;
  }
  const accounts = json.accounts;
  const totalDevices = accounts.reduce((sum, a) => sum + a.devices.length, 0);
  const pending = accounts.filter((a) => a.devices.length < a.paidDeviceCount).length;
  const expired = accounts.filter((a) => new Date(a.expiresAt).getTime() < Date.now()).length;
  bot.sendMessage(
    chatId,
    `📊 آمار NodeShield\n\nتعداد اکانت: ${accounts.length}\nتعداد کل دستگاه فعال: ${totalDevices}\nدر انتظار فعال‌سازی: ${pending}\nمنقضی‌شده: ${expired}`,
  );
});

bot.onText(/^\/users/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return;
  const { ok, json } = await callSiteApi("/api/admin/vpn/list", {
    headers: { "x-bot-secret": BOT_SECRET },
  });
  if (!ok || !json?.ok) {
    bot.sendMessage(chatId, `خطا در خوندن دیتا: ${json?.error || "unknown"}`);
    return;
  }
  const accounts = json.accounts;
  if (accounts.length === 0) {
    bot.sendMessage(chatId, "هنوز هیچ اکانتی ثبت نشده.");
    return;
  }
  const lines = accounts.map((a) => {
    const expired = new Date(a.expiresAt).getTime() < Date.now();
    const backendLabel = a.backend === "wireguard" ? "WireGuard" : "VPN";
    return `${a.walletAddress}\n  ${a.devices.length}/${a.paidDeviceCount} device(s) - ${backendLabel} - ${expired ? "منقضی" : "فعال"} تا ${new Date(a.expiresAt).toLocaleDateString()}`;
  });
  // Telegram messages cap at ~4096 chars - chunk into batches.
  const chunkSize = 20;
  for (let i = 0; i < lines.length; i += chunkSize) {
    bot.sendMessage(chatId, lines.slice(i, i + chunkSize).join("\n\n"));
  }
});

bot.onText(/^\/provision (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return;
  const walletAddress = match[1].trim();
  if (!WALLET_RE.test(walletAddress)) {
    bot.sendMessage(chatId, "آدرس کیف‌پول نامعتبره.");
    return;
  }
  const { ok, json } = await callSiteApi("/api/admin/vpn/bot-provision", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-bot-secret": BOT_SECRET },
    body: JSON.stringify({ walletAddress }),
  });
  if (!ok || !json?.ok) {
    bot.sendMessage(chatId, `فعال‌سازی ناموفق: ${json?.error || "unknown"}`);
    return;
  }
  bot.sendMessage(chatId, `✅ دستگاه برای ${walletAddress} فعال شد.`);
  await sendDeviceConfigs(chatId, [json.account.devices[json.account.devices.length - 1]]);
});

// --- Purchase wizard (free-text replies) --------------------------------

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();
  if (text.startsWith("/")) return; // commands handled above

  const session = sessions.get(chatId);
  if (!session) return;

  if (session.step === "deviceCount") {
    const n = Number(text);
    if (!Number.isInteger(n) || n < 1 || n > MAX_DEVICES) {
      bot.sendMessage(chatId, `یه عدد صحیح بین 1 تا ${MAX_DEVICES} بفرست.`);
      return;
    }
    session.deviceCount = n;
    session.step = "backend";
    bot.sendMessage(chatId, "کدوم نوع؟\n1 - WireGuard\n2 - VPN (V2Ray/Shadowsocks)\n\nعدد 1 یا 2 رو بفرست.");
    return;
  }

  if (session.step === "backend") {
    if (text !== "1" && text !== "2") {
      bot.sendMessage(chatId, "فقط 1 یا 2 رو بفرست.");
      return;
    }
    session.backend = text === "1" ? "wireguard" : "marzban";
    session.step = "method";
    bot.sendMessage(chatId, "با چی پرداخت می‌کنی؟\n1 - USDT\n2 - BNB\n\nعدد 1 یا 2 رو بفرست.");
    return;
  }

  if (session.step === "method") {
    if (text !== "1" && text !== "2") {
      bot.sendMessage(chatId, "فقط 1 یا 2 رو بفرست.");
      return;
    }
    session.method = text === "1" ? "usdt" : "bnb";
    session.step = "wallet";
    bot.sendMessage(chatId, "آدرس کیف‌پولی که ازش پرداخت می‌کنی رو بفرست (همون آدرسی که تراکنش رو باهاش می‌زنی، با 0x شروع می‌شه).");
    return;
  }

  if (session.step === "wallet") {
    if (!WALLET_RE.test(text)) {
      bot.sendMessage(chatId, "آدرس کیف‌پول نامعتبره - باید 0x و بعدش 40 کاراکتر باشه.");
      return;
    }
    session.walletAddress = text;
    session.step = "txHash";

    const requiredUsd = session.deviceCount * PRICE_PER_DEVICE_USD;
    if (session.method === "usdt") {
      bot.sendMessage(
        chatId,
        `دقیقاً $${requiredUsd} USDT (BEP-20، شبکه‌ی BNB Smart Chain) رو به این آدرس بفرست:\n\n\`${PAYMENT_ADDRESS}\`\n\nبعد از تأیید تراکنش، هش تراکنش (txHash) رو همینجا بفرست.`,
        { parse_mode: "Markdown" },
      );
    } else {
      const bnbPrice = await fetchBnbUsdPrice();
      const estimate = bnbPrice ? ((requiredUsd / bnbPrice) * 1.08).toFixed(6) : null;
      bot.sendMessage(
        chatId,
        `مبلغ لازم: $${requiredUsd}\n${estimate ? `تقریباً ${estimate} BNB (بر اساس قیمت لحظه‌ای)` : "قیمت لحظه‌ای BNB در دسترس نیست - از کیف‌پولت معادل دلاریش رو حساب کن."}\n\nاین مبلغ رو به این آدرس بفرست:\n\n\`${PAYMENT_ADDRESS}\`\n\nمقدار واقعی موقع تأیید دوباره از قیمت لحظه‌ای زنجیره چک می‌شه، یه‌کم بیشتر بفرست تا مطمئن باشی رد نشه.\n\nبعد از تأیید تراکنش، هش تراکنش (txHash) رو همینجا بفرست.`,
        { parse_mode: "Markdown" },
      );
    }
    return;
  }

  if (session.step === "txHash") {
    if (!TXHASH_RE.test(text)) {
      bot.sendMessage(chatId, "هش تراکنش نامعتبره - باید 0x و بعدش 64 کاراکتر باشه.");
      return;
    }
    bot.sendMessage(chatId, "در حال بررسی پرداخت رو زنجیره...");
    const { ok, json } = await callSiteApi("/api/vpn/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: session.walletAddress,
        txHash: text,
        method: session.method,
        deviceCount: session.deviceCount,
        backend: session.backend,
        intent: "add",
      }),
    });

    if (!ok || !json?.ok) {
      bot.sendMessage(chatId, `تأیید پرداخت ناموفق بود: ${json?.error || "unknown error"}\n\nمی‌تونی دوباره همین هش رو بفرستی، یا /cancel بزنی و از اول شروع کنی.`);
      return;
    }

    const account = json.account;
    const newDevices = account.devices.slice(-session.deviceCount);
    if (newDevices.length > 0 && newDevices.every((d) => d.provisionedAt)) {
      bot.sendMessage(chatId, "✅ پرداخت تأیید شد! این‌م کانفیگ‌هات:");
      await sendDeviceConfigs(chatId, newDevices);
    } else {
      bot.sendMessage(
        chatId,
        "✅ پرداخت تأیید شد، ولی کانفیگ هنوز در حال آماده‌سازیه. به ادمین اطلاع داده شد، به‌زودی برات می‌فرسته.",
      );
      if (ADMIN_CHAT_ID) {
        bot.sendMessage(
          ADMIN_CHAT_ID,
          `⏳ یه پرداخت تأیید شد ولی پرووایژن خودکار کامل نشد.\nکیف‌پول: ${session.walletAddress}\n\nبرای فعال‌سازی دستی: /provision ${session.walletAddress}`,
        );
      }
    }
    resetSession(chatId);
    return;
  }
});

bot.on("polling_error", (err) => {
  console.error("Telegram polling error:", err.message);
});

console.log("dravon-bot: NodeShield Telegram bot started (polling).");
