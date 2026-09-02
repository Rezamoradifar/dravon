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
 *
 * Local state (gitignored, under data/ next to vpn-accounts.jsonl):
 *   telegram-bot-users.jsonl      - chatId -> last known wallet + account
 *                                   snapshot, appended after every purchase
 *                                   made through this bot. Powers "My
 *                                   status" and the referral reward lookup.
 *                                   This is a cache of what the bot itself
 *                                   already verified on-chain - never a
 *                                   substitute for the site's own signature-
 *                                   gated /api/vpn/my-account.
 *   telegram-bot-referrals.jsonl  - referredChatId -> referrerChatId,
 *                                   appended when a new user opens the bot
 *                                   via a referral deep link.
 */

const fs = require("fs");
const path = require("path");
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
const REFERRAL_BONUS_DAYS = 30;
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
let botUsername = null;

// --- Local JSONL state (same append-only, latest-record-wins pattern as
// lib/vpn/store.ts) --------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "telegram-bot-users.jsonl");
const REFERRALS_FILE = path.join(DATA_DIR, "telegram-bot-referrals.jsonl");

function readJsonl(file) {
  try {
    return fs
      .readFileSync(file, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

function appendJsonl(file, record) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`, "utf8");
}

function saveBotUser(chatId, walletAddress, account) {
  appendJsonl(USERS_FILE, { chatId: String(chatId), walletAddress, account, updatedAt: new Date().toISOString() });
}

function getBotUser(chatId) {
  const all = readJsonl(USERS_FILE).filter((r) => r.chatId === String(chatId));
  return all.length > 0 ? all[all.length - 1] : null;
}

/** Records a new referral the first time a chat is ever seen via a referral
 * deep link - a chat that already has a referral record (or is referring
 * itself) is ignored, so re-opening the same link twice doesn't create
 * duplicate rewards. */
function recordReferralIfNew(referredChatId, referrerChatId) {
  if (String(referredChatId) === String(referrerChatId)) return;
  const existing = readJsonl(REFERRALS_FILE).find((r) => r.referredChatId === String(referredChatId));
  if (existing) return;
  appendJsonl(REFERRALS_FILE, {
    referredChatId: String(referredChatId),
    referrerChatId: String(referrerChatId),
    rewarded: false,
    createdAt: new Date().toISOString(),
  });
}

function getReferralFor(referredChatId) {
  const all = readJsonl(REFERRALS_FILE).filter((r) => r.referredChatId === String(referredChatId));
  return all.length > 0 ? all[all.length - 1] : null;
}

function markReferralRewarded(referredChatId, referrerChatId) {
  appendJsonl(REFERRALS_FILE, {
    referredChatId: String(referredChatId),
    referrerChatId: String(referrerChatId),
    rewarded: true,
    createdAt: new Date().toISOString(),
  });
}

// --- Small helpers ---------------------------------------------------------

/** In-memory per-chat purchase wizard state. Lost on a bot restart - a user
 * mid-flow just runs /buy again. Nothing sensitive is kept here longer than
 * one conversation (no configs, no keys - those go to disk only in
 * telegram-bot-users.jsonl, after a verified purchase). */
const sessions = new Map();

function isAdmin(chatId) {
  return String(chatId) === ADMIN_CHAT_ID;
}

function resetSession(chatId) {
  sessions.delete(chatId);
}

const CANCEL_ROW = [{ text: "❌ لغو", callback_data: "cancel" }];

const MAIN_KEYBOARD = {
  keyboard: [["🛒 خرید VPN", "📊 وضعیت من"], ["🔗 دعوت از دوستان", "ℹ️ راهنما"]],
  resize_keyboard: true,
};

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

async function fetchPublicStats() {
  const { ok, json } = await callSiteApi("/api/vpn/stats", {});
  return ok && json?.ok ? json : null;
}

async function sendDeviceConfigs(chatId, devices) {
  for (const device of devices) {
    const backendLabel = device.backend === "wireguard" ? "WireGuard" : "VPN";
    await bot.sendMessage(
      chatId,
      `✅ *${device.label}* (${backendLabel})\n\n\`${device.config}\`\n\n👤 تک‌کاربر و تک‌دستگاه - این کانفیگ رو با کسی به اشتراک نذار.`,
      { parse_mode: "Markdown" },
    );
    try {
      const qrBuffer = await QRCode.toBuffer(device.config, { width: 400 });
      await bot.sendPhoto(chatId, qrBuffer, { caption: `📷 کد QR برای ${device.label}` });
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  }
}

function deviceCountKeyboard() {
  const numberRow = (start) =>
    Array.from({ length: 5 }, (_, i) => ({
      text: String(start + i),
      callback_data: `dc_${start + i}`,
    }));
  return { inline_keyboard: [numberRow(1), numberRow(6), CANCEL_ROW] };
}

function backendKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🔒 WireGuard", callback_data: "be_wireguard" }],
      [{ text: "🌐 VPN (V2Ray/Shadowsocks)", callback_data: "be_marzban" }],
      CANCEL_ROW,
    ],
  };
}

function methodKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "💵 USDT", callback_data: "pm_usdt" },
        { text: "🟡 BNB", callback_data: "pm_bnb" },
      ],
      CANCEL_ROW,
    ],
  };
}

function startBuyFlow(chatId) {
  if (!PAYMENT_ADDRESS) {
    bot.sendMessage(chatId, "فروش هنوز فعال نشده - بعداً دوباره امتحان کن.");
    return;
  }
  sessions.set(chatId, { step: "deviceCount" });
  bot.sendMessage(chatId, "🖥️ چند تا کانفیگ می‌خوای؟", { reply_markup: deviceCountKeyboard() });
}

async function sendStatus(chatId) {
  const record = getBotUser(chatId);
  if (!record) {
    bot.sendMessage(chatId, "هنوز از طریق این ربات خریدی نداشتی. برای شروع، «🛒 خرید VPN» رو بزن.");
    return;
  }
  const account = record.account;
  const expired = new Date(account.expiresAt).getTime() < Date.now();
  const backendLabel = account.backend === "wireguard" ? "WireGuard" : "VPN";
  const masked = `${record.walletAddress.slice(0, 6)}...${record.walletAddress.slice(-4)}`;
  bot.sendMessage(
    chatId,
    `📊 *وضعیت من* (آخرین وضعیت شناخته‌شده - اگه رو سایت هم تمدید کرده باشی ممکنه به‌روز نباشه)\n\nکیف‌پول: \`${masked}\`\nنوع: ${backendLabel}\nدستگاه: ${account.devices.length}/${account.paidDeviceCount}\nانقضا: ${expired ? "منقضی‌شده" : new Date(account.expiresAt).toLocaleDateString()}`,
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [[{ text: "📥 نمایش کانفیگ‌ها دوباره", callback_data: "resend_configs" }]] },
    },
  );
}

async function sendReferralLink(chatId) {
  const link = `https://t.me/${botUsername}?start=ref_${chatId}`;
  bot.sendMessage(
    chatId,
    `🔗 *دعوت از دوستان*\n\nاین لینک رو برای دوستات بفرست:\n${link}\n\nهر دوستی که با این لینک بیاد و اولین خریدش رو کامل کنه، ${REFERRAL_BONUS_DAYS} روز رایگان به اکانت فعال تو اضافه می‌شه (اگه از قبل کانفیگ فعال داشته باشی).`,
    { parse_mode: "Markdown" },
  );
}

