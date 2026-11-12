"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Blocks,
  BookOpen,
  Check,
  ChevronRight,
  CircleDot,
  Code2,
  Compass,
  Cpu,
  FileCode2,
  Gamepad2,
  Globe2,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Wallet2,
  X,
  type LucideIcon,
} from "lucide-react";

import { FACTORY_ADDRESS, CHAIN_ID } from "@/contracts/addresses";
import { getLocalizedHelpFaq } from "@/lib/help-content";
import { useMainBulkInfo } from "@/hooks/useMainBulkInfo";
import { useLanguage } from "@/contexts/language-context";

type Feature = { title: string; detail: string };
type Step = Feature & { label: string };
type LabelCopy = {
  nav: { how: string; explorer: string; technology: string; ecosystem: string; faq: string };
  open: string; menu: string; closeMenu: string; skip: string;
  hero: {
    eyebrow: string; title: string; emphasis: string; intro: string;
    primary: string; secondary: string; foot: string; artKicker: string;
    artTitle: string; artSub: string; artBottom: string; network: string;
  };
  facts: { network: string; people: string; tiers: string; trace: string; missing: string };
  challenge: {
    eyebrow: string; number: string; title: string; emphasis: string; intro: string;
    items: Feature[]; foot: string;
  };
  model: {
    eyebrow: string; title: string; emphasis: string; subtitle: string;
    pillars: Feature[]; equation: string; foot: string;
  };
  journey: {
    eyebrow: string; number: string; title: string; emphasis: string; subtitle: string;
    steps: Step[]; panelKicker: string; simulated: string;
    next: string; restart: string; disclaimer: string;
    labels: string[]; choiceLabel: string; preview: string;
    txRows: string[]; viewRows: string[]; treeRows: string[];
  };
  technology: {
    eyebrow: string; title: string; emphasis: string; subtitle: string;
    core: string; small: string; nodes: string[]; items: Feature[];
    foot: string;
  };
  ecosystem: {
    eyebrow: string; title: string; emphasis: string; subtitle: string;
    items: Feature[]; view: string;
  };
  story: {
    eyebrow: string; title: string; emphasis: string; intro: string;
    timeline: Feature[]; note: string;
  };
  faq: { eyebrow: string; title: string; subtitle: string; all: string };
  cta: { eyebrow: string; title: string; emphasis: string; subtitle: string; first: string; second: string };
  footer: { tagline: string; product: string; resources: string; disclaimer: string; chain: string };
};

