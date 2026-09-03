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
 * provisioning. No VPN/account logic is duplicated here. GB data plans and
 * their prices are fetched from /api/vpn/plans (also site-owned) rather
 * than hardcoded here, so the bot can never quote a stale price.
 *
 * Bilingual (English default, Persian available via the 🌐 Language
 * button) - see the T dictionary and t() below. Every user-facing string
 * goes through t(lang, key, params); nothing is hardcoded to one language
 * except country names and plan labels/IDs (proper nouns / site-shared
 * data, kept as-is in both languages) and the "VPN Unlimited" plan's
 * marketing description (Persian, written verbatim at the site owner's
 * request - not part of this bilingual system).
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
 *                                   status". This is a cache of what the bot
 *                                   itself already verified on-chain - never
 *                                   a substitute for the site's own
 *                                   signature-gated /api/vpn/my-account.
 *   telegram-bot-referrals.jsonl  - referredChatId -> referrerChatId,
 *                                   appended when a new user opens the bot
 *                                   via a referral deep link. Tracking only
 *                                   - no automatic reward (see /grant for
 *                                   manually rewarding someone).
 *   telegram-bot-lang.jsonl       - chatId -> chosen language ("en"/"fa").
 *                                   Defaults to "en" when absent.
 *
 * Only one VPN server exists today (185.172.64.24, geolocated to the
 * United States) - the country picker below shows nine more as an honest
 * roadmap ("launching soon"), never as a working choice, so nobody thinks
 * picking one changes anything yet. This mirrors the website's own
 * app/products/vpn/page.tsx country picker exactly.
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
const DEFAULT_LANG = "en";
const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;
const TXHASH_RE = /^0x[0-9a-fA-F]{64}$/;

const COUNTRIES = [
  { code: "US", flag: "🇺🇸", name: "United States", available: true },
  { code: "DE", flag: "🇩🇪", name: "Germany", available: false },
  { code: "NL", flag: "🇳🇱", name: "Netherlands", available: false },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", available: false },
  { code: "SG", flag: "🇸🇬", name: "Singapore", available: false },
  { code: "JP", flag: "🇯🇵", name: "Japan", available: false },
  { code: "CA", flag: "🇨🇦", name: "Canada", available: false },
  { code: "FR", flag: "🇫🇷", name: "France", available: false },
  { code: "AE", flag: "🇦🇪", name: "UAE", available: false },
  { code: "TR", flag: "🇹🇷", name: "Turkey", available: false },
];

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

// --- i18n -------------------------------------------------------------

