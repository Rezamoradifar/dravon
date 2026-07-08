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
