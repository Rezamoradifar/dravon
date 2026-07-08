export interface LearningTopic {
  slug: string;
  title: string;
  summary: string;
  riskLevel: "Low" | "Medium" | "High" | "Very High";
  supportedNetworks: string[];
  supportedDexes: string[];
  workflow: { title: string; description: string }[];
  explanation: string[];
  faq: { question: string; answer: string }[];
}

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    slug: "flash-loans",
    title: "Flash Loans",
    summary:
      "Uncollateralized loans that must be borrowed and repaid within a single blockchain transaction.",
    riskLevel: "High",
    supportedNetworks: ["Ethereum", "BNB Smart Chain", "Polygon", "Arbitrum"],
    supportedDexes: ["Aave", "PancakeSwap", "Uniswap", "Balancer"],
    workflow: [
      { title: "Borrow", description: "A smart contract requests a large amount of a token from a lending pool, with no upfront collateral." },
      { title: "Use", description: "Within the same transaction, the borrowed funds are used - for example, swapped across two markets." },
      { title: "Repay", description: "The original amount plus a fee must be returned to the pool before the transaction ends." },
      { title: "Atomic revert", description: "If repayment fails for any reason, the entire transaction reverts as if nothing happened - the lender can never be left unpaid." },
    ],
    explanation: [
      "Flash loans exist because blockchain transactions are atomic: every step inside a transaction either all succeeds or all reverts together. This lets a lending protocol give out an uncollateralized loan safely, because it can guarantee repayment happens before the transaction is allowed to finalize.",
      "They are mainly used for capital-efficient operations that only make sense at large scale for a few seconds: collateral swaps, self-liquidations, and reacting to price differences between markets.",
      "The main risks are technical, not financial in the traditional sense: smart contract bugs, gas cost spikes, and the same atomicity that protects lenders can be used to manipulate poorly designed price oracles within a single transaction.",
    ],
    faq: [
      {
        question: "Can I lose money with a flash loan?",
        answer:
          "You cannot lose the borrowed principal itself (the transaction reverts if you can't repay it), but you can still lose the gas fee you spent attempting the transaction, and any of your own funds used alongside the loan.",
      },
      {
        question: "Do flash loans guarantee profit?",
        answer:
          "No. They are a financing tool, not a strategy. Whether a specific use of a flash loan is profitable depends entirely on market conditions at that exact moment and competition from other transactions.",
      },
    ],
  },
  {
    slug: "arbitrage",
    title: "Arbitrage",
    summary: "Exploiting temporary price differences for the same asset across two or more markets.",
    riskLevel: "Medium",
    supportedNetworks: ["Ethereum", "BNB Smart Chain", "Polygon"],
    supportedDexes: ["PancakeSwap", "Uniswap", "SushiSwap"],
    workflow: [
      { title: "Detect", description: "Compare the price of the same asset across two venues." },
      { title: "Size the trade", description: "Estimate how much can be traded before the price difference closes due to slippage." },
      { title: "Execute", description: "Buy on the cheaper venue and sell on the more expensive one, ideally in the same transaction." },
      { title: "Settle", description: "Fees, gas, and slippage are subtracted from the gross price difference to find the real result." },
    ],
    explanation: [
      "In efficient markets, identical assets should trade at the same price everywhere. On-chain, prices can briefly diverge between pools due to uneven trading activity, making a temporary gap available to whoever acts on it first.",
      "These gaps are usually small and close within seconds, because many independent participants (and automated bots) are competing to capture them - this is what keeps markets efficient in the first place.",
      "Gas costs, slippage, and trading fees all eat into the theoretical gap, and on public mempools other participants can see and outbid a pending transaction before it confirms.",
    ],
    faq: [
      {
        question: "Is arbitrage risk-free?",
        answer:
          "No. Price gaps can close before your transaction confirms, gas costs can exceed the gap, and competing transactions can be prioritized ahead of yours.",
      },
    ],
  },
  {
    slug: "mev",
    title: "MEV (Maximal Extractable Value)",
    summary: "Value that can be extracted by controlling the order, inclusion, or exclusion of transactions in a block.",
    riskLevel: "Very High",
    supportedNetworks: ["Ethereum", "BNB Smart Chain"],
    supportedDexes: ["Uniswap", "PancakeSwap"],
    workflow: [
      { title: "Observe mempool", description: "Pending transactions are visible before they're included in a block." },
      { title: "Simulate outcomes", description: "Searchers simulate how reordering or inserting transactions around a pending one would change the result." },
      { title: "Bid for placement", description: "Searchers bid (often via private relays) for their transaction to be placed favorably by the block builder." },
      { title: "Block inclusion", description: "The builder/validator includes the ordered bundle of transactions in the next block." },
    ],
    explanation: [
      "Whoever decides the order of transactions in a block can profit from that ordering - for example, by placing their own trade immediately before and after a large pending trade (a 'sandwich').",
      "This is a well-studied, adversarial part of public blockchains. It's a core reason DEX users are advised to set a minimum-received / slippage limit on every trade.",
      "This topic is presented here purely for education. It is not something this app automates or performs on your behalf.",
    ],
    faq: [
      {
        question: "Does this app perform MEV extraction for me?",
        answer: "No. This page is educational only. This app does not run any bots, searchers, or private-relay bundles.",
      },
    ],
  },
  {
    slug: "cross-chain-arbitrage",
    title: "Cross-Chain Arbitrage",
    summary: "Arbitrage between the same or equivalent assets priced differently on two separate blockchains.",
    riskLevel: "Very High",
    supportedNetworks: ["Ethereum", "BNB Smart Chain", "Polygon", "Arbitrum", "Optimism", "Base"],
    supportedDexes: ["PancakeSwap", "Uniswap", "Bridges (e.g. Stargate, Across)"],
    workflow: [
      { title: "Detect", description: "Compare the price of a bridged or wrapped asset on two chains." },
      { title: "Bridge", description: "Move the asset (or equivalent value) from the cheaper chain to the more expensive one - this takes real time, from seconds to many minutes." },
      { title: "Sell", description: "Sell into the more expensive market once the asset arrives." },
      { title: "Return capital", description: "Bridge proceeds back if the strategy needs to repeat." },
    ],
    explanation: [
      "Unlike same-chain arbitrage, cross-chain arbitrage cannot happen atomically in one transaction - bridging introduces real delay and its own smart contract risk.",
      "By the time funds arrive on the destination chain, the price gap that motivated the trade may have already closed, or moved further out of favor.",
      "Bridge security is a major independent risk factor: several of the largest hacks in DeFi history have been bridge exploits, separate from any price-arbitrage risk.",
    ],
    faq: [
      {
        question: "Why isn't this atomic like flash-loan arbitrage?",
        answer:
          "Because two separate blockchains cannot be updated inside a single transaction. Bridging requires waiting for confirmations and, often, a separate relayer or validator set.",
      },
    ],
  },
  {
    slug: "dex-arbitrage",
    title: "DEX Arbitrage",
    summary: "Arbitrage between two decentralized exchanges (or two pools) on the same chain.",
    riskLevel: "Medium",
    supportedNetworks: ["BNB Smart Chain", "Ethereum"],
    supportedDexes: ["PancakeSwap", "Uniswap", "Biswap"],
    workflow: [
      { title: "Compare pools", description: "Read reserves from two pools trading the same pair (e.g. BNB/USDT on two different DEXs)." },
      { title: "Compute the gap", description: "Work out the effective price on each pool after accounting for their fee tiers." },
      { title: "Route the trade", description: "Buy low on one pool, sell high on the other, often within one transaction using a router or flash loan." },
      { title: "Verify profitability", description: "Subtract gas and fees from the raw price gap to see if it was actually worth executing." },
    ],
    explanation: [
      "Because each DEX pool prices assets independently based on its own reserves, two pools for the same pair rarely have exactly the same price at every moment.",
      "This is one of the simplest forms of arbitrage to reason about, and also one of the most competitive, since it only requires reading public reserve data - no bridging, no private information.",
    ],
    faq: [
      {
        question: "Can this be simulated safely?",
        answer: "Yes - see the Simulator page, which uses illustrative numbers you control to show how the calculation works, without placing any real trades.",
      },
    ],
  },
];

export function getTopic(slug: string) {
  return LEARNING_TOPICS.find((t) => t.slug === slug);
}