const T = {
  en: {
    buttonBuy: "🛒 Buy VPN",
    buttonTrial: "🎁 Free Trial",
    buttonStatus: "📊 My Status",
    buttonInvite: "🔗 Invite Friends",
    buttonLanguage: "🌐 Language",
    buttonHelp: "ℹ️ Help",
    cancel: "❌ Cancel",
    cancelled: "Cancelled. Tap 🛒 Buy VPN whenever you're ready.",
    countrySoonAlert: "🚧 This country is launching soon!",
    salesNotLive: "Sales aren't live yet - check back later.",
    chooseCountry: "🌍 Which country?",
    countrySoonLabel: " (soon)",
    countryChosen: "🌍 Country: *🇺🇸 United States*\n\n🖥️ How many configs do you want?",
    deviceCountChosen: (p) => `🖥️ Count: *${p.count}*\n\n🔐 Which type?`,
    backendWireguard: "🔒 WireGuard",
    backendMarzban: "🌐 VPN (V2Ray/Shadowsocks)",
    backendChosenMarzban: "🔐 Type: *VPN (V2Ray/Shadowsocks)*\n\n📶 How much data do you want?",
    backendChosenWireguard: "🔐 Type: *WireGuard*\n\n💳 How will you pay?",
    dataPlanChosen: (p) => `📶 Data: *${p.label}*\n\n💳 How will you pay?`,
    methodChosen: (p) => `💳 Method: *${p.method}*\n\n👛 Send the wallet address you'll pay from (starts with 0x).`,
    invalidWallet: "Invalid wallet address - must start with 0x, followed by 40 characters.",
    invalidTxHash: "Invalid transaction hash - must start with 0x, followed by 64 characters.",
    payUsdt: (p) =>
      `💵 Send exactly *$${p.amount}* USDT (BEP-20, BNB Smart Chain) to this address:\n\n\`${p.address}\`\n\nOnce the transaction confirms, send its transaction hash (txHash) here.`,
    payBnb: (p) =>
      `💰 Amount needed: *$${p.amount}*\n${p.estimate ? `About *${p.estimate} BNB* (at the current price)` : "Live BNB price unavailable - work out the dollar equivalent from your wallet."}\n\nSend that amount to this address:\n\n\`${p.address}\`\n\nThe actual amount is re-checked against the live price at verification, so send a bit extra to be safe.\n\nOnce the transaction confirms, send its transaction hash (txHash) here.`,
    checkingPayment: "⏳ Checking your payment on-chain...",
    paymentFailed: (p) => `❌ Payment verification failed: ${p.error}\n\nYou can resend the same hash, or /cancel to start over.`,
    paymentConfirmedHeader: "✅ Payment confirmed! Here are your configs:",
    provisioningPending: "✅ Payment confirmed, but your config is still being generated. The admin has been notified and will send it shortly.",
    inviteFriendsPrompt: "Introduce your friends to NodeShield too 👇",
    dataLabel: "Data:",
    singleUserNotice: "Single user, single device - don't share this config.",
    qrCaption: (p) => `📷 QR code for ${p.label}`,
    startWelcome: (p) => `🛡️ *NodeShield VPN*\n\nEach config, $1/month, unlimited bandwidth, single user.\n\nPay directly from your own wallet (USDT or BNB on BNB Smart Chain) - same as the website.${p.statsLine}`,
    statsLine: (p) => `\n\n✅ ${p.count} active configs so far`,
    helpText: () =>
      "🛡️ *NodeShield VPN*\n\n🛒 Buy VPN - purchase a new config\n🎁 Free Trial - 100MB/3 days free (once, VPN type only)\n📊 My Status - your last known account status\n🔗 Invite Friends - your personal link to share\n🌐 Language - switch between English/Persian\n\nPay with USDT or BNB on BNB Smart Chain, straight from your own wallet.",
    trialIntro: "🎁 *Free Trial*\n\n100MB, 3 days, completely free - once per wallet (VPN/V2Ray type only).\n\nSend your wallet address (just to identify your account - no payment needed).",
    trialGenerating: "⏳ Generating your trial config...",
    trialAlreadyUsed: "❌ This wallet has already used its free trial - one per wallet.",
    trialDailyLimit: "❌ The daily free trial limit has been reached - try again later.",
    trialUnknownError: (p) => `❌ ${p.error || "Unknown error"}`,
    trialSuccessFooter: (p) => `This config is active until *${p.date}* or until ${p.mb}MB is used (whichever comes first). If you like it, tap 🛒 Buy VPN.`,
    statusNoRecord: "You haven't purchased through this bot yet. Tap 🛒 Buy VPN to get started.",
    statusHeader: (p) =>
      `📊 *My Status* (last known state - may be out of date if you renewed on the website)\n\nWallet: \`${p.wallet}\`\nType: ${p.backend}\nDevices: ${p.deviceCount}/${p.paidCount}\nExpires: ${p.expiry}`,
    statusExpired: "expired",
    resendConfigsButton: "📥 Resend configs",
    upgradeButton: "🔺 Upgrade to Unlimited",
    upgradeIntro: "🔺 *Upgrade to Unlimited*\n\nThis gives you a new unlimited config (your existing ones stay active too).\n\n💳 How will you pay?",
    referralHeader: (p) => `🔗 Invite Friends\n\nSend this link to your friends to introduce them to NodeShield:\n${p.link}`,
    getReferralLinkButton: "🔗 Get invite link",
    languagePrompt: "🌐 Choose your language:",
    languageSetEn: "Language set to English.",
    languageSetFa: "زبان روی فارسی تنظیم شد.",
    adminUnauthorizedDataError: (p) => `Error loading data: ${p.error}`,
    adminStats: (p) => `📊 *NodeShield Stats*\n\nAccounts: ${p.accounts}\nTotal active devices: ${p.devices}\nAwaiting provisioning: ${p.pending}\nExpired: ${p.expired}`,
    adminNoAccounts: "No accounts yet.",
    adminUserLine: (p) => `${p.wallet}\n  ${p.deviceCount}/${p.paidCount} device(s) - ${p.backend} - ${p.status} until ${p.expiry}`,
    adminStatusActive: "active",
    adminStatusExpired: "expired",
    adminInvalidWallet: "Invalid wallet address.",
    adminProvisionFailed: (p) => `Provisioning failed: ${p.error}`,
    adminProvisioned: (p) => `✅ Device provisioned for ${p.wallet}.`,
    adminGrantFailed: (p) => `Not applied: ${p.error}`,
    adminGranted: (p) => `✅ ${p.days} day(s) added to ${p.wallet}. New expiry: ${p.expiry}`,
    pendingProvisionAdminNotice: (p) => `⏳ A payment was confirmed but automatic provisioning didn't finish.\nWallet: ${p.wallet}\n\nTo provision manually: /provision ${p.wallet}`,
  },
  fa: {
    buttonBuy: "🛒 خرید VPN",
    buttonTrial: "🎁 تست رایگان",
    buttonStatus: "📊 وضعیت من",
    buttonInvite: "🔗 دعوت از دوستان",
    buttonLanguage: "🌐 زبان",
    buttonHelp: "ℹ️ راهنما",
    cancel: "❌ لغو",
    cancelled: "لغو شد. هر وقت خواستی «🛒 خرید VPN» رو بزن.",
    countrySoonAlert: "🚧 این کشور در حال لانچه - به‌زودی اضافه می‌شه!",
    salesNotLive: "فروش هنوز فعال نشده - بعداً دوباره امتحان کن.",
    chooseCountry: "🌍 کدوم کشور؟",
    countrySoonLabel: " (به‌زودی)",
    countryChosen: "🌍 کشور: *🇺🇸 United States*\n\n🖥️ چند تا کانفیگ می‌خوای؟",
    deviceCountChosen: (p) => `🖥️ تعداد: *${p.count}*\n\n🔐 کدوم نوع؟`,
    backendWireguard: "🔒 WireGuard",
    backendMarzban: "🌐 VPN (V2Ray/Shadowsocks)",
    backendChosenMarzban: "🔐 نوع: *VPN (V2Ray/Shadowsocks)*\n\n📶 چقدر حجم می‌خوای؟",
    backendChosenWireguard: "🔐 نوع: *WireGuard*\n\n💳 با چی پرداخت می‌کنی؟",
    dataPlanChosen: (p) => `📶 حجم: *${p.label}*\n\n💳 با چی پرداخت می‌کنی؟`,
    methodChosen: (p) => `💳 روش: *${p.method}*\n\n👛 آدرس کیف‌پولی که ازش پرداخت می‌کنی رو بفرست (با 0x شروع می‌شه).`,
    invalidWallet: "آدرس کیف‌پول نامعتبره - باید 0x و بعدش 40 کاراکتر باشه.",
    invalidTxHash: "هش تراکنش نامعتبره - باید 0x و بعدش 64 کاراکتر باشه.",
    payUsdt: (p) =>
      `💵 دقیقاً *$${p.amount}* USDT (BEP-20، شبکه‌ی BNB Smart Chain) رو به این آدرس بفرست:\n\n\`${p.address}\`\n\nبعد از تأیید تراکنش، هش تراکنش (txHash) رو همینجا بفرست.`,
    payBnb: (p) =>
      `💰 مبلغ لازم: *$${p.amount}*\n${p.estimate ? `تقریباً *${p.estimate} BNB* (بر اساس قیمت لحظه‌ای)` : "قیمت لحظه‌ای BNB در دسترس نیست - از کیف‌پولت معادل دلاریش رو حساب کن."}\n\nاین مبلغ رو به این آدرس بفرست:\n\n\`${p.address}\`\n\nمقدار واقعی موقع تأیید دوباره از قیمت لحظه‌ای زنجیره چک می‌شه، یه‌کم بیشتر بفرست تا مطمئن باشی رد نشه.\n\nبعد از تأیید تراکنش، هش تراکنش (txHash) رو همینجا بفرست.`,
    checkingPayment: "⏳ در حال بررسی پرداخت رو زنجیره...",
    paymentFailed: (p) => `❌ تأیید پرداخت ناموفق بود: ${p.error}\n\nمی‌تونی دوباره همین هش رو بفرستی، یا /cancel بزنی و از اول شروع کنی.`,
    paymentConfirmedHeader: "✅ پرداخت تأیید شد! این‌م کانفیگ‌هات:",
    provisioningPending: "✅ پرداخت تأیید شد، ولی کانفیگ هنوز در حال آماده‌سازیه. به ادمین اطلاع داده شد، به‌زودی برات می‌فرسته.",
    inviteFriendsPrompt: "دوستات رو هم با NodeShield آشنا کن 👇",
    dataLabel: "حجم:",
    singleUserNotice: "تک‌کاربر و تک‌دستگاه - این کانفیگ رو با کسی به اشتراک نذار.",
    qrCaption: (p) => `📷 کد QR برای ${p.label}`,
    startWelcome: (p) => `🛡️ *NodeShield VPN*\n\nهر کانفیگ، ماهی $1، پهنای‌باند نامحدود، تک‌کاربر.\n\nپرداخت مستقیم از کیف‌پول خودت (USDT یا BNB روی BNB Smart Chain) - همون روش سایت.${p.statsLine}`,
    statsLine: (p) => `\n\n✅ ${p.count} کانفیگ فعال تا الان`,
    helpText: () =>
      "🛡️ *NodeShield VPN*\n\n🛒 خرید VPN - خرید کانفیگ جدید\n🎁 تست رایگان - ۱۰۰ مگابایت/۳ روز رایگان (یک بار، فقط VPN)\n📊 وضعیت من - آخرین وضعیت شناخته‌شده‌ی اکانتت\n🔗 دعوت از دوستان - لینک اختصاصی برای معرفی به دوستات\n🌐 زبان - تغییر بین فارسی/انگلیسی\n\nپرداخت با USDT یا BNB روی BNB Smart Chain، مستقیم از کیف‌پول خودت.",
    trialIntro: "🎁 *تست رایگان*\n\n۱۰۰ مگابایت، ۳ روز، کاملاً رایگان - یک بار برای هر کیف‌پول (فقط نوع VPN/V2Ray).\n\nآدرس کیف‌پولت رو بفرست (فقط برای شناسایی اکانتت - نیازی به پرداخت نیست).",
    trialGenerating: "⏳ در حال ساخت کانفیگ تست...",
    trialAlreadyUsed: "❌ این کیف‌پول قبلاً از تست رایگانش استفاده کرده - یک بار برای هر کیف‌پوله.",
    trialDailyLimit: "❌ سقف روزانه‌ی تست رایگان پر شده - بعداً دوباره امتحان کن.",
    trialUnknownError: (p) => `❌ ${p.error || "خطای ناشناخته"}`,
    trialSuccessFooter: (p) => `این کانفیگ تا *${p.date}* یا تا ${p.mb}MB مصرف (هرکدوم زودتر) فعاله. اگه خوشت اومد، «🛒 خرید VPN» رو بزن.`,
    statusNoRecord: "هنوز از طریق این ربات خریدی نداشتی. برای شروع، «🛒 خرید VPN» رو بزن.",
    statusHeader: (p) =>
      `📊 *وضعیت من* (آخرین وضعیت شناخته‌شده - اگه رو سایت هم تمدید کرده باشی ممکنه به‌روز نباشه)\n\nکیف‌پول: \`${p.wallet}\`\nنوع: ${p.backend}\nدستگاه: ${p.deviceCount}/${p.paidCount}\nانقضا: ${p.expiry}`,
    statusExpired: "منقضی‌شده",
    resendConfigsButton: "📥 نمایش کانفیگ‌ها دوباره",
    upgradeButton: "🔺 ارتقا به نامحدود",
    upgradeIntro: "🔺 *ارتقا به نامحدود*\n\nاین یه کانفیگ نامحدود جدید بهت می‌ده (کانفیگ‌های قبلیت هم فعال می‌مونن).\n\n💳 با چی پرداخت می‌کنی؟",
    referralHeader: (p) => `🔗 دعوت از دوستان\n\nاین لینک رو برای دوستات بفرست تا با NodeShield آشنا بشن:\n${p.link}`,
    getReferralLinkButton: "🔗 دریافت لینک دعوت",
    languagePrompt: "🌐 زبان رو انتخاب کن:",
    languageSetEn: "Language set to English.",
    languageSetFa: "زبان روی فارسی تنظیم شد.",
    adminUnauthorizedDataError: (p) => `خطا در خوندن دیتا: ${p.error}`,
    adminStats: (p) => `📊 *آمار NodeShield*\n\nتعداد اکانت: ${p.accounts}\nتعداد کل دستگاه فعال: ${p.devices}\nدر انتظار فعال‌سازی: ${p.pending}\nمنقضی‌شده: ${p.expired}`,
    adminNoAccounts: "هنوز هیچ اکانتی ثبت نشده.",
    adminUserLine: (p) => `${p.wallet}\n  ${p.deviceCount}/${p.paidCount} device(s) - ${p.backend} - ${p.status} تا ${p.expiry}`,
    adminStatusActive: "فعال",
    adminStatusExpired: "منقضی",
    adminInvalidWallet: "آدرس کیف‌پول نامعتبره.",
    adminProvisionFailed: (p) => `فعال‌سازی ناموفق: ${p.error}`,
    adminProvisioned: (p) => `✅ دستگاه برای ${p.wallet} فعال شد.`,
    adminGrantFailed: (p) => `اعمال نشد: ${p.error}`,
    adminGranted: (p) => `✅ ${p.days} روز به ${p.wallet} اضافه شد. انقضای جدید: ${p.expiry}`,
    pendingProvisionAdminNotice: (p) => `⏳ یه پرداخت تأیید شد ولی پرووایژن خودکار کامل نشد.\nکیف‌پول: ${p.wallet}\n\nبرای فعال‌سازی دستی: /provision ${p.wallet}`,
  },
};