const TEXT: Record<"en" | "fa", LabelCopy> = {
  en: {
    nav: { how: "How it works", explorer: "Interactive tour", technology: "Technology", ecosystem: "Ecosystem", faq: "FAQ" },
    open: "Launch App", menu: "Open menu", closeMenu: "Close menu", skip: "Skip to content",
    hero: {
      eyebrow: "THE NEXT INTERFACE FOR ON-CHAIN NETWORKS",
      title: "Smart contracts.", emphasis: "Clear by design.",
      intro: "One carefully designed workspace for wallet access, contract interactions and network insights on BNB Smart Chain. Explore the logic, understand the steps, and verify transactions on-chain.",
      primary: "Launch Platform", secondary: "Explore the system",
      foot: "Wallet approval is required for transactions. On-chain actions carry risks and network fees.",
      artKicker: "THE CONNECTED LAYER", artTitle: "SMART CONTRACT", artSub: "PLATFORM",
      artBottom: "WALLET → CONTRACT → EXPLORER", network: "BNB SMART CHAIN",
    },
    facts: {
      network: "Primary blockchain", people: "Current round users (on-chain)",
      tiers: "Contract-defined entry tiers", trace: "Transaction visibility", missing: "—",
    },
    challenge: {
      eyebrow: "THE ON-CHAIN EXPERIENCE", number: "01 / THE CHALLENGE",
      title: "Complex technology.", emphasis: "Simple decisions.",
      intro: "Blockchain data is public, but the experience of interpreting contract rules, network activity and account actions can feel fragmented. This platform brings the essential tools into one interface.",
      items: [
        { title: "Too many screens", detail: "Switching among wallet apps, block explorers and dashboards breaks the flow." },
        { title: "Hard-to-read data", detail: "Contract values need context before they become meaningful decisions." },
        { title: "Unclear next steps", detail: "Registration, upgrades and network exploration should be easy to navigate." },
      ],
      foot: "One interface. Clear actions. Public verification.",
    },
    model: {
      eyebrow: "OUR CORE APPROACH", title: "Three layers.", emphasis: "One connected experience.",
      subtitle: "Built around the actions this contract actually supports, without invented performance claims.",
      pillars: [
        { title: "Connect", detail: "Use a compatible wallet. Your wallet remains your identity and your transaction signer." },
        { title: "Interact", detail: "Review on-chain registration, package and account actions before approving them." },
        { title: "Verify", detail: "Inspect transaction records and contract data on the public BNB explorer." },
      ],
      equation: "SMART CONTRACT PLATFORM",
      foot: "Wallet access + contract actions + verifiable network data.",
    },
    journey: {
      eyebrow: "SEE IT IN ACTION", number: "02 / AN INTERACTIVE WALKTHROUGH",
      title: "From wallet connection", emphasis: "to an on-chain view.",
      subtitle: "Explore the interface step by step before interacting with a real contract.",
      steps: [
        { label: "01", title: "Connect your wallet", detail: "Use an injected wallet or the configured WalletConnect integration." },
        { label: "02", title: "Review a package", detail: "Three predefined registration tiers are enforced by the contract." },
        { label: "03", title: "Review and sign", detail: "Transaction details appear in your wallet before you decide to approve." },
        { label: "04", title: "Track the network", detail: "See contract-backed round information and personal account details." },
        { label: "05", title: "Explore your team", detail: "Navigate referral relationships and the genealogy view." },
      ],
      panelKicker: "PLATFORM WALKTHROUGH", simulated: "ILLUSTRATIVE PREVIEW",
      next: "Next step", restart: "Start again",
      disclaimer: "Walkthrough only. No wallet is connected and no transaction is executed in this preview.",
      labels: ["WALLET ACCESS", "CONTRACT TIERS", "TRANSACTION REVIEW", "NETWORK INSIGHTS", "TEAM MAP"],
      choiceLabel: "Contract entry examples",
      preview: "The actual app uses live on-chain reads when your network and RPC are available.",
      txRows: ["Check network", "Review contract call", "Confirm in wallet"],
      viewRows: ["Network Pulse", "Round Dashboard", "Wallet Profile"],
      treeRows: ["Referrer", "Your wallet", "Network members"],
    },
    technology: {
      eyebrow: "UNDER THE SURFACE", title: "Infrastructure you can", emphasis: "inspect.",
      subtitle: "Designed around the BNB Smart Chain contract, with clear separation between wallet authorization, contract calls and the data shown in your dashboard.",
      core: "ON-CHAIN", small: "CORE", nodes: ["Wallet", "Factory", "Round Window", "Explorer"],
      items: [
        { title: "Wallet-first access", detail: "Your wallet is the signer. The website never needs your recovery phrase." },
        { title: "Contract-backed reads", detail: "Registration and round data are requested from the configured smart contracts." },
        { title: "Traceable transactions", detail: "Submitted transactions can be checked independently in BscScan." },
        { title: "Account visibility", detail: "See your own round, history and network pages in one place." },
      ],
      foot: "No interface can eliminate smart contract, network or wallet risk. Review every transaction before approving.",
    },
    ecosystem: {
      eyebrow: "ONE CONNECTED PLATFORM", title: "Everything that matters.", emphasis: "In one place.",
      subtitle: "Explore actual modules available in the platform. Features requiring wallet access or third-party integrations depend on their configuration.",
      items: [
        { title: "Dashboard", detail: "A connected view of your wallet and network status." },
        { title: "Network Pulse", detail: "Round statistics and contract-backed network data." },
        { title: "Genealogy", detail: "Explore referral relationships and your network." },
        { title: "Weekly Fund", detail: "Review the contract's weekly window and your own data." },
        { title: "Swap", detail: "Access the real BNB-chain swap interface. Trades use real funds." },
        { title: "Learning Center", detail: "Understand contract mechanics and blockchain fundamentals." },
      ],
      view: "Explore module",
    },
    story: {
      eyebrow: "HOW THE EXPERIENCE IS BUILT", title: "Less friction.", emphasis: "More clarity.",
      intro: "The aim is not to hide blockchain complexity but to make the critical steps understandable before a user acts.",
      timeline: [
        { title: "See the full picture", detail: "A concise overview of the network, its modules and what they do." },
        { title: "Understand the rules", detail: "The interface reflects fixed contract requirements rather than arbitrary amounts." },
        { title: "Stay in control", detail: "Transactions require a wallet signature; navigation and learning do not." },
        { title: "Verify independently", detail: "The explorer provides an independent view of contract and transaction records." },
      ],
      note: "A clear interface is not a guarantee of contract performance or financial outcome.",
    },
    faq: { eyebrow: "GOOD TO KNOW", title: "Frequently asked questions.", subtitle: "The practical details before you connect.", all: "View all questions" },
    cta: {
      eyebrow: "YOUR NEXT STEP", title: "Explore the network.", emphasis: "On your terms.",
      subtitle: "Start with the dashboard, read the guides, and approve transactions only after checking the details.",
      first: "Open Dashboard", second: "Read the Guide",
    },
    footer: {
      tagline: "A unified interface for BNB Smart Chain contract interactions and network insights.",
      product: "Platform", resources: "Explore",
      disclaimer: "Information is not financial advice. Contract interaction and swaps may involve real funds and risk.",
      chain: "BUILT FOR BNB SMART CHAIN",
    },
  },
  fa: {
    nav: { how: "نحوه کار", explorer: "نمایش تعاملی", technology: "فناوری", ecosystem: "امکانات", faq: "سؤالات" },
    open: "ورود به برنامه", menu: "باز کردن منو", closeMenu: "بستن منو", skip: "رفتن به محتوای اصلی",
    hero: {
      eyebrow: "تجربه‌ای تازه برای شبکه‌های آنچین",
      title: "قرارداد هوشمند.", emphasis: "شفاف در طراحی.",
      intro: "یک محیط یکپارچه برای اتصال کیف پول، تعامل با قرارداد هوشمند و مشاهده اطلاعات شبکه BNB Smart Chain. مراحل را بشناس، شرایط را بررسی کن و تراکنش‌ها را روی بلاک‌چین ببین.",
      primary: "ورود به پلتفرم", secondary: "آشنایی با سیستم",
      foot: "تراکنش‌ها به تأیید کیف پول نیاز دارند و شامل هزینه شبکه و ریسک هستند.",
      artKicker: "لایه یکپارچه ارتباط", artTitle: "قرارداد هوشمند", artSub: "پلتفرم",
      artBottom: "کیف پول ← قرارداد ← اکسپلورر", network: "BNB SMART CHAIN",
    },
    facts: {
      network: "شبکه اصلی", people: "کاربران راند فعلی (آنچین)",
      tiers: "سطوح ورود تعریف‌شده در قرارداد", trace: "قابلیت بررسی تراکنش",
      missing: "—",
    },
    challenge: {
      eyebrow: "تجربه آنچین", number: "۰۱ / چالش",
      title: "فناوری پیچیده.", emphasis: "تصمیم‌گیری ساده.",
      intro: "داده‌های بلاک‌چین عمومی هستند، اما تفسیر قوانین قرارداد، فعالیت شبکه و عملیات حساب می‌تواند دشوار باشد. این پلتفرم ابزارهای اصلی را در یک محیط کنار هم قرار می‌دهد.",
      items: [
        { title: "صفحه‌های پراکنده", detail: "جابه‌جایی مداوم بین کیف پول، اکسپلورر و داشبورد تمرکز کاربر را کم می‌کند." },
        { title: "اطلاعات دشوار", detail: "اعداد قرارداد برای تبدیل‌شدن به اطلاعات مفید به توضیح و زمینه نیاز دارند." },
        { title: "مراحل نامشخص", detail: "ثبت‌نام، ارتقای حساب و بررسی شبکه باید مسیر روشنی داشته باشند." },
      ],
      foot: "یک محیط. مراحل روشن. امکان بررسی عمومی.",
    },
    model: {
      eyebrow: "رویکرد اصلی", title: "سه لایه.", emphasis: "یک تجربه یکپارچه.",
      subtitle: "طراحی بر اساس قابلیت‌های واقعی قرارداد، بدون وعده عملکرد یا سود ساختگی.",
      pillars: [
        { title: "اتصال", detail: "با کیف پول سازگار وارد شو؛ کیف پول هویت و ابزار امضای تراکنش تو باقی می‌ماند." },
        { title: "تعامل", detail: "پیش از تأیید، جزئیات ثبت‌نام، بسته‌ها و عملیات حساب را بررسی کن." },
        { title: "راستی‌آزمایی", detail: "سوابق تراکنش‌ها و داده قرارداد را در اکسپلورر عمومی BNB بررسی کن." },
      ],
      equation: "SMART CONTRACT PLATFORM",
      foot: "اتصال کیف پول + عملیات قرارداد + اطلاعات قابل بررسی شبکه.",
    },
    journey: {
      eyebrow: "نمایش تعاملی", number: "۰۲ / راهنمای مرحله‌به‌مرحله",
      title: "از اتصال کیف پول", emphasis: "تا مشاهده شبکه.",
      subtitle: "قبل از تعامل واقعی با قرارداد، مراحل کار را در یک نمایش آموزشی ببین.",
      steps: [
        { label: "۰۱", title: "اتصال کیف پول", detail: "از کیف پول مرورگر یا اتصال WalletConnect پیکربندی‌شده استفاده کن." },
        { label: "۰۲", title: "بررسی بسته", detail: "سه سطح ثابت ثبت‌نام توسط قرارداد هوشمند اعمال می‌شود." },
        { label: "۰۳", title: "بررسی و امضا", detail: "اطلاعات تراکنش پیش از تأیید در کیف پول نمایش داده می‌شود." },
        { label: "۰۴", title: "مشاهده شبکه", detail: "اطلاعات راند و جزئیات حساب خودت را از قرارداد مشاهده کن." },
        { label: "۰۵", title: "بررسی تیم", detail: "ارتباطات معرفی و نمای شجره‌نامه را ببین." },
      ],
      panelKicker: "راهنمای پلتفرم", simulated: "نمایش آموزشی",
      next: "مرحله بعد", restart: "شروع دوباره",
      disclaimer: "این بخش فقط نمایشی است؛ هیچ کیف پولی متصل نمی‌شود و تراکنشی انجام نمی‌گیرد.",
      labels: ["اتصال کیف پول", "سطوح قرارداد", "بررسی تراکنش", "اطلاعات شبکه", "نقشه تیم"],
      choiceLabel: "نمونه سطوح ورود قرارداد",
      preview: "برنامه اصلی در صورت دسترسی به شبکه و RPC، اطلاعات را از قراردادهای واقعی می‌خواند.",
      txRows: ["بررسی شبکه", "مشاهده جزئیات", "تأیید در کیف پول"],
      viewRows: ["نبض شبکه", "داشبورد راند", "پروفایل کیف پول"],
      treeRows: ["معرف", "کیف پول شما", "اعضای شبکه"],
    },
    technology: {
      eyebrow: "زیرساخت پلتفرم", title: "فناوری", emphasis: "قابل بررسی.",
      subtitle: "بر پایه قرارداد BNB Smart Chain، با جداسازی روشن مجوز کیف پول، فراخوانی قرارداد و اطلاعاتی که در داشبورد دیده می‌شود.",
      core: "آنچین", small: "هسته", nodes: ["کیف پول", "فکتوری", "پنجره راند", "اکسپلورر"],
      items: [
        { title: "دسترسی با کیف پول", detail: "کیف پول امضاکننده است و سایت به عبارت بازیابی تو نیاز ندارد." },
        { title: "داده‌های قراردادی", detail: "اطلاعات ثبت‌نام و راند از قراردادهای پیکربندی‌شده دریافت می‌شوند." },
        { title: "تراکنش‌های قابل پیگیری", detail: "تراکنش‌های ارسال‌شده را می‌توان مستقل در BscScan بررسی کرد." },
        { title: "مشاهده حساب", detail: "راند، تاریخچه و صفحه شبکه‌ات را در یک محیط ببین." },
      ],
      foot: "هیچ رابط کاربری ریسک قرارداد، شبکه یا کیف پول را حذف نمی‌کند. هر تراکنش را قبل از تأیید بررسی کن.",
    },
    ecosystem: {
      eyebrow: "یک پلتفرم یکپارچه", title: "امکانات ضروری.", emphasis: "در کنار هم.",
      subtitle: "بخش‌های موجود در پلتفرم را ببین. قابلیت‌های نیازمند کیف پول یا سرویس خارجی به تنظیمات آن‌ها وابسته‌اند.",
      items: [
        { title: "داشبورد", detail: "نمای یکپارچه کیف پول و وضعیت شبکه." },
        { title: "نبض شبکه", detail: "آمار راند و داده‌هایی که از قرارداد دریافت می‌شوند." },
        { title: "شجره‌نامه", detail: "مشاهده ارتباطات معرفی و اعضای شبکه." },
        { title: "صندوق هفتگی", detail: "بررسی پنجره هفتگی قرارداد و اطلاعات حساب." },
        { title: "تبدیل ارز", detail: "دسترسی به سواپ واقعی روی BNB؛ معاملات با پول واقعی انجام می‌شوند." },
        { title: "مرکز آموزش", detail: "آشنایی با سازوکار قرارداد و مبانی بلاک‌چین." },
      ],
      view: "مشاهده بخش",
    },
    story: {
      eyebrow: "منطق تجربه کاربری", title: "مسیر ساده‌تر.", emphasis: "شفافیت بیشتر.",
      intro: "هدف، پنهان‌کردن پیچیدگی بلاک‌چین نیست؛ بلکه روشن‌کردن مراحل مهم پیش از اقدام کاربر است.",
      timeline: [
        { title: "نمای کلی", detail: "خلاصه‌ای روشن از شبکه، بخش‌های مختلف و کاربرد آن‌ها." },
        { title: "درک قوانین", detail: "نمایش شروط ثابت قرارداد به‌جای مبلغ‌های انتخابی نامعتبر." },
        { title: "کنترل در دست تو", detail: "تراکنش‌ها به امضای کیف پول نیاز دارند؛ مشاهده صفحات نه." },
        { title: "بررسی مستقل", detail: "اکسپلورر امکان دیدن سوابق عمومی قرارداد و تراکنش‌ها را فراهم می‌کند." },
      ],
      note: "رابط کاربری شفاف به معنی تضمین عملکرد قرارداد یا نتیجه مالی نیست.",
    },
    faq: { eyebrow: "قبل از شروع", title: "سؤال‌های پرتکرار.", subtitle: "نکته‌های مهم پیش از اتصال کیف پول.", all: "تمام سؤالات" },
    cta: {
      eyebrow: "قدم بعد", title: "شبکه را بررسی کن.", emphasis: "با انتخاب خودت.",
      subtitle: "از داشبورد شروع کن، راهنما را بخوان و فقط پس از بررسی جزئیات، تراکنش را تأیید کن.",
      first: "ورود به داشبورد", second: "مطالعه راهنما",
    },
    footer: {
      tagline: "محیط یکپارچه تعامل با قراردادهای BNB Smart Chain و مشاهده اطلاعات شبکه.",
      product: "پلتفرم", resources: "بخش‌های بیشتر",
      disclaimer: "این اطلاعات توصیه مالی نیست. تعامل با قرارداد و سواپ ممکن است شامل پول واقعی و ریسک باشد.",
      chain: "برای BNB SMART CHAIN",
    },
  },
};

