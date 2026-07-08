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
  {
    slug: "amm",
    title: "Automated Market Makers (AMMs)",
    summary: "Smart contracts that price and trade assets algorithmically, using pooled liquidity instead of an order book.",
    riskLevel: "Medium",
    supportedNetworks: ["Ethereum", "BNB Smart Chain", "Polygon", "Arbitrum"],
    supportedDexes: ["PancakeSwap", "Uniswap", "Curve"],
    workflow: [
      { title: "Pool funded", description: "Liquidity providers deposit a pair of tokens into a shared pool." },
      { title: "Price via formula", description: "A formula (commonly x * y = k) sets the exchange rate based on the pool's current balances." },
      { title: "Trade", description: "A trader swaps one token for the other; the pool's balances - and therefore the price - shift accordingly." },
      { title: "Fees accrue", description: "A small fee from each trade is added to the pool, shared among liquidity providers." },
    ],
    explanation: [
      "Unlike a traditional exchange that matches buyers and sellers directly, an AMM always quotes a price algorithmically from whatever is in the pool - there's always someone to trade with, but the price moves as the pool's ratio changes.",
      "Larger trades relative to the pool size move the price more - this is 'slippage', and it's why price impact is shown before every swap.",
      "Liquidity providers earn trading fees, but are exposed to 'impermanent loss' if the two pooled assets' relative price moves significantly compared to just holding them.",
    ],
    faq: [
      {
        question: "Why does my swap quote change as I type a bigger amount?",
        answer:
          "Because the AMM's price is a function of pool size versus trade size - larger trades shift the pool ratio more, which is exactly what the price-impact figure on the Swap page reflects.",
      },
    ],
  },
  {
    slug: "liquidity",
    title: "Liquidity Pools",
    summary: "Shared reserves of two (or more) tokens that let an AMM offer trades without a matching counterparty.",
    riskLevel: "Medium",
    supportedNetworks: ["Ethereum", "BNB Smart Chain", "Polygon"],
    supportedDexes: ["PancakeSwap", "Uniswap"],
    workflow: [
      { title: "Deposit", description: "A liquidity provider deposits equal value of two tokens into a pool." },
      { title: "Receive LP tokens", description: "The pool issues LP tokens representing the provider's share of the pool." },
      { title: "Earn fees", description: "Trading fees accumulate in the pool proportional to each provider's share." },
      { title: "Withdraw", description: "The provider redeems LP tokens for their share of the pool's current balances, whatever they are at that time." },
    ],
    explanation: [
      "Liquidity is what lets an AMM function at all - without pooled funds, there would be nothing to trade against.",
      "Because withdrawal returns whatever ratio the pool currently holds (not necessarily what was deposited), a provider's balance of each token changes as the price moves - the basis of impermanent loss.",
    ],
    faq: [
      {
        question: "Is providing liquidity risk-free?",
        answer:
          "No. Besides impermanent loss, pool contracts themselves carry smart-contract risk, and low-liquidity pools can have very high price impact for traders.",
      },
    ],
  },
  {
    slug: "pancakeswap",
    title: "PancakeSwap",
    summary: "The largest AMM-based decentralized exchange on BNB Smart Chain.",
    riskLevel: "Medium",
    supportedNetworks: ["BNB Smart Chain", "Ethereum", "Arbitrum", "Base"],
    supportedDexes: ["PancakeSwap"],
    workflow: [
      { title: "Router contract", description: "Trades are sent to PancakeSwap's public Router contract, which finds a path through one or more pools." },
      { title: "Quote", description: "getAmountsOut computes the expected output for a given input along that path, before you sign anything." },
      { title: "Swap", description: "Once confirmed, the router pulls the input token (or native BNB) and sends the output token to your wallet." },
      { title: "Settlement", description: "The trade either fully completes on-chain in one transaction, or fully reverts - there's no partial fill." },
    ],
    explanation: [
      "This app's /swap page talks directly to PancakeSwap's public Router V2 contract - the same contract PancakeSwap's own interface uses.",
      "Always check the quoted minimum received and price impact before confirming; on thinly-traded pairs, price impact can be significant even for modest trade sizes.",
    ],
    faq: [
      {
        question: "Does this app take a fee on top of PancakeSwap's?",
        answer: "No. Only PancakeSwap's own pool trading fee applies; this app adds no additional fee.",
      },
    ],
  },
  {
    slug: "uniswap",
    title: "Uniswap",
    summary: "The AMM protocol that popularized the constant-product market maker model, now spanning multiple chains.",
    riskLevel: "Medium",
    supportedNetworks: ["Ethereum", "Arbitrum", "Optimism", "Base", "Polygon"],
    supportedDexes: ["Uniswap"],
    workflow: [
      { title: "Pool selection", description: "Uniswap v3+ pools are split by fee tier (e.g. 0.05%, 0.3%, 1%) for the same pair." },
      { title: "Concentrated liquidity", description: "Since v3, liquidity providers can concentrate funds within a price range instead of the full 0 to infinity range." },
      { title: "Routing", description: "A router (or aggregator) finds the best path, potentially across multiple pools and fee tiers." },
      { title: "Swap", description: "The trade executes atomically against the selected pool(s)." },
    ],
    explanation: [
      "This dashboard does not integrate Uniswap directly (it's built around BNB Smart Chain and PancakeSwap) - this page is reference material only, useful for understanding AMMs generally since Uniswap's design is the model most others (including PancakeSwap) are based on.",
    ],
    faq: [
      {
        question: "Can I trade Uniswap pools from this app?",
        answer: "No - the Swap page here is wired to PancakeSwap on BNB Smart Chain only.",
      },
    ],
  },
  {
    slug: "smart-contracts",
    title: "Smart Contract Risk",
    summary: "Why interacting with any smart contract - including this one - carries inherent technical risk.",
    riskLevel: "High",
    supportedNetworks: ["Ethereum", "BNB Smart Chain", "Polygon", "Arbitrum", "Optimism", "Base"],
    supportedDexes: [],
    workflow: [
      { title: "Code is the rulebook", description: "A smart contract's deployed bytecode - not any marketing claim - defines exactly what can happen to funds sent to it." },
      { title: "Immutability", description: "Most contracts cannot be changed after deployment unless the developer specifically built in an upgrade mechanism, which is itself a trust assumption." },
      { title: "Audits reduce, don't eliminate, risk", description: "A third-party audit reviews code for known bug patterns, but cannot guarantee the absence of all bugs or malicious behavior." },
      { title: "Your own verification", description: "Reading the deployed ABI (as this app does) tells you exactly which functions exist and what they accept - it doesn't tell you what they guarantee to do." },
    ],
    explanation: [
      "This app only ever calls the functions defined in the round-window contract's own ABI, and never asserts anything about the contract's behavior or trustworthiness beyond what's directly observable on-chain.",
      "Anyone interacting with any smart contract - including the one this dashboard is built for - should independently verify the contract source, any available audits, and understand that on-chain permission checks (like admin-only functions) are enforced by the contract, not by any front-end.",
    ],
    faq: [
      {
        question: "Has the contract this app talks to been audited?",
        answer:
          "This app doesn't have access to an audit report for the round-window contract. Always verify a contract's source and any audit history independently before sending funds.",
      },
    ],
  },
  {
    slug: "wallet-security",
    title: "Wallet Security",
    summary: "Practical habits for keeping a self-custody wallet safe while using Web3 apps.",
    riskLevel: "High",
    supportedNetworks: ["All EVM chains"],
    supportedDexes: [],
    workflow: [
      { title: "Seed phrase offline", description: "Your recovery phrase should never be typed into a website, chat, or email - only into your wallet app itself." },
      { title: "Verify before signing", description: "Read what a transaction actually does (which contract, which function, how much value) before approving it in your wallet." },
      { title: "Limit approvals", description: "Token approvals grant a contract permission to move your tokens - review and revoke unused approvals periodically." },
      { title: "Use a fresh wallet for testing", description: "When trying an unfamiliar contract, consider a wallet with only the funds you're willing to risk." },
    ],
    explanation: [
      "Every action this app can perform is limited to what your wallet explicitly approves - it cannot move funds without your signature, and it never asks for your seed phrase.",
      "The single biggest cause of self-custody losses is not smart-contract bugs but phishing: fake sites, fake support agents, and malicious links that trick people into approving something they didn't intend to.",
    ],
    faq: [
      {
        question: "Will this app ever ask for my seed phrase or private key?",
        answer: "No, never. No legitimate Web3 app needs it - wallet connections use your browser extension or WalletConnect, which never exposes your private key to the site.",
      },
    ],
  },
];

export function getTopic(slug: string) {
  return LEARNING_TOPICS.find((t) => t.slug === slug);
}