function t(lang, key, params) {
  const dict = T[lang] || T[DEFAULT_LANG];
  const entry = dict[key] !== undefined ? dict[key] : T[DEFAULT_LANG][key];
  return typeof entry === "function" ? entry(params || {}) : entry;
}

const BUTTON_KEYS = ["buttonBuy", "buttonTrial", "buttonStatus", "buttonInvite", "buttonLanguage", "buttonHelp"];

function matchButton(text) {
  for (const key of BUTTON_KEYS) {
    if (text === T.en[key] || text === T.fa[key]) return key;
  }
  return null;
}

// --- Local JSONL state (same append-only, latest-record-wins pattern as
// lib/vpn/store.ts) --------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "telegram-bot-users.jsonl");
const REFERRALS_FILE = path.join(DATA_DIR, "telegram-bot-referrals.jsonl");
const LANG_FILE = path.join(DATA_DIR, "telegram-bot-lang.jsonl");

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
 * itself) is ignored, so re-opening the same link twice doesn't duplicate
 * the record. There is no automatic reward for this (removed - see git
 * history if reviving it) - it's tracked purely so the owner can see who
 * invited whom (e.g. via /users) and decide manually whether to reward
 * someone with the /grant admin command. */
function recordReferralIfNew(referredChatId, referrerChatId) {
  if (String(referredChatId) === String(referrerChatId)) return;
  const existing = readJsonl(REFERRALS_FILE).find((r) => r.referredChatId === String(referredChatId));
  if (existing) return;
  appendJsonl(REFERRALS_FILE, {
    referredChatId: String(referredChatId),
    referrerChatId: String(referrerChatId),
    createdAt: new Date().toISOString(),
  });
}

