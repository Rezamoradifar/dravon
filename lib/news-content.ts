export interface Announcement {
  slug: string;
  tag: "Feature" | "Education";
  title: string;
  summary: string;
  href: string;
}

/** Honest changelog of this app's own shipped features - not market or investment news. */
export const ANNOUNCEMENTS: Announcement[] = [
  {
    slug: "swap-live",
    tag: "Feature",
    title: "Trade directly through PancakeSwap",
    summary: "The new /swap page talks directly to PancakeSwap's Router V2 contract - live quotes, slippage control and price-impact estimation.",
    href: "/swap",
  },
  {
    slug: "learning-center",
    tag: "Education",
    title: "Understand flash loans and arbitrage, safely",
    summary: "The Learning Center explains flash loans, arbitrage, MEV and AMMs, with a fully simulated calculator - no real transactions, no profit promises.",
    href: "/learn",
  },
  {
    slug: "genealogy-referral",
    tag: "Feature",
    title: "Share your referral link with a QR code",
    summary: "The Genealogy page now includes a shareable referral link, QR code, and a per-wallet round activity chart.",
    href: "/genealogy",
  },
];

export const NEWS_CARDS = [
  {
    title: "Live on-chain data, everywhere",
    description: "Native-token price, gas price and block status refresh automatically across the dashboard.",
  },
  {
    title: "Everything reads from the contract",
    description: "Round id, statistics, user data and genealogy are all read live from the round-window contract's ABI - nothing is hardcoded.",
  },
  {
    title: "Multi-RPC reliability",
    description: "Reads automatically fail over across multiple public BNB Smart Chain RPC endpoints if one is slow or unavailable.",
  },
];

type LocalizedAnnouncementFields = Pick<Announcement, "tag" | "title" | "summary"> & { tagLabel: string };

export const ANNOUNCEMENTS_FA: Record<string, LocalizedAnnouncementFields> = {
  "swap-live": {
    tag: "Feature",
    tagLabel: "ویژگی",
    title: "معامله مستقیم از طریق پنکیک‌سواپ",
    summary: "صفحه جدید /swap مستقیماً با قرارداد Router V2 پنکیک‌سواپ صحبت می‌کند - قیمت زنده، کنترل لغزش قیمت و تخمین تأثیر قیمتی.",
  },
  "learning-center": {
    tag: "Education",
    tagLabel: "آموزش",
    title: "وام‌های فلش و آربیتراژ را ایمن درک کنید",
    summary: "مرکز آموزش، وام‌های فلش، آربیتراژ، MEV و AMM‌ها را با یک ماشین‌حساب کاملاً شبیه‌سازی‌شده توضیح می‌دهد - بدون تراکنش واقعی، بدون وعده سود.",
  },
  "genealogy-referral": {
    tag: "Feature",
    tagLabel: "ویژگی",
    title: "لینک معرفی خود را با کد QR به اشتراک بگذارید",
    summary: "صفحه شجره‌نامه اکنون شامل یک لینک معرفی قابل‌اشتراک، کد QR و نمودار فعالیت راند برای هر کیف‌پول است.",
  },
};

export function getLocalizedAnnouncements(locale: "en" | "fa" = "en"): Announcement[] {
  if (locale !== "fa") return ANNOUNCEMENTS;
  return ANNOUNCEMENTS.map((item) => {
    const fa = ANNOUNCEMENTS_FA[item.slug];
    if (!fa) return item;
    return { ...item, title: fa.title, summary: fa.summary };
  });
}

export const NEWS_CARDS_FA: { title: string; description: string }[] = [
  {
    title: "داده زنده آن‌چین، همه‌جا",
    description: "قیمت توکن بومی، قیمت گاز و وضعیت بلاک به‌صورت خودکار در سراسر داشبورد بروزرسانی می‌شوند.",
  },
  {
    title: "همه‌چیز از قرارداد خوانده می‌شود",
    description: "شناسه راند، آمار، داده کاربر و شجره‌نامه همگی به‌صورت زنده از ABI قرارداد پنجره راند خوانده می‌شوند - چیزی هاردکد نشده است.",
  },
  {
    title: "قابلیت اطمینان چند-RPC",
    description: "خواندن‌ها به‌صورت خودکار بین چندین نقطه پایانی عمومی RPC شبکه BNB Smart Chain جابه‌جا می‌شوند اگر یکی کند یا در دسترس نباشد.",
  },
];

export function getLocalizedNewsCards(locale: "en" | "fa" = "en") {
  return locale === "fa" ? NEWS_CARDS_FA : NEWS_CARDS;
}
