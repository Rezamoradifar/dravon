export interface Product {
  slug: string;
  name: string;
  status: "Live" | "Educational Demo" | "Educational" | "Coming Soon";
  statusLabel?: string;
  tagline: string;
  description: string;
  features: string[];
  href: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: "dashboard",
    name: "Round Window Dashboard",
    status: "Live",
    tagline: "Real-time overview of the round contract",
    description:
      "Reads round id, latest window, point value, token addresses and contract status directly from the chain, alongside live native-token price and network status.",
    features: ["Live BNB/native price", "Gas price & block status", "Network growth chart", "Recent activity feed"],
    href: "/dashboard",
  },
  {
    slug: "pool-health",
    name: "Adaptive Pool Health",
    status: "Live",
    tagline: "The pool protects itself, automatically",
    description:
      "Every round the contract measures its own coverage and sits in one of 4 stages, tightening payout terms when the pool needs it and loosening them back up once it recovers - all readable live.",
    features: ["4-stage controller", "Live coverage runway", "Per-stage payout terms", "Upgrade/downgrade history"],
    href: "/dashboard",
  },
  {
    slug: "weekly-fund",
    name: "Weekly $500 Fund",
    status: "Live",
    tagline: "Match $500 on both legs, earn a weekly point",
    description:
      "A separate pool funded by every registration and top-up. General standing and your own left/right leg progress, both on one page.",
    features: ["General + personal view", "Live left/right leg volume", "Credited points", "Amount owed"],
    href: "/weekly",
  },
  {
    slug: "network-pulse",
    name: "Live Network Pulse",
    status: "Live",
    tagline: "Big numbers, real data, presentation-ready",
    description:
      "Total volume, users, points and the weekly pool, animated live from the same contract everything else reads from - with a fullscreen mode for showing off.",
    features: ["Animated live counters", "Fullscreen presentation mode", "Zero fabricated numbers"],
    href: "/pulse",
  },
  {
    slug: "games",
    name: "Game Center",
    status: "Live",
    tagline: "Free backgammon, and a real on-chain wagering platform",
    description:
      "A free, no-wallet-needed backgammon game for casual play, plus a separate on-chain backgammon platform with real USDT/BNB stakes, open tables, and a leaderboard.",
    features: ["Free local & AI backgammon", "Real on-chain wagering", "Open tables lobby", "Leaderboard"],
    href: "/games",
  },
  {
    slug: "registration",
    name: "Registration & Top-Up",
    status: "Live",
    tagline: "Join a round or top up an existing box",
    description:
      "Calls begin() and chargeAccount() directly on the round window contract, with gas estimation and transaction status tracking.",
    features: ["Saved local presets", "Referral link auto-fill", "Gas estimation", "Live tx progress"],
    href: "/register",
  },
  {
    slug: "referrals",
    name: "Referral & Genealogy Explorer",
    status: "Live",
    tagline: "Visualize your binary network",
    description:
      "Renders getUserTree() as an interactive binary tree graph, with a shareable referral link, QR code, and per-wallet round activity chart.",
    features: ["Interactive tree graph", "QR code referral link", "Copy-to-clipboard", "Referral streak badge"],
    href: "/genealogy",
  },
  {
    slug: "swap",
    name: "PancakeSwap Trading",
    status: "Live",
    tagline: "Trade BNB and BEP20 tokens",
    description:
      "Direct integration with PancakeSwap's Router V2 contract for real swaps, with live quotes, slippage control and price-impact estimation.",
    features: ["Live on-chain quotes", "Slippage control", "Price impact estimate", "Approve + swap flow"],
    href: "/swap",
  },
  {
    slug: "analytics",
    name: "Round History Analytics",
    status: "Live",
    tagline: "Points, direct, binary and flash income over time",
    description: "Charts built from getUserRoundInfo() and getMainBulkInfo() across recent rounds.",
    features: ["Points chart", "Direct/binary income", "Flash income", "CSV export (admin)"],
    href: "/history",
  },
  {
    slug: "admin",
    name: "Admin Console",
    status: "Live",
    tagline: "Owner-gated round management",
    description:
      "Distribute matching bonuses, initialize rounds, look up any wallet, and export round history - visible only to the configured admin address.",
    features: ["Matching bonus distribution", "Round initialization", "Wallet lookup", "CSV export"],
    href: "/admin",
  },
  {
    slug: "learning-center",
    name: "Arbitrage & Flash Loan Learning Center",
    status: "Educational Demo",
    tagline: "Understand the mechanics, safely",
    description:
      "Explains flash loans, arbitrage, MEV, cross-chain and DEX arbitrage, with an interactive simulator using numbers you control. No real transactions, no profit promises.",
    features: ["Workflow diagrams", "Risk-level ratings", "FAQ", "Simulated profit/loss calculator"],
    href: "/learn",
  },
  {
    slug: "flash-loan-learning",
    name: "Flash Loan Learning",
    status: "Educational",
    tagline: "Borrow, use, repay - all in one transaction",
    description:
      "A dedicated explainer on how uncollateralized flash loans work, why they're safe for lenders, and where the real risks sit for anyone using them.",
    features: ["Step-by-step workflow", "Risk rating", "FAQ", "Link to the simulator"],
    href: "/learn/flash-loans",
  },
  {
    slug: "mev-learning",
    name: "MEV Learning",
    status: "Educational",
    tagline: "Understand transaction-ordering value extraction",
    description: "Covers how block builders and searchers can profit from transaction ordering, and why slippage limits matter.",
    features: ["Workflow diagram", "Risk rating", "FAQ"],
    href: "/learn/mev",
  },
  {
    slug: "arbitrage-learning",
    name: "Arbitrage Learning",
    status: "Educational",
    tagline: "Same asset, different price, two markets",
    description: "Explains cross-market and cross-DEX arbitrage mechanics, competition, and why gaps close quickly.",
    features: ["Workflow diagram", "Risk rating", "FAQ", "Link to the simulator"],
    href: "/learn/arbitrage",
  },
  {
    slug: "blockchain-education",
    name: "Blockchain Education",
    status: "Educational",
    tagline: "AMMs, liquidity pools and the DEXs built on them",
    description: "Foundational explainers on automated market makers, liquidity pools, PancakeSwap and Uniswap.",
    features: ["AMM mechanics", "Liquidity provider risk", "PancakeSwap & Uniswap overviews"],
    href: "/learn/amm",
  },
  {
    slug: "smart-contract-audit",
    name: "Smart Contract Audit (Education)",
    status: "Educational",
    tagline: "What an audit does - and doesn't - guarantee",
    description:
      "Explains what smart contract risk means, what audits actually cover, and how to verify a contract's ABI and behavior yourself. This app does not sell or perform audits.",
    features: ["Plain-language risk breakdown", "What audits do and don't cover", "FAQ"],
    href: "/learn/smart-contracts",
  },
  {
    slug: "security-review",
    name: "Security Review (Education)",
    status: "Educational",
    tagline: "Practical wallet safety habits",
    description:
      "Covers seed-phrase hygiene, transaction verification, and token approval management for anyone using self-custody wallets with Web3 apps.",
    features: ["Wallet safety checklist", "Approval hygiene", "Phishing awareness", "FAQ"],
    href: "/learn/wallet-security",
  },
  {
    slug: "vpn",
    name: "Dravon VPN",
    status: "Coming Soon",
    tagline: "WireGuard VPN, paid for directly with your wallet",
    description:
      "Two tiers (Plus/Pro) of a WireGuard-based VPN, subscribed to with a direct on-chain USDT payment - no card, no third-party checkout. Not live yet; the payment flow is real but requires an operator-provisioned server before it activates.",
    features: ["Pay with your connected wallet", "No third-party payment processor", "Plus & Pro tiers", "On-chain payment verification"],
    href: "/products/vpn",
  },
];