/** Per-chat language, cached in memory (checked on every message) and
 * backed by telegram-bot-lang.jsonl. Defaults to DEFAULT_LANG ("en") when
 * a chat has never picked one. */
const langCache = new Map();

function getUserLang(chatId) {
  const key = String(chatId);
  if (langCache.has(key)) return langCache.get(key);
  const all = readJsonl(LANG_FILE).filter((r) => r.chatId === key);
  const lang = all.length > 0 ? all[all.length - 1].lang : DEFAULT_LANG;
  langCache.set(key, lang);
  return lang;
}

function setUserLang(chatId, lang) {
  langCache.set(String(chatId), lang);
  appendJsonl(LANG_FILE, { chatId: String(chatId), lang, updatedAt: new Date().toISOString() });
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

function cancelRow(lang) {
  return [{ text: t(lang, "cancel"), callback_data: "cancel" }];
}

function mainKeyboard(lang) {
  return {
    keyboard: [
      [t(lang, "buttonBuy"), t(lang, "buttonTrial")],
      [t(lang, "buttonStatus"), t(lang, "buttonInvite")],
      [t(lang, "buttonLanguage"), t(lang, "buttonHelp")],
    ],
    resize_keyboard: true,
  };
}

function languageKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🇬🇧 English", callback_data: "lang_en" },
        { text: "🇮🇷 فارسی", callback_data: "lang_fa" },
      ],
    ],
  };
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

