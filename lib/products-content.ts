export interface Product {
  slug: string;
  name: string;
  status: "Live" | "Educational Demo";
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
    href: "/",
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
    features: ["Interactive tree graph", "QR code referral link", "Copy-to-clipboard", "Per-round activity chart"],
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
];