const CHALLENGE_ICONS: LucideIcon[] = [Layers3, ScanLine, Compass];
const PILLAR_ICONS: LucideIcon[] = [Wallet2, Code2, ShieldCheck];
const STEP_ICONS: LucideIcon[] = [Wallet2, Layers3, LockKeyhole, BarChart3, Network];
const TECHNOLOGY_ICONS: LucideIcon[] = [Wallet2, Cpu, Activity, FileCode2];
const ECOSYSTEM_ICONS: LucideIcon[] = [BarChart3, Radio, Network, CircleDot, ArrowRight, BookOpen];
const ECOSYSTEM_HREFS = ["/dashboard", "/pulse", "/genealogy", "/weekly", "/swap", "/learn"];
const FOOTER_HREFS = ["/dashboard", "/register", "/history", "/genealogy", "/weekly", "/help", "/news", "/games"];
const FOOTER_KEYS = [
  "Dashboard", "Register", "History", "Genealogy", "Weekly Fund", "Help", "News", "Games",
];
const FOOTER_FA = [
  "داشبورد", "ثبت‌نام", "تاریخچه", "شجره‌نامه", "صندوق هفتگی", "راهنما", "اخبار", "بازی‌ها",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="scn-eyebrow"><i aria-hidden="true" />{children}</span>;
}