async function fetchPublicStats() {
  const { ok, json } = await callSiteApi("/api/vpn/stats", {});
  return ok && json?.ok ? json : null;
}

async function fetchDataPlans() {
  const { ok, json } = await callSiteApi("/api/vpn/plans", {});
  return ok && json?.ok ? json.plans : [];
}

async function sendDeviceConfigs(chatId, lang, devices) {
  for (const device of devices) {
    const backendLabel = device.backend === "wireguard" ? "WireGuard" : "VPN";
    const planLine = device.dataPlanId && device.dataPlanId !== "unlimited" ? `\n📶 ${t(lang, "dataLabel")} ${device.dataPlanId}` : "";
    await bot.sendMessage(
      chatId,
      `✅ *${device.label}* (${backendLabel})${planLine}\n\n\`${device.config}\`\n\n👤 ${t(lang, "singleUserNotice")}`,
      { parse_mode: "Markdown" },
    );
    try {
      const qrBuffer = await QRCode.toBuffer(device.config, { width: 400 });
      await bot.sendPhoto(chatId, qrBuffer, { caption: t(lang, "qrCaption", { label: device.label }) });
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  }
}

function countryKeyboard(lang) {
  const rows = [];
  for (let i = 0; i < COUNTRIES.length; i += 2) {
    rows.push(
      COUNTRIES.slice(i, i + 2).map((c) => ({
        text: `${c.flag} ${c.name}${c.available ? "" : t(lang, "countrySoonLabel")}`,
        callback_data: c.available ? `country_${c.code}` : `countrysoon_${c.code}`,
      })),
    );
  }
  rows.push(cancelRow(lang));
  return { inline_keyboard: rows };
}

function deviceCountKeyboard(lang) {
  const numberRow = (start) =>
    Array.from({ length: 5 }, (_, i) => ({
      text: String(start + i),
      callback_data: `dc_${start + i}`,
    }));
  return { inline_keyboard: [numberRow(1), numberRow(6), cancelRow(lang)] };
}

function backendKeyboard(lang) {
  return {
    inline_keyboard: [
      [{ text: t(lang, "backendWireguard"), callback_data: "be_wireguard" }],
      [{ text: t(lang, "backendMarzban"), callback_data: "be_marzban" }],
      cancelRow(lang),
    ],
  };
}

function dataPlanKeyboard(lang, plans) {
  return {
    inline_keyboard: [...plans.map((p) => [{ text: `${p.label} - $${p.priceUsd}`, callback_data: `dp_${p.id}` }]), cancelRow(lang)],
  };
}

function methodKeyboard(lang) {
  return {
    inline_keyboard: [
      [
        { text: "💵 USDT", callback_data: "pm_usdt" },
        { text: "🟡 BNB", callback_data: "pm_bnb" },
      ],
      cancelRow(lang),
    ],
  };
}

function startBuyFlow(chatId, lang) {
  if (!PAYMENT_ADDRESS) {
    bot.sendMessage(chatId, t(lang, "salesNotLive"));
    return;
  }
  sessions.set(chatId, { step: "country" });
  bot.sendMessage(chatId, t(lang, "chooseCountry"), { reply_markup: countryKeyboard(lang) });
}

function startTrialFlow(chatId, lang) {
  sessions.set(chatId, { step: "trialWallet" });
  bot.sendMessage(chatId, t(lang, "trialIntro"), { parse_mode: "Markdown" });
}

async function sendStatus(chatId, lang) {
  const record = getBotUser(chatId);
  if (!record) {
    bot.sendMessage(chatId, t(lang, "statusNoRecord"));
    return;
  }
  const account = record.account;
  const expired = new Date(account.expiresAt).getTime() < Date.now();
  const backendLabel = account.backend === "wireguard" ? "WireGuard" : "VPN";
  const masked = `${record.walletAddress.slice(0, 6)}...${record.walletAddress.slice(-4)}`;
  const upgradeButton =
    account.backend === "marzban" && account.dataPlanId && account.dataPlanId !== "unlimited"
      ? [[{ text: t(lang, "upgradeButton"), callback_data: "upgrade_unlimited" }]]
      : [];
  bot.sendMessage(
    chatId,
    t(lang, "statusHeader", {
      wallet: masked,
      backend: backendLabel,
      deviceCount: account.devices.length,
      paidCount: account.paidDeviceCount,
      expiry: expired ? t(lang, "statusExpired") : new Date(account.expiresAt).toLocaleDateString(),
    }),
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: t(lang, "resendConfigsButton"), callback_data: "resend_configs" }], ...upgradeButton],
      },
    },
  );
}

