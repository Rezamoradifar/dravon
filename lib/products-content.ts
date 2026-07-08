export interface Product {
  slug: string;
  name: string;
  status: "Live" | "Educational Demo" | "Educational";
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
];