function SectionTop({ eyebrow, number }: { eyebrow: string; number?: string }) {
  return (
    <div className="scn-section-top">
      <Eyebrow>{eyebrow}</Eyebrow>
      {number && <span className="scn-number">{number}</span>}
    </div>
  );
}

function Hologram({ t }: { t: LabelCopy["hero"] }) {
  return (
    <div className="scn-hologram" aria-label={t.artKicker} role="img">
      <div className="scn-hologram-glow" />
      <div className="scn-hologram-grid" />
      <div className="scn-orbit scn-orbit-one" />
      <div className="scn-orbit scn-orbit-two" />
      <div className="scn-orbit scn-orbit-three" />
      <div className="scn-hologram-core">
        <div className="scn-core-wire"><Blocks size={76} strokeWidth={1.15} /></div>
        <div className="scn-core-lines">
          <strong>{t.artTitle}</strong><span>{t.artSub}</span>
        </div>
      </div>
      <span className="scn-satellite scn-satellite-one"><Wallet2 size={20} /></span>
      <span className="scn-satellite scn-satellite-two"><Cpu size={20} /></span>
      <span className="scn-satellite scn-satellite-three"><ShieldCheck size={19} /></span>
      <div className="scn-float-label scn-float-top"><span className="scn-live-dot" />{t.network}</div>
      <div className="scn-float-label scn-float-bottom">{t.artBottom}</div>
    </div>
  );
}