/** Fetches the bot's own username on first use if the startup getMe() call
 * (bottom of this file) hasn't resolved yet - without this, a referral
 * link generated in that window would read "https://t.me/null?start=..."
 * (an invalid link Telegram reports as "no such user"), instead of failing
 * loudly or just working. */
async function ensureBotUsername() {
  if (botUsername) return botUsername;
  const me = await bot.getMe();
  botUsername = me.username;
  return botUsername;
}

async function referralLinkFor(chatId) {
  const username = await ensureBotUsername();
  return `https://t.me/${username}?start=ref_${chatId}`;
}

async function sendReferralLink(chatId, lang) {
  const link = await referralLinkFor(chatId);
  // No parse_mode here on purpose: the link contains underscores (the bot
  // username and the "ref_<id>" payload), and Telegram's legacy Markdown
  // mode treats "_..._" as italics - it silently eats those underscores,
  // corrupting the link into something that doesn't resolve.
  bot.sendMessage(chatId, t(lang, "referralHeader", { link }));
}

function inviteReminderKeyboard(lang) {
  return { inline_keyboard: [[{ text: t(lang, "getReferralLinkButton"), callback_data: "get_referral_link" }]] };
}

bot.onText(/^\/start(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const lang = getUserLang(chatId);
  resetSession(chatId);

  const payload = match && match[1];
  if (payload && payload.startsWith("ref_")) {
    recordReferralIfNew(chatId, payload.slice(4));
  }

  const stats = await fetchPublicStats();
  const statsLine = stats ? t(lang, "statsLine", { count: stats.totalDevices }) : "";

  bot.sendMessage(chatId, t(lang, "startWelcome", { statsLine }), { parse_mode: "Markdown", reply_markup: mainKeyboard(lang) });
});

bot.onText(/^\/cancel/, (msg) => {
  const chatId = msg.chat.id;
  const lang = getUserLang(chatId);
  resetSession(chatId);
  bot.sendMessage(chatId, t(lang, "cancelled"));
});

bot.onText(/^\/buy/, (msg) => startBuyFlow(msg.chat.id, getUserLang(msg.chat.id)));

// --- Admin-only commands -----------------------------------------------

bot.onText(/^\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return;
  const lang = getUserLang(chatId);
  const { ok, json } = await callSiteApi("/api/admin/vpn/list", {
    headers: { "x-bot-secret": BOT_SECRET },
  });
  if (!ok || !json?.ok) {
    bot.sendMessage(chatId, t(lang, "adminUnauthorizedDataError", { error: json?.error || "unknown" }));
    return;
  }
  const accounts = json.accounts;
  const totalDevices = accounts.reduce((sum, a) => sum + a.devices.length, 0);
  const pending = accounts.filter((a) => a.devices.length < a.paidDeviceCount).length;
  const expired = accounts.filter((a) => new Date(a.expiresAt).getTime() < Date.now()).length;
  bot.sendMessage(
    chatId,
    t(lang, "adminStats", { accounts: accounts.length, devices: totalDevices, pending, expired }),
    { parse_mode: "Markdown" },
  );
});

bot.onText(/^\/users/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return;
  const lang = getUserLang(chatId);
  const { ok, json } = await callSiteApi("/api/admin/vpn/list", {
    headers: { "x-bot-secret": BOT_SECRET },
  });
  if (!ok || !json?.ok) {
    bot.sendMessage(chatId, t(lang, "adminUnauthorizedDataError", { error: json?.error || "unknown" }));
    return;
  }
  const accounts = json.accounts;
  if (accounts.length === 0) {
    bot.sendMessage(chatId, t(lang, "adminNoAccounts"));
    return;
  }
  const lines = accounts.map((a) => {
    const expired = new Date(a.expiresAt).getTime() < Date.now();
    const backendLabel = a.backend === "wireguard" ? "WireGuard" : "VPN";
    return t(lang, "adminUserLine", {
      wallet: a.walletAddress,
      deviceCount: a.devices.length,
      paidCount: a.paidDeviceCount,
      backend: backendLabel,
      status: expired ? t(lang, "adminStatusExpired") : t(lang, "adminStatusActive"),
      expiry: new Date(a.expiresAt).toLocaleDateString(),
    });
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
  const lang = getUserLang(chatId);
  const walletAddress = match[1].trim();
  if (!WALLET_RE.test(walletAddress)) {
    bot.sendMessage(chatId, t(lang, "adminInvalidWallet"));
    return;
  }
  const { ok, json } = await callSiteApi("/api/admin/vpn/bot-provision", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-bot-secret": BOT_SECRET },
    body: JSON.stringify({ walletAddress }),
  });
  if (!ok || !json?.ok) {
    bot.sendMessage(chatId, t(lang, "adminProvisionFailed", { error: json?.error || "unknown" }));
    return;
  }
  bot.sendMessage(chatId, t(lang, "adminProvisioned", { wallet: walletAddress }));
  await sendDeviceConfigs(chatId, lang, [json.account.devices[json.account.devices.length - 1]]);
});