type LocalizedProductFields = Pick<Product, "name" | "tagline" | "description" | "features" | "statusLabel">;

export const PRODUCTS_FA: Record<string, LocalizedProductFields> = {
  dashboard: {
    name: "داشبورد پنجره راند",
    statusLabel: "فعال",
    tagline: "نمای کلی زنده از قرارداد راند",
    description:
      "شناسه راند، آخرین پنجره، ارزش پوینت، آدرس توکن‌ها و وضعیت قرارداد را مستقیماً از زنجیره می‌خواند، همراه با قیمت زنده توکن بومی و وضعیت شبکه.",
    features: ["قیمت زنده BNB/توکن بومی", "قیمت گاز و وضعیت بلاک", "نمودار رشد شبکه", "فید فعالیت اخیر"],
  },
  registration: {
    name: "ثبت‌نام و شارژ حساب",
    statusLabel: "فعال",
    tagline: "به یک راند بپیوندید یا یک باکس موجود را شارژ کنید",
    description: "begin() و chargeAccount() را مستقیماً روی قرارداد پنجره راند فراخوانی می‌کند، همراه با تخمین گاز و ردیابی وضعیت تراکنش.",
    features: ["پیش‌تنظیم‌های محلی ذخیره‌شده", "پر کردن خودکار لینک معرفی", "تخمین گاز", "پیشرفت زنده تراکنش"],
  },
  referrals: {
    name: "کاوشگر معرفی و شجره‌نامه",
    statusLabel: "فعال",
    tagline: "شبکه باینری خود را تجسم کنید",
    description: "getUserTree() را به‌صورت یک نمودار درخت باینری تعاملی، همراه با لینک معرفی قابل‌اشتراک، کد QR، و نمودار فعالیت راند برای هر کیف‌پول نمایش می‌دهد.",
    features: ["نمودار درخت تعاملی", "لینک معرفی با کد QR", "کپی در کلیپ‌بورد", "بج زنجیره‌ی معرفی"],
  },
  "pool-health": {
    name: "سلامت استخر هوشمند",
    statusLabel: "فعال",
    tagline: "استخر خودش از خودش محافظت می‌کند",
    description:
      "قرارداد هر راند پوشش خودش را می‌سنجد و در یکی از ۴ مرحله قرار می‌گیرد؛ وقتی استخر نیاز داشته باشد شرایط پرداخت را سخت‌گیرانه‌تر و بعد از بهبود دوباره سخاوتمندانه‌تر می‌کند - همه به‌صورت زنده قابل‌مشاهده است.",
    features: ["کنترل‌کننده‌ی ۴ مرحله‌ای", "نمایش زنده‌ی پوشش استخر", "شرایط پرداخت هر مرحله", "تاریخچه‌ی ارتقا/افت مرحله"],
  },
  "weekly-fund": {
    name: "صندوق هفتگی $۵۰۰",
    statusLabel: "فعال",
    tagline: "با تطبیق $۵۰۰ در هر دو پا، امتیاز هفتگی بگیرید",
    description:
      "یک استخر جداگانه که از هر ثبت‌نام و شارژ حساب تأمین می‌شود. وضعیت عمومی و پیشرفت شخصی پای چپ/راست خودتان، هر دو در یک صفحه.",
    features: ["نمای عمومی + شخصی", "حجم زنده‌ی پای چپ/راست", "امتیاز اعتباری", "مبلغ دریافتی"],
  },
  "network-pulse": {
    name: "نبض زنده‌ی شبکه",
    statusLabel: "فعال",
    tagline: "اعداد بزرگ، داده‌ی واقعی، آماده برای ارائه",
    description:
      "حجم کل، کاربران، امتیاز و صندوق هفتگی، به‌صورت زنده و متحرک از همون قراردادی که بقیه‌ی سایت هم ازش می‌خونه - با حالت تمام‌صفحه برای نمایش.",
    features: ["شمارنده‌های زنده‌ی متحرک", "حالت تمام‌صفحه برای ارائه", "بدون هیچ عدد ساختگی"],
  },
  games: {
    name: "مرکز بازی",
    statusLabel: "فعال",
    tagline: "تخته‌نرد رایگان، و یک پلتفرم واقعی شرط‌بندی آنچین",
    description:
      "یک بازی تخته‌نرد رایگان و بدون نیاز به کیف‌پول برای بازی معمولی، به‌علاوه یک پلتفرم جداگانه‌ی تخته‌نرد آنچین با شرط‌بندی واقعی USDT/BNB، میزهای باز، و جدول رتبه‌بندی.",
    features: ["تخته‌نرد رایگان محلی و با هوش مصنوعی", "شرط‌بندی واقعی رو زنجیره", "لابی میزهای باز", "جدول رتبه‌بندی"],
  },
  swap: {
    name: "معاملات پنکیک‌سواپ",
    statusLabel: "فعال",
    tagline: "BNB و توکن‌های BEP20 را معامله کنید",
    description: "یکپارچگی مستقیم با قرارداد Router V2 پنکیک‌سواپ برای تبدیل‌های واقعی، همراه با قیمت زنده، کنترل لغزش و تخمین تأثیر قیمتی.",
    features: ["قیمت زنده آن‌چین", "کنترل لغزش قیمت", "تخمین تأثیر قیمتی", "فرآیند تأیید + تبدیل"],
  },
  analytics: {
    name: "تحلیل تاریخچه راند",
    statusLabel: "فعال",
    tagline: "امتیاز، درآمد مستقیم، باینری و فلش در طول زمان",
    description: "نمودارهایی ساخته‌شده از getUserRoundInfo() و getMainBulkInfo() در راندهای اخیر.",
    features: ["نمودار امتیاز", "درآمد مستقیم/باینری", "درآمد فلش", "خروجی CSV (مدیر)"],
  },
  admin: {
    name: "کنسول مدیریت",
    statusLabel: "فعال",
    tagline: "مدیریت راند مخصوص مالک",
    description: "توزیع پاداش‌های متقارن، مقداردهی اولیه راندها، جستجوی هر کیف‌پول، و خروجی تاریخچه راند - فقط برای آدرس مدیر تنظیم‌شده قابل‌مشاهده است.",
    features: ["توزیع پاداش متقارن", "مقداردهی اولیه راند", "جستجوی کیف‌پول", "خروجی CSV"],
  },
  "learning-center": {
    name: "مرکز آموزش آربیتراژ و وام فلش",
    statusLabel: "دموی آموزشی",
    tagline: "مکانیزم‌ها را ایمن درک کنید",
    description: "وام‌های فلش، آربیتراژ، MEV، آربیتراژ بین‌زنجیره‌ای و DEX را با یک شبیه‌ساز تعاملی با اعداد تحت کنترل شما توضیح می‌دهد. بدون تراکنش واقعی، بدون وعده سود.",
    features: ["نمودارهای فرآیند کار", "رتبه‌بندی سطح ریسک", "سوالات متداول", "ماشین‌حساب سود/زیان شبیه‌سازی‌شده"],
  },
  "flash-loan-learning": {
    name: "آموزش وام فلش",
    statusLabel: "آموزشی",
    tagline: "قرض بگیر، استفاده کن، بازپرداخت کن - همه در یک تراکنش",
    description: "توضیحی اختصاصی درباره نحوه کار وام‌های فلش بدون وثیقه، چرا برای وام‌دهندگان ایمن هستند، و ریسک‌های واقعی برای هر کسی که از آن‌ها استفاده می‌کند.",
    features: ["فرآیند گام‌به‌گام", "رتبه‌بندی ریسک", "سوالات متداول", "لینک به شبیه‌ساز"],
  },
  "mev-learning": {
    name: "آموزش MEV",
    statusLabel: "آموزشی",
    tagline: "استخراج ارزش از ترتیب تراکنش‌ها را درک کنید",
    description: "پوشش می‌دهد چطور سازندگان بلاک و جستجوگرها می‌توانند از ترتیب تراکنش سود ببرند، و چرا حدود لغزش قیمت مهم هستند.",
    features: ["نمودار فرآیند کار", "رتبه‌بندی ریسک", "سوالات متداول"],
  },
  "arbitrage-learning": {
    name: "آموزش آربیتراژ",
    statusLabel: "آموزشی",
    tagline: "دارایی یکسان، قیمت متفاوت، دو بازار",
    description: "مکانیزم آربیتراژ بین‌بازاری و بین-DEX، رقابت، و اینکه چرا شکاف‌ها سریع بسته می‌شوند را توضیح می‌دهد.",
    features: ["نمودار فرآیند کار", "رتبه‌بندی ریسک", "سوالات متداول", "لینک به شبیه‌ساز"],
  },
  "blockchain-education": {
    name: "آموزش بلاکچین",
    statusLabel: "آموزشی",
    tagline: "AMM‌ها، استخرهای نقدینگی و DEX‌های ساخته‌شده روی آن‌ها",
    description: "توضیحات پایه درباره بازارسازهای خودکار، استخرهای نقدینگی، پنکیک‌سواپ و یونی‌سواپ.",
    features: ["مکانیزم AMM", "ریسک تأمین‌کننده نقدینگی", "نمای کلی پنکیک‌سواپ و یونی‌سواپ"],
  },
  "smart-contract-audit": {
    name: "ممیزی قرارداد هوشمند (آموزشی)",
    statusLabel: "آموزشی",
    tagline: "یک ممیزی چه چیزی را تضمین می‌کند - و چه چیزی را نه",
    description: "توضیح می‌دهد ریسک قرارداد هوشمند یعنی چه، ممیزی‌ها واقعاً چه چیزی را پوشش می‌دهند، و چطور خودتان ABI و رفتار یک قرارداد را تأیید کنید. این اپلیکیشن ممیزی نمی‌فروشد یا انجام نمی‌دهد.",
    features: ["تفکیک ریسک به زبان ساده", "آنچه ممیزی‌ها پوشش می‌دهند و نمی‌دهند", "سوالات متداول"],
  },
  "security-review": {
    name: "بررسی امنیتی (آموزشی)",
    statusLabel: "آموزشی",
    tagline: "عادت‌های عملی امنیت کیف‌پول",
    description: "بهداشت عبارت بازیابی، تأیید تراکنش و مدیریت مجوز توکن را برای هرکسی که از کیف‌پول‌های خودگردان با اپلیکیشن‌های وب۳ استفاده می‌کند پوشش می‌دهد.",
    features: ["چک‌لیست ایمنی کیف‌پول", "بهداشت مجوزها", "آگاهی از فیشینگ", "سوالات متداول"],
  },
  vpn: {
    name: "دراوون وی‌پی‌ان",
    statusLabel: "به‌زودی",
    tagline: "VPN مبتنی بر WireGuard، پرداخت مستقیم با کیف‌پول",
    description:
      "دو سطح (پلاس/پرو) از یه VPN مبتنی بر WireGuard، با پرداخت مستقیم USDT روی زنجیره - بدون کارت، بدون درگاه واسطه. هنوز فعال نیست؛ مسیر پرداخت واقعیه ولی قبل از فعال‌سازی به یه سرور آماده‌شده نیاز داره.",
    features: ["پرداخت با کیف‌پول متصل", "بدون درگاه پرداخت واسطه", "سطح‌های پلاس و پرو", "تأیید پرداخت روی زنجیره"],
  },
};

export function getLocalizedProducts(locale: "en" | "fa" = "en"): Product[] {
  if (locale !== "fa") return PRODUCTS;
  return PRODUCTS.map((product) => ({
    ...product,
    ...(PRODUCTS_FA[product.slug] ?? {}),
  }));
}