function WalkthroughVisual({ index, t }: { index: number; t: LabelCopy["journey"] }) {
  if (index === 0) {
    return <div className="scn-demo-wallet">
      <div className="scn-demo-wallet-icon"><Wallet2 size={38} /></div>
      <div><strong>MetaMask / Trust Wallet</strong><span>WalletConnect · Browser Wallet</span></div>
      <Check size={24} />
    </div>;
  }
  if (index === 1) {
    return <div className="scn-demo-tiers" aria-label={t.choiceLabel}>
      {["$11", "$55", "$110"].map((amount, i) => (
        <div key={amount} className={i === 1 ? "scn-demo-tier scn-picked" : "scn-demo-tier"}>
          <span>0{i + 1}</span><strong>{amount}</strong><small>{["10", "50", "100"][i]} USDT base</small>
        </div>
      ))}
    </div>;
  }
  if (index === 2) {
    return <div className="scn-demo-list">
      {t.txRows.map((label, i) => <div key={label}><span>{i < 2 ? <Check size={18} /> : <LockKeyhole size={18} />}</span><b>{label}</b><small>0{i + 1} / 03</small></div>)}
    </div>;
  }
  if (index === 3) {
    return <div className="scn-demo-list">
      {t.viewRows.map((label, i) => <div key={label}><span><Activity size={18} /></span><b>{label}</b><ChevronRight size={16} /></div>)}
    </div>;
  }
  return <div className="scn-demo-network">
    {t.treeRows.map((label, i) => <div key={label} className={"scn-tree-node scn-tree-node-" + i}><CircleDot size={18} /><span>{label}</span></div>)}
    <div className="scn-demo-tree-line" />
  </div>;
}