// Manual bonus days - use this yourself for whatever reason you want
// (rewarding a referral by hand, compensating downtime, a promo) instead of
// an automatic reward. Requires the wallet to already have a paid device
// (grant-bonus only extends an existing account's expiry, see
// lib/vpn/store.ts's grantBonusDays).
bot.onText(/^\/grant (\S+) (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) return;
  const lang = getUserLang(chatId);
  const walletAddress = match[1].trim();
  const days = Number(match[2]);
  if (!WALLET_RE.test(walletAddress)) {
    bot.sendMessage(chatId, t(lang, "adminInvalidWallet"));
    return;
  }
  const { ok, json } = await callSiteApi("/api/admin/vpn/grant-bonus", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-bot-secret": BOT_SECRET },
    body: JSON.stringify({ walletAddress, days }),
  });
  if (!ok || !json?.ok) {
    bot.sendMessage(chatId, t(lang, "adminGrantFailed", { error: json?.error || "unknown" }));
    return;
  }
  bot.sendMessage(chatId, t(lang, "adminGranted", { days, wallet: walletAddress, expiry: new Date(json.account.expiresAt).toLocaleDateString() }));
});

// --- Purchase wizard: button steps --------------------------------------

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const lang = getUserLang(chatId);
  const data = query.data;

  if (data.startsWith("countrysoon_")) {
    bot.answerCallbackQuery(query.id, { text: t(lang, "countrySoonAlert"), show_alert: true }).catch(() => {});
    return;
  }

  await bot.answerCallbackQuery(query.id).catch(() => {});

  if (data === "lang_en" || data === "lang_fa") {
    const newLang = data === "lang_en" ? "en" : "fa";
    setUserLang(chatId, newLang);
    bot.sendMessage(chatId, t(newLang, newLang === "en" ? "languageSetEn" : "languageSetFa"), {
      reply_markup: mainKeyboard(newLang),
    });
    return;
  }

  if (data === "cancel") {
    resetSession(chatId);
    bot.editMessageText(t(lang, "cancelled"), { chat_id: chatId, message_id: query.message.message_id }).catch(() => {});
    return;
  }

  if (data === "buy_start") {
    startBuyFlow(chatId, lang);
    return;
  }

  if (data === "resend_configs") {
    const record = getBotUser(chatId);
    if (!record) return;
    await sendDeviceConfigs(chatId, lang, record.account.devices);
    return;
  }

  if (data === "get_referral_link") {
    await sendReferralLink(chatId, lang);
    return;
  }

  if (data === "upgrade_unlimited") {
    sessions.set(chatId, { step: "method", backend: "marzban", deviceCount: 1, dataPlanId: "unlimited", upgrade: true });
    bot.sendMessage(chatId, t(lang, "upgradeIntro"), { parse_mode: "Markdown", reply_markup: methodKeyboard(lang) });
    return;
  }

  const session = sessions.get(chatId);
  if (!session) return;

  if (data.startsWith("country_") && session.step === "country") {
    session.country = data.slice(8);
    session.step = "deviceCount";
    bot.editMessageText(t(lang, "countryChosen"), {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "Markdown",
      reply_markup: deviceCountKeyboard(lang),
    }).catch(() => {});
    return;
  }

  if (data.startsWith("dc_") && session.step === "deviceCount") {
    session.deviceCount = Number(data.slice(3));
    session.step = "backend";
    bot.editMessageText(t(lang, "deviceCountChosen", { count: session.deviceCount }), {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "Markdown",
      reply_markup: backendKeyboard(lang),
    }).catch(() => {});
    return;
  }

  if (data.startsWith("be_") && session.step === "backend") {
    session.backend = data.slice(3);
    if (session.backend === "marzban") {
      session.step = "dataPlan";
      const plans = await fetchDataPlans();
      session._plans = plans;
      bot.editMessageText(t(lang, "backendChosenMarzban"), {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: "Markdown",
        reply_markup: dataPlanKeyboard(lang, plans),
      }).catch(() => {});
    } else {
      session.step = "method";
      bot.editMessageText(t(lang, "backendChosenWireguard"), {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: "Markdown",
        reply_markup: methodKeyboard(lang),
      }).catch(() => {});
    }
    return;
  }

  if (data.startsWith("dp_") && session.step === "dataPlan") {
    session.dataPlanId = data.slice(3);
    session.step = "method";
    const plan = (session._plans || []).find((p) => p.id === session.dataPlanId);
    if (plan?.description) {
      bot.sendMessage(chatId, plan.description).catch(() => {});
    }
    bot.editMessageText(t(lang, "dataPlanChosen", { label: plan ? plan.label : session.dataPlanId }), {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "Markdown",
      reply_markup: methodKeyboard(lang),
    }).catch(() => {});
    return;
  }

  if (data.startsWith("pm_") && session.step === "method") {
    session.method = data.slice(3);
    session.step = "wallet";
    bot.editMessageText(t(lang, "methodChosen", { method: session.method.toUpperCase() }), {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "Markdown",
    }).catch(() => {});
    return;
  }
});