async function maybeRewardReferrer(referredChatId) {
  const referral = getReferralFor(referredChatId);
  if (!referral || referral.rewarded) return;

  const referrerRecord = getBotUser(referral.referrerChatId);
  if (!referrerRecord) {
    if (ADMIN_CHAT_ID) {
      bot.sendMessage(
        ADMIN_CHAT_ID,
        `ℹ️ یه رفرال کامل شد ولی رفرر (chat ${referral.referrerChatId}) هنوز از طریق ربات خریدی نکرده - نمی‌دونیم کیف‌پولش چیه، جایزه اعمال نشد.`,
      );
    }
    return;
  }

  const { ok, json } = await callSiteApi("/api/admin/vpn/grant-bonus", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-bot-secret": BOT_SECRET },
    body: JSON.stringify({ walletAddress: referrerRecord.walletAddress, days: REFERRAL_BONUS_DAYS }),
  });

  if (ok && json?.ok) {
    markReferralRewarded(referredChatId, referral.referrerChatId);
    bot.sendMessage(
      referral.referrerChatId,
      `🎉 یکی از دوستایی که با لینک تو دعوت کردی خریدش رو کامل کرد! ${REFERRAL_BONUS_DAYS} روز رایگان به اکانتت اضافه شد.`,
    ).catch(() => {});
  } else if (ADMIN_CHAT_ID) {
    bot.sendMessage(
      ADMIN_CHAT_ID,
      `ℹ️ یه رفرال کامل شد ولی جایزه اعمال نشد (${json?.error || "unknown"}) - رفرر (${referral.referrerChatId}, ${referrerRecord.walletAddress}) شاید هنوز کانفیگ فعالی نداره.`,
    );
  }
}

bot.onText(/^\/start(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  resetSession(chatId);

  const payload = match && match[1];
  if (payload && payload.startsWith("ref_")) {
    recordReferralIfNew(chatId, payload.slice(4));
  }

  const stats = await fetchPublicStats();
  const statsLine = stats ? `\n\n✅ ${stats.totalDevices} کانفیگ فعال تا الان` : "";

  bot.sendMessage(
    chatId,
    `🛡️ *NodeShield VPN*\n\nهر کانفیگ، ماهی $1، پهنای‌باند نامحدود، تک‌کاربر.\n\nپرداخت مستقیم از کیف‌پول خودت (USDT یا BNB روی BNB Smart Chain) - همون روش سایت.${statsLine}`,
    { parse_mode: "Markdown", reply_markup: MAIN_KEYBOARD },
  );
});

bot.onText(/^\/cancel/, (msg) => {
  resetSession(msg.chat.id);
  bot.sendMessage(msg.chat.id, "لغو شد. هر وقت خواستی «🛒 خرید VPN» رو بزن.");
});

bot.onText(/^\/buy/, (msg) => startBuyFlow(msg.chat.id));

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
    `📊 *آمار NodeShield*\n\nتعداد اکانت: ${accounts.length}\nتعداد کل دستگاه فعال: ${totalDevices}\nدر انتظار فعال‌سازی: ${pending}\nمنقضی‌شده: ${expired}`,
    { parse_mode: "Markdown" },
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

// --- Purchase wizard: button steps --------------------------------------

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  await bot.answerCallbackQuery(query.id).catch(() => {});

  if (data === "cancel") {
    resetSession(chatId);
    bot.editMessageText("لغو شد. هر وقت خواستی «🛒 خرید VPN» رو بزن.", {
      chat_id: chatId,
      message_id: query.message.message_id,
    }).catch(() => {});
    return;
  }

  if (data === "buy_start") {
    startBuyFlow(chatId);
    return;
  }

  if (data === "resend_configs") {
    const record = getBotUser(chatId);
    if (!record) return;
    await sendDeviceConfigs(chatId, record.account.devices);
    return;
  }

  const session = sessions.get(chatId);
  if (!session) return;

  if (data.startsWith("dc_") && session.step === "deviceCount") {
    session.deviceCount = Number(data.slice(3));
    session.step = "backend";
    bot.editMessageText(`🖥️ تعداد: *${session.deviceCount}*\n\n🔐 کدوم نوع؟`, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "Markdown",
      reply_markup: backendKeyboard(),
    }).catch(() => {});
    return;
  }

  if (data.startsWith("be_") && session.step === "backend") {
    session.backend = data.slice(3);
    session.step = "method";
    const backendLabel = session.backend === "wireguard" ? "WireGuard" : "VPN (V2Ray/Shadowsocks)";
    bot.editMessageText(`🔐 نوع: *${backendLabel}*\n\n💳 با چی پرداخت می‌کنی؟`, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "Markdown",
      reply_markup: methodKeyboard(),
    }).catch(() => {});
    return;
  }

  if (data.startsWith("pm_") && session.step === "method") {
    session.method = data.slice(3);
    session.step = "wallet";
    bot.editMessageText(
      `💳 روش: *${session.method.toUpperCase()}*\n\n👛 آدرس کیف‌پولی که ازش پرداخت می‌کنی رو بفرست (همون آدرسی که تراکنش رو باهاش می‌زنی، با 0x شروع می‌شه).`,
      { chat_id: chatId, message_id: query.message.message_id, parse_mode: "Markdown" },
    ).catch(() => {});
    return;
  }
});