export function AuroraLanding() {
  const { locale, setLocale, t } = useLanguage();
  const copy = TEXT[locale];
  const { info } = useMainBulkInfo(0);
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const faq = getLocalizedHelpFaq(locale).slice(0, 4);
  const ActiveIcon = STEP_ICONS[activeStep];
  const userCount = info ? info.userCount.toLocaleString(locale === "fa" ? "fa-IR" : "en-US") : copy.facts.missing;
  const nav = [
    { title: copy.nav.how, href: "#how-it-works" },
    { title: copy.nav.explorer, href: "#in-action" },
    { title: copy.nav.technology, href: "#technology" },
    { title: copy.nav.ecosystem, href: "#ecosystem" },
    { title: copy.nav.faq, href: "#faq" },
  ];
  const currentNetwork = CHAIN_ID === 56 ? "BNB" : "CHAIN " + CHAIN_ID;

  function onStepKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = copy.journey.steps.length - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % copy.journey.steps.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + copy.journey.steps.length - 1) % copy.journey.steps.length;
    else return;
    event.preventDefault();
    setActiveStep(next);
    document.getElementById("scn-tab-" + next)?.focus();
  }

  return (
    <div className="scn-landing" dir={locale === "fa" ? "rtl" : "ltr"}>
      <a href="#scn-main" className="scn-skip">{copy.skip}</a>
      <header className="scn-header">
        <div className="scn-wrap scn-header-inner">
          <Link className="scn-brand" href="/" aria-label="Smart Contract Platform">
            <span className="scn-brand-mark"><Layers3 size={24} /></span>
            <span><b>SMART CONTRACT</b><small>PLATFORM</small></span>
          </Link>
          <nav className={mobileMenu ? "scn-nav scn-nav-open" : "scn-nav"} aria-label="Primary navigation" id="scn-navigation">
            {nav.map(item => <a href={item.href} key={item.href} onClick={() => setMobileMenu(false)}>{item.title}</a>)}
          </nav>
          <div className="scn-header-actions">
            <button className="scn-language" aria-label={t("common.toggleLanguage")} onClick={() => setLocale(locale === "fa" ? "en" : "fa")}>
              <Globe2 size={16} />{locale === "fa" ? "EN" : "FA"}
            </button>
            <Link className="scn-button scn-button-sm" href="/dashboard">{copy.open}<ArrowUpRight size={16} /></Link>
            <button type="button" className="scn-menu-toggle" aria-label={mobileMenu ? copy.closeMenu : copy.menu} aria-expanded={mobileMenu} aria-controls="scn-navigation" onClick={() => setMobileMenu(value => !value)}>
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <main id="scn-main">
        <section className="scn-hero">
          <div className="scn-hero-pattern" aria-hidden="true" />
          <div className="scn-wrap scn-hero-inner">
            <div className="scn-hero-content">
              <Eyebrow>{copy.hero.eyebrow}</Eyebrow>
              <h1>{copy.hero.title}<br /><em>{copy.hero.emphasis}</em></h1>
              <p>{copy.hero.intro}</p>
              <div className="scn-hero-actions">
                <Link className="scn-button" href="/dashboard">{copy.hero.primary}<ArrowUpRight size={18} /></Link>
                <a className="scn-inline-link" href="#how-it-works">{copy.hero.secondary}<ArrowDown size={17} /></a>
              </div>
              <div className="scn-hero-foot"><ShieldCheck size={17} /><span>{copy.hero.foot}</span></div>
              <div className="scn-hero-contract"><FileCode2 size={16} /><span>Factory</span><code dir="ltr">{FACTORY_ADDRESS.slice(0, 8)}…{FACTORY_ADDRESS.slice(-6)}</code><a href={"https://bscscan.com/address/" + FACTORY_ADDRESS} target="_blank" rel="noopener noreferrer" aria-label="View Factory contract on BscScan"><ArrowUpRight size={15} /></a></div>
            </div>
            <Hologram t={copy.hero} />
          </div>
          <div className="scn-wrap scn-hero-baseline"><span>01 / SMART CONTRACT PLATFORM</span><span>{copy.hero.network}</span></div>
        </section>

        <div className="scn-facts">
          <div className="scn-wrap scn-facts-grid">
            <div><span>{copy.facts.network}</span><strong>{currentNetwork}<small> / {CHAIN_ID}</small></strong></div>
            <div><span>{copy.facts.people}</span><strong dir="auto">{userCount}</strong></div>
            <div><span>{copy.facts.tiers}</span><strong>03</strong></div>
            <div><span>{copy.facts.trace}</span><strong>ON-CHAIN</strong></div>
          </div>
        </div>

        <section className="scn-wrap scn-section" id="challenge">
          <SectionTop eyebrow={copy.challenge.eyebrow} number={copy.challenge.number} />
          <div className="scn-split">
            <h2>{copy.challenge.title}<br /><em>{copy.challenge.emphasis}</em></h2>
            <p>{copy.challenge.intro}</p>
          </div>
          <div className="scn-challenge-grid">
            {copy.challenge.items.map((item, i) => {
              const Icon = CHALLENGE_ICONS[i];
              return <article className="scn-challenge-card" key={item.title}>
                <span className="scn-card-number">0{i + 1}</span>
                <div className="scn-icon-box"><Icon size={26} strokeWidth={1.7} /></div>
                <h3>{item.title}</h3><p>{item.detail}</p>
              </article>;
            })}
          </div>
          <div className="scn-section-foot"><span>{copy.challenge.foot}</span><ArrowUpRight size={21} /></div>
        </section>

        <section className="scn-model-band" id="how-it-works">
          <div className="scn-wrap scn-section">
            <div className="scn-center"><Eyebrow>{copy.model.eyebrow}</Eyebrow><h2>{copy.model.title}<br /><em>{copy.model.emphasis}</em></h2><p>{copy.model.subtitle}</p></div>
            <div className="scn-pillars">
              {copy.model.pillars.map((item, i) => {
                const Icon = PILLAR_ICONS[i];
                return <article key={item.title} className="scn-pillar">
                  <span className="scn-pillar-number">0{i + 1} / 03</span>
                  <div className="scn-pillar-icon"><Icon size={34} strokeWidth={1.55} /></div>
                  <h3>{item.title}</h3><p>{item.detail}</p>
                  {i < copy.model.pillars.length - 1 && <span className="scn-pillar-plus" aria-hidden="true">+</span>}
                </article>;
              })}
            </div>
            <div className="scn-model-equation"><span>=</span>{copy.model.equation}</div>
            <p className="scn-model-end">{copy.model.foot}</p>
          </div>
        </section>

        <section className="scn-wrap scn-section" id="in-action">
          <SectionTop eyebrow={copy.journey.eyebrow} number={copy.journey.number} />
          <div className="scn-split">
            <h2>{copy.journey.title}<br /><em>{copy.journey.emphasis}</em></h2>
            <p>{copy.journey.subtitle}</p>
          </div>
          <div className="scn-tour">
            <div className="scn-tour-tabs" role="tablist" aria-label={copy.journey.eyebrow} aria-orientation="vertical">
              {copy.journey.steps.map((item, i) => {
                const Icon = STEP_ICONS[i];
                return <button type="button" role="tab" key={item.title}
                  id={"scn-tab-" + i}
                  aria-selected={activeStep === i}
                  aria-controls="scn-tour-panel"
                  tabIndex={activeStep === i ? 0 : -1}
                  className={activeStep === i ? "scn-tour-tab scn-tour-selected" : "scn-tour-tab"}
                  onKeyDown={event => onStepKeyDown(event, i)}
                  onClick={() => setActiveStep(i)}>
                  <span>{item.label}</span><Icon size={19} /><b>{item.title}</b><ArrowUpRight size={16} />
                </button>;
              })}
            </div>
            <div className="scn-tour-panel" id="scn-tour-panel" role="tabpanel" aria-labelledby={"scn-tab-" + activeStep} tabIndex={0}>
              <div className="scn-terminal-top"><span><i />{copy.journey.panelKicker}</span><small>{copy.journey.simulated}</small></div>
              <div className="scn-tour-panel-body" key={activeStep}>
                <span className="scn-mini-label">{copy.journey.labels[activeStep]} · 0{activeStep + 1}/05</span>
                <div className="scn-tour-title"><ActiveIcon size={30} /><h3>{copy.journey.steps[activeStep].title}</h3></div>
                <p>{copy.journey.steps[activeStep].detail}</p>
                <WalkthroughVisual index={activeStep} t={copy.journey} />
              </div>
              <div className="scn-tour-bottom"><span>0{activeStep + 1}<small> / 05</small></span><button type="button" onClick={() => setActiveStep(index => (index + 1) % copy.journey.steps.length)}>
                {activeStep === copy.journey.steps.length - 1 ? copy.journey.restart : copy.journey.next}<ArrowRight size={17} />
              </button></div>
            </div>
          </div>
          <p className="scn-caption">{copy.journey.disclaimer}</p>
        </section>

        <section className="scn-tech-band" id="technology">
          <div className="scn-wrap scn-section">
            <div className="scn-center"><Eyebrow>{copy.technology.eyebrow}</Eyebrow><h2>{copy.technology.title}<br /><em>{copy.technology.emphasis}</em></h2><p>{copy.technology.subtitle}</p></div>
            <div className="scn-tech-layout">
              <div className="scn-tech-diagram" aria-hidden="true">
                <div className="scn-tech-ring scn-tech-ring-a" /><div className="scn-tech-ring scn-tech-ring-b" /><div className="scn-tech-ring scn-tech-ring-c" />
                <div className="scn-tech-core"><Blocks size={48} strokeWidth={1.45} /><strong>{copy.technology.core}</strong><small>{copy.technology.small}</small></div>
                {copy.technology.nodes.map((node, i) => <span key={node} className={"scn-tech-node scn-tech-node-" + i}>{node}</span>)}
              </div>
              <div className="scn-tech-features">
                {copy.technology.items.map((item, i) => {
                  const Icon = TECHNOLOGY_ICONS[i];
                  return <article key={item.title}><Icon size={23} strokeWidth={1.65} /><h3>{item.title}</h3><p>{item.detail}</p></article>;
                })}
              </div>
            </div>
            <div className="scn-tech-warning"><ShieldCheck size={18} /><span>{copy.technology.foot}</span></div>
          </div>
        </section>

        <section className="scn-wrap scn-section" id="ecosystem">
          <SectionTop eyebrow={copy.ecosystem.eyebrow} number="03 / ECOSYSTEM" />
          <div className="scn-split"><h2>{copy.ecosystem.title}<br /><em>{copy.ecosystem.emphasis}</em></h2><p>{copy.ecosystem.subtitle}</p></div>
          <div className="scn-ecosystem-grid">
            {copy.ecosystem.items.map((item, i) => {
              const Icon = ECOSYSTEM_ICONS[i];
              return <Link className="scn-ecosystem-card" key={item.title} href={ECOSYSTEM_HREFS[i]}>
                <span className="scn-ecosystem-top"><Icon size={26} strokeWidth={1.55} /><span>0{i + 1}</span></span>
                <h3>{item.title}</h3><p>{item.detail}</p>
                <span className="scn-ecosystem-more">{copy.ecosystem.view}<ArrowUpRight size={16} /></span>
              </Link>;
            })}
          </div>
        </section>

        <section className="scn-story-band" id="story">
          <div className="scn-wrap scn-section">
            <SectionTop eyebrow={copy.story.eyebrow} />
            <div className="scn-split"><h2>{copy.story.title}<br /><em>{copy.story.emphasis}</em></h2><p>{copy.story.intro}</p></div>
            <div className="scn-story-content">
              <div className="scn-story-art" aria-hidden="true">
                <div className="scn-story-mesh" /><div className="scn-story-planet"><Globe2 size={106} strokeWidth={0.75} /></div>
                <span>SMART CONTRACT<br />PLATFORM</span>
              </div>
              <div className="scn-timeline">
                {copy.story.timeline.map((item, i) => <article key={item.title}><span className="scn-timeline-mark">0{i + 1}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div></article>)}
              </div>
            </div>
            <p className="scn-caption scn-story-note">{copy.story.note}</p>
          </div>
        </section>

        <section className="scn-wrap scn-section scn-faq" id="faq">
          <div className="scn-center"><Eyebrow>{copy.faq.eyebrow}</Eyebrow><h2>{copy.faq.title}</h2><p>{copy.faq.subtitle}</p></div>
          <div className="scn-faq-list">{faq.map((item, i) =>
            <details key={item.question} className="scn-faq-item">
              <summary><span>0{i + 1}</span><b>{item.question}</b><span className="scn-faq-plus">+</span></summary>
              <p>{item.answer}</p>
            </details>
          )}</div>
          <Link className="scn-inline-link scn-faq-link" href="/help">{copy.faq.all}<ArrowUpRight size={17} /></Link>
        </section>

        <section className="scn-closing">
          <div className="scn-wrap scn-closing-inner">
            <Eyebrow>{copy.cta.eyebrow}</Eyebrow>
            <h2>{copy.cta.title}<br /><em>{copy.cta.emphasis}</em></h2>
            <p>{copy.cta.subtitle}</p>
            <div className="scn-hero-actions scn-cta-actions">
              <Link className="scn-button scn-button-light" href="/dashboard">{copy.cta.first}<ArrowUpRight size={18} /></Link>
              <Link className="scn-inline-link" href="/help">{copy.cta.second}<ArrowRight size={17} /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="scn-footer">
        <div className="scn-wrap scn-footer-layout">
          <div className="scn-footer-brand">
            <Link className="scn-brand" href="/"><span className="scn-brand-mark"><Layers3 size={23} /></span><span><b>SMART CONTRACT</b><small>PLATFORM</small></span></Link>
            <p>{copy.footer.tagline}</p>
            <a href={"https://bscscan.com/address/" + FACTORY_ADDRESS} target="_blank" rel="noopener noreferrer" className="scn-footer-explorer">BscScan <ArrowUpRight size={15} /></a>
          </div>
          <div className="scn-footer-links"><h3>{copy.footer.product}</h3>{FOOTER_HREFS.slice(0, 4).map((href, i) => <Link key={href} href={href}>{locale === "fa" ? FOOTER_FA[i] : FOOTER_KEYS[i]}</Link>)}</div>
          <div className="scn-footer-links"><h3>{copy.footer.resources}</h3>{FOOTER_HREFS.slice(4).map((href, i) => <Link key={href} href={href}>{locale === "fa" ? FOOTER_FA[i + 4] : FOOTER_KEYS[i + 4]}</Link>)}</div>
        </div>
        <div className="scn-wrap scn-footer-bottom"><span>© {new Date().getFullYear()} Smart Contract Platform</span><span>{copy.footer.disclaimer}</span><span>{copy.footer.chain}</span></div>
      </footer>
    </div>
  );
}