// --- Persistent-keyboard buttons + free-text wizard steps ----------------

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const lang = getUserLang(chatId);
  const text = (msg.text || "").trim();
  if (text.startsWith("/")) return; // commands handled above

  const buttonKey = matchButton(text);
  if (buttonKey === "buttonBuy") {
    startBuyFlow(chatId, lang);
    return;
  }
  if (buttonKey === "buttonTrial") {
    startTrialFlow(chatId, lang);
    return;
  }
  if (buttonKey === "buttonStatus") {
    await sendStatus(chatId, lang);
    return;
  }
  if (buttonKey === "buttonInvite") {
    await sendReferralLink(chatId, lang);
    return;
  }
  if (buttonKey === "buttonLanguage") {
    bot.sendMessage(chatId, t(lang, "languagePrompt"), { reply_markup: languageKeyboard() });
    return;
  }
  if (buttonKey === "buttonHelp") {
    bot.sendMessage(chatId, t(lang, "helpText"), { parse_mode: "Markdown" });
    return;
  }

  const session = sessions.get(chatId);
  if (!session) return;

  if (session.step === "trialWallet") {
    if (!WALLET_RE.test(text)) {
      bot.sendMessage(chatId, t(lang, "invalidWallet"));
      return;
    }
    bot.sendMessage(chatId, t(lang, "trialGenerating"));
    const { ok, json } = await callSiteApi("/api/vpn/free-trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: text }),
    });
    if (!ok || !json?.ok) {
      const raw = json?.error || "";
      let message = t(lang, "trialUnknownError", { error: raw });
      if (raw.includes("already used")) message = t(lang, "trialAlreadyUsed");
      else if (raw.includes("daily")) message = t(lang, "trialDailyLimit");
      bot.sendMessage(chatId, message);
      resetSession(chatId);
      return;
    }
    await sendDeviceConfigs(chatId, lang, [{ label: "Trial", backend: "marzban", config: json.subscriptionUrl }]);
    bot.sendMessage(chatId, t(lang, "trialSuccessFooter", { date: new Date(json.expiresAt).toLocaleDateString(), mb: json.dataLimitMb }), {
      parse_mode: "Markdown",
    });
    resetSession(chatId);
    return;
  }

  if (session.step === "wallet") {
    if (!WALLET_RE.test(text)) {
      bot.sendMessage(chatId, t(lang, "invalidWallet"));
      return;
    }
    session.walletAddress = text;
    session.step = "txHash";

    const plan = session.backend === "marzban" ? (session._plans || []).find((p) => p.id === session.dataPlanId) : null;
    const unitPrice = plan ? plan.priceUsd : PRICE_PER_DEVICE_USD;
    const requiredUsd = session.deviceCount * unitPrice;

    if (session.method === "usdt") {
      bot.sendMessage(chatId, t(lang, "payUsdt", { amount: requiredUsd, address: PAYMENT_ADDRESS }), { parse_mode: "Markdown" });
    } else {
      const bnbPrice = await fetchBnbUsdPrice();
      const estimate = bnbPrice ? ((requiredUsd / bnbPrice) * 1.08).toFixed(6) : null;
      bot.sendMessage(chatId, t(lang, "payBnb", { amount: requiredUsd, estimate, address: PAYMENT_ADDRESS }), { parse_mode: "Markdown" });
    }
    return;
  }

  if (session.step === "txHash") {
    if (!TXHASH_RE.test(text)) {
      bot.sendMessage(chatId, t(lang, "invalidTxHash"));
      return;
    }
    bot.sendMessage(chatId, t(lang, "checkingPayment"));

    const body = {
      walletAddress: session.walletAddress,
      txHash: text,
      method: session.method,
      deviceCount: session.deviceCount,
      backend: session.backend,
      intent: "add",
    };
    if (session.backend === "marzban" && session.dataPlanId) body.dataPlanId = session.dataPlanId;

    const { ok, json } = await callSiteApi("/api/vpn/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!ok || !json?.ok) {
      bot.sendMessage(chatId, t(lang, "paymentFailed", { error: json?.error || "unknown error" }));
      return;
    }

    const account = json.account;
    saveBotUser(chatId, session.walletAddress, account);

    const newDevices = account.devices.slice(-session.deviceCount);
    if (newDevices.length > 0 && newDevices.every((d) => d.provisionedAt)) {
      bot.sendMessage(chatId, t(lang, "paymentConfirmedHeader"));
      await sendDeviceConfigs(chatId, lang, newDevices);
      bot.sendMessage(chatId, t(lang, "inviteFriendsPrompt"), { reply_markup: inviteReminderKeyboard(lang) });
    } else {
      bot.sendMessage(chatId, t(lang, "provisioningPending"));
      if (ADMIN_CHAT_ID) {
        bot.sendMessage(ADMIN_CHAT_ID, t(getUserLang(ADMIN_CHAT_ID), "pendingProvisionAdminNotice", { wallet: session.walletAddress }));
      }
    }

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