// --- Persistent-keyboard buttons + free-text wizard steps ----------------

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();
  if (text.startsWith("/")) return; // commands handled above

  if (text === "🛒 خرید VPN") {
    startBuyFlow(chatId);
    return;
  }
  if (text === "📊 وضعیت من") {
    await sendStatus(chatId);
    return;
  }
  if (text === "🔗 دعوت از دوستان") {
    await sendReferralLink(chatId);
    return;
  }
  if (text === "ℹ️ راهنما") {
    bot.sendMessage(
      chatId,
      "🛡️ *NodeShield VPN*\n\n«🛒 خرید VPN» - خرید کانفیگ جدید\n«📊 وضعیت من» - آخرین وضعیت شناخته‌شده‌ی اکانتت\n«🔗 دعوت از دوستان» - لینک رفرال، ۳۰ روز رایگان برای هر خرید موفق دوستات\n\nپرداخت با USDT یا BNB روی BNB Smart Chain، مستقیم از کیف‌پول خودت.",
      { parse_mode: "Markdown" },
    );
    return;
  }

  const session = sessions.get(chatId);
  if (!session) return;

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
        `💵 دقیقاً *$${requiredUsd}* USDT (BEP-20، شبکه‌ی BNB Smart Chain) رو به این آدرس بفرست:\n\n\`${PAYMENT_ADDRESS}\`\n\nبعد از تأیید تراکنش، هش تراکنش (txHash) رو همینجا بفرست.`,
        { parse_mode: "Markdown" },
      );
    } else {
      const bnbPrice = await fetchBnbUsdPrice();
      const estimate = bnbPrice ? ((requiredUsd / bnbPrice) * 1.08).toFixed(6) : null;
      bot.sendMessage(
        chatId,
        `💰 مبلغ لازم: *$${requiredUsd}*\n${estimate ? `تقریباً *${estimate} BNB* (بر اساس قیمت لحظه‌ای)` : "قیمت لحظه‌ای BNB در دسترس نیست - از کیف‌پولت معادل دلاریش رو حساب کن."}\n\nاین مبلغ رو به این آدرس بفرست:\n\n\`${PAYMENT_ADDRESS}\`\n\nمقدار واقعی موقع تأیید دوباره از قیمت لحظه‌ای زنجیره چک می‌شه، یه‌کم بیشتر بفرست تا مطمئن باشی رد نشه.\n\nبعد از تأیید تراکنش، هش تراکنش (txHash) رو همینجا بفرست.`,
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
    bot.sendMessage(chatId, "⏳ در حال بررسی پرداخت رو زنجیره...");
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
      bot.sendMessage(chatId, `❌ تأیید پرداخت ناموفق بود: ${json?.error || "unknown error"}\n\nمی‌تونی دوباره همین هش رو بفرستی، یا /cancel بزنی و از اول شروع کنی.`);
      return;
    }

    const account = json.account;
    saveBotUser(chatId, session.walletAddress, account);

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

    await maybeRewardReferrer(chatId);
    resetSession(chatId);
    return;
  }
});

bot.on("polling_error", (err) => {
  console.error("Telegram polling error:", err.message);
});

bot
  .getMe()
  .then((me) => {
    botUsername = me.username;
    console.log(`dravon-bot: NodeShield Telegram bot started as @${botUsername} (polling).`);
  })
  .catch((err) => {
    console.error("Failed to fetch bot identity:", err.message);
  });
