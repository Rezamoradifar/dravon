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

type LocalizedFields = Pick<LearningTopic, "title" | "summary" | "workflow" | "explanation" | "faq">;

export const LEARNING_TOPICS_FA: Record<string, LocalizedFields> = {
  "flash-loans": {
    title: "وام‌های فلش",
    summary: "وام‌های بدون وثیقه که باید در یک تراکنش واحد بلاکچینی قرض گرفته و بازپرداخت شوند.",
    workflow: [
      { title: "قرض گرفتن", description: "یک قرارداد هوشمند مقدار زیادی از یک توکن را از استخر وام‌دهی، بدون وثیقه پیشین، درخواست می‌کند." },
      { title: "استفاده", description: "در همان تراکنش، وجوه قرض‌گرفته‌شده استفاده می‌شوند - مثلاً بین دو بازار تبدیل می‌شوند." },
      { title: "بازپرداخت", description: "مبلغ اصلی به‌همراه کارمزد باید قبل از پایان تراکنش به استخر بازگردانده شود." },
      { title: "بازگشت اتمی", description: "اگر بازپرداخت به هر دلیلی ناموفق باشد، کل تراکنش برمی‌گردد، انگار هیچ‌چیز اتفاق نیفتاده - وام‌دهنده هرگز بی‌پرداخت باقی نمی‌ماند." },
    ],
    explanation: [
      "وام‌های فلش به این دلیل وجود دارند که تراکنش‌های بلاکچین اتمی هستند: هر مرحله داخل یک تراکنش یا همه موفق می‌شود یا همه با هم برمی‌گردد. این اجازه می‌دهد یک پروتکل وام‌دهی، وام بدون وثیقه‌ای ایمن ارائه دهد، چون می‌تواند تضمین کند بازپرداخت قبل از نهایی‌شدن تراکنش انجام می‌شود.",
      "این وام‌ها عمدتاً برای عملیات کارآمد سرمایه استفاده می‌شوند که فقط در مقیاس بزرگ و برای چند ثانیه معنا دارند: تبدیل وثیقه، تسویه خودکار و واکنش به تفاوت قیمت بین بازارها.",
      "ریسک‌های اصلی فنی هستند، نه مالی به معنای سنتی: باگ‌های قرارداد هوشمند، افزایش ناگهانی هزینه گاز، و همان اتمیک‌بودنی که از وام‌دهندگان محافظت می‌کند می‌تواند برای دستکاری اوراکل‌های قیمت طراحی‌شده ضعیف در یک تراکنش استفاده شود.",
    ],
    faq: [
      {
        question: "آیا ممکن است با وام فلش پول از دست بدهم؟",
        answer: "شما نمی‌توانید اصل مبلغ قرض‌گرفته را از دست بدهید (تراکنش برمی‌گردد اگر نتوانید بازپرداخت کنید)، اما ممکن است کارمزد گاز صرف‌شده برای تلاش تراکنش، و هر مقدار از سرمایه خودتان که همراه وام استفاده کرده‌اید را از دست بدهید.",
      },
      {
        question: "آیا وام‌های فلش سود را تضمین می‌کنند؟",
        answer: "خیر. آن‌ها یک ابزار تأمین مالی هستند، نه یک استراتژی. سودآور بودن یک استفاده خاص از وام فلش کاملاً به شرایط بازار در همان لحظه و رقابت با تراکنش‌های دیگر بستگی دارد.",
      },
    ],
  },
  arbitrage: {
    title: "آربیتراژ",
    summary: "بهره‌برداری از تفاوت‌های قیمتی موقت برای یک دارایی یکسان در دو یا چند بازار.",
    workflow: [
      { title: "شناسایی", description: "قیمت یک دارایی یکسان را در دو بستر مقایسه کنید." },
      { title: "تعیین حجم معامله", description: "تخمین بزنید چه مقدار می‌توان معامله کرد قبل از اینکه تفاوت قیمت به‌دلیل لغزش قیمت بسته شود." },
      { title: "اجرا", description: "در بستر ارزان‌تر بخرید و در بستر گران‌تر بفروشید، ترجیحاً در همان تراکنش." },
      { title: "تسویه", description: "کارمزدها، گاز و لغزش قیمت از تفاوت ناخالص قیمت کم می‌شوند تا نتیجه واقعی به‌دست آید." },
    ],
    explanation: [
      "در بازارهای کارآمد، دارایی‌های یکسان باید در همه‌جا با قیمت یکسان معامله شوند. روی زنجیره، قیمت‌ها می‌توانند به‌طور موقت به‌دلیل فعالیت معاملاتی نابرابر بین استخرها واگرا شوند، و یک شکاف موقت برای هر کسی که زودتر روی آن اقدام کند فراهم می‌کنند.",
      "این شکاف‌ها معمولاً کوچک هستند و طی چند ثانیه بسته می‌شوند، چون بسیاری از شرکت‌کنندگان مستقل (و ربات‌های خودکار) در حال رقابت برای گرفتن آن‌ها هستند - این همان چیزی است که بازارها را از ابتدا کارآمد نگه می‌دارد.",
      "هزینه‌های گاز، لغزش قیمت و کارمزدهای معاملاتی همگی از شکاف نظری کم می‌کنند، و در ممپول‌های عمومی سایر شرکت‌کنندگان می‌توانند یک تراکنش در انتظار را ببینند و قبل از تأییدش پیشنهاد بالاتری بدهند.",
    ],
    faq: [
      {
        question: "آیا آربیتراژ بدون ریسک است؟",
        answer: "خیر. شکاف‌های قیمتی می‌توانند قبل از تأیید تراکنش شما بسته شوند، هزینه گاز می‌تواند از شکاف بیشتر شود، و تراکنش‌های رقیب می‌توانند زودتر از شما در اولویت قرار بگیرند.",
      },
    ],
  },
  mev: {
    title: "MEV (حداکثر ارزش قابل استخراج)",
    summary: "ارزشی که با کنترل ترتیب، درج یا حذف تراکنش‌ها در یک بلاک می‌توان استخراج کرد.",
    workflow: [
      { title: "مشاهده ممپول", description: "تراکنش‌های در انتظار قبل از قرارگرفتن در یک بلاک قابل مشاهده هستند." },
      { title: "شبیه‌سازی نتایج", description: "جستجوگرها شبیه‌سازی می‌کنند که چیدمان مجدد یا درج تراکنش‌ها اطراف یک تراکنش در انتظار چطور نتیجه را تغییر می‌دهد." },
      { title: "مناقصه برای جایگاه", description: "جستجوگرها (اغلب از طریق رله‌های خصوصی) برای قرارگیری مطلوب تراکنش خود توسط سازنده بلاک مناقصه می‌دهند." },
      { title: "درج در بلاک", description: "سازنده/اعتبارسنج، بسته مرتب‌شده تراکنش‌ها را در بلاک بعدی درج می‌کند." },
    ],
    explanation: [
      "هرکس که ترتیب تراکنش‌ها در یک بلاک را تعیین کند می‌تواند از آن ترتیب سود ببرد - مثلاً با قرار دادن معامله خودش بلافاصله قبل و بعد از یک معامله بزرگ در انتظار (یک «ساندویچ»).",
      "این بخش تخاصمی و به‌خوبی مطالعه‌شده‌ای از بلاکچین‌های عمومی است. این یکی از دلایل اصلی است که به کاربران DEX توصیه می‌شود روی هر معامله حداقل دریافتی / حد لغزش قیمت تنظیم کنند.",
      "این موضوع فقط برای هدف آموزشی اینجا ارائه شده است. این چیزی نیست که این اپلیکیشن به‌صورت خودکار انجام دهد یا از طرف شما اجرا کند.",
    ],
    faq: [
      {
        question: "آیا این اپلیکیشن استخراج MEV را برای من انجام می‌دهد؟",
        answer: "خیر. این صفحه فقط آموزشی است. این اپلیکیشن هیچ رباتی، جستجوگری یا بسته رله خصوصی اجرا نمی‌کند.",
      },
    ],
  },
  "cross-chain-arbitrage": {
    title: "آربیتراژ بین‌زنجیره‌ای",
    summary: "آربیتراژ بین دارایی‌های یکسان یا معادل که در دو بلاکچین جداگانه قیمت متفاوتی دارند.",
    workflow: [
      { title: "شناسایی", description: "قیمت یک دارایی پل‌زده‌شده یا رپ‌شده را در دو زنجیره مقایسه کنید." },
      { title: "پل زدن", description: "دارایی (یا ارزش معادل) را از زنجیره ارزان‌تر به زنجیره گران‌تر منتقل کنید - این زمان واقعی می‌برد، از چند ثانیه تا چندین دقیقه." },
      { title: "فروش", description: "پس از رسیدن دارایی، در بازار گران‌تر بفروشید." },
      { title: "بازگرداندن سرمایه", description: "اگر استراتژی نیاز به تکرار دارد، درآمد را پل بزنید و برگردانید." },
    ],
    explanation: [
      "برخلاف آربیتراژ درون‌زنجیره‌ای، آربیتراژ بین‌زنجیره‌ای نمی‌تواند به‌صورت اتمی در یک تراکنش انجام شود - پل‌زدن تأخیر واقعی و ریسک قرارداد هوشمند خودش را وارد می‌کند.",
      "تا زمانی که وجوه به زنجیره مقصد برسند، ممکن است شکاف قیمتی که انگیزه معامله بود قبلاً بسته شده یا حتی بیشتر نامساعد شده باشد.",
      "امنیت پل یک عامل ریسک عمده و مستقل است: چندین مورد از بزرگ‌ترین هک‌های تاریخ DeFi، حمله به پل‌ها بوده‌اند، جدا از هر ریسک آربیتراژ قیمتی.",
    ],
    faq: [
      {
        question: "چرا این مثل آربیتراژ وام فلش اتمی نیست؟",
        answer: "چون دو بلاکچین جداگانه نمی‌توانند در یک تراکنش واحد به‌روزرسانی شوند. پل‌زدن نیازمند انتظار برای تأییدها و اغلب یک رله‌گر یا مجموعه اعتبارسنج جداگانه است.",
      },
    ],
  },
  "dex-arbitrage": {
    title: "آربیتراژ صرافی‌های غیرمتمرکز",
    summary: "آربیتراژ بین دو صرافی غیرمتمرکز (یا دو استخر) روی یک زنجیره یکسان.",
    workflow: [
      { title: "مقایسه استخرها", description: "ذخایر را از دو استخر که یک جفت یکسان معامله می‌کنند بخوانید (مثلاً BNB/USDT در دو DEX متفاوت)." },
      { title: "محاسبه شکاف", description: "قیمت مؤثر در هر استخر را با در نظر گرفتن سطح کارمزدشان محاسبه کنید." },
      { title: "مسیریابی معامله", description: "در یک استخر ارزان بخرید و در دیگری گران بفروشید، اغلب در یک تراکنش با استفاده از یک روتر یا وام فلش." },
      { title: "تأیید سودآوری", description: "گاز و کارمزدها را از شکاف خام قیمت کم کنید تا ببینید واقعاً ارزش اجرا داشته یا نه." },
    ],
    explanation: [
      "چون هر استخر DEX دارایی‌ها را به‌طور مستقل بر اساس ذخایر خودش قیمت‌گذاری می‌کند، دو استخر برای یک جفت یکسان به‌ندرت در هر لحظه دقیقاً همان قیمت را دارند.",
      "این یکی از ساده‌ترین اشکال آربیتراژ برای درک است، و همچنین یکی از رقابتی‌ترین‌ها، چون فقط نیاز به خواندن داده‌های عمومی ذخیره دارد - بدون پل‌زدن، بدون اطلاعات خصوصی.",
    ],
    faq: [
      {
        question: "آیا این را می‌توان به‌صورت ایمن شبیه‌سازی کرد؟",
        answer: "بله - صفحه شبیه‌ساز را ببینید، که از اعداد نمایشی تحت کنترل شما استفاده می‌کند تا نحوه کار محاسبه را نشان دهد، بدون انجام هیچ معامله واقعی.",
      },
    ],
  },
  amm: {
    title: "بازارسازهای خودکار (AMM)",
    summary: "قراردادهای هوشمندی که دارایی‌ها را به‌صورت الگوریتمی، با استفاده از نقدینگی استخری به‌جای دفتر سفارش، قیمت‌گذاری و معامله می‌کنند.",
    workflow: [
      { title: "تأمین استخر", description: "تأمین‌کنندگان نقدینگی یک جفت توکن را در یک استخر مشترک واریز می‌کنند." },
      { title: "قیمت‌گذاری با فرمول", description: "یک فرمول (معمولاً x * y = k) نرخ تبدیل را بر اساس موجودی فعلی استخر تعیین می‌کند." },
      { title: "معامله", description: "یک معامله‌گر یک توکن را با دیگری تبدیل می‌کند؛ موجودی استخر - و بنابراین قیمت - بر همان اساس تغییر می‌کند." },
      { title: "انباشت کارمزد", description: "یک کارمزد کوچک از هر معامله به استخر اضافه می‌شود که بین تأمین‌کنندگان نقدینگی تقسیم می‌شود." },
    ],
    explanation: [
      "برخلاف یک صرافی سنتی که خریداران و فروشندگان را مستقیماً تطبیق می‌دهد، یک AMM همیشه قیمت را به‌صورت الگوریتمی از هرچه در استخر است ارائه می‌دهد - همیشه کسی برای معامله وجود دارد، اما قیمت با تغییر نسبت استخر حرکت می‌کند.",
      "معاملات بزرگ‌تر نسبت به اندازه استخر، قیمت را بیشتر حرکت می‌دهند - این «لغزش قیمت» است، و به همین دلیل تأثیر قیمتی قبل از هر تبدیل نشان داده می‌شود.",
      "تأمین‌کنندگان نقدینگی کارمزد معاملاتی کسب می‌کنند، اما در معرض «زیان موقت» قرار دارند اگر قیمت نسبی دو دارایی استخرشده در مقایسه با فقط نگه‌داشتنشان به‌طور قابل‌توجهی تغییر کند.",
    ],
    faq: [
      {
        question: "چرا قیمت پیشنهادی تبدیل من با تایپ مبلغ بزرگ‌تر تغییر می‌کند؟",
        answer: "چون قیمت AMM تابعی از اندازه استخر در برابر اندازه معامله است - معاملات بزرگ‌تر نسبت استخر را بیشتر جابه‌جا می‌کنند، که دقیقاً همان چیزی است که رقم تأثیر قیمتی در صفحه تبدیل نشان می‌دهد.",
      },
    ],
  },
  liquidity: {
    title: "استخرهای نقدینگی",
    summary: "ذخایر مشترک دو (یا چند) توکن که به یک AMM اجازه می‌دهد بدون طرف مقابل منطبق، معامله ارائه دهد.",
    workflow: [
      { title: "واریز", description: "یک تأمین‌کننده نقدینگی ارزش برابری از دو توکن را در یک استخر واریز می‌کند." },
      { title: "دریافت توکن‌های LP", description: "استخر توکن‌های LP صادر می‌کند که نشان‌دهنده سهم تأمین‌کننده از استخر است." },
      { title: "کسب کارمزد", description: "کارمزدهای معاملاتی متناسب با سهم هر تأمین‌کننده در استخر انباشته می‌شوند." },
      { title: "برداشت", description: "تأمین‌کننده توکن‌های LP را برای سهم خود از موجودی فعلی استخر، هرچه که در آن زمان باشد، بازخرید می‌کند." },
    ],
    explanation: [
      "نقدینگی چیزی است که اصلاً به یک AMM اجازه کار کردن می‌دهد - بدون وجوه استخرشده، چیزی برای معامله در برابرش وجود نخواهد داشت.",
      "چون برداشت هر نسبتی که استخر در حال حاضر دارد را برمی‌گرداند (نه لزوماً آنچه واریز شده)، موجودی هر توکن یک تأمین‌کننده با حرکت قیمت تغییر می‌کند - اساس زیان موقت.",
    ],
    faq: [
      {
        question: "آیا تأمین نقدینگی بدون ریسک است؟",
        answer: "خیر. علاوه بر زیان موقت، خود قراردادهای استخر ریسک قرارداد هوشمند دارند، و استخرهای کم‌نقدینگی می‌توانند تأثیر قیمتی بسیار بالایی برای معامله‌گران داشته باشند.",
      },
    ],
  },
  pancakeswap: {
    title: "پنکیک‌سواپ",
    summary: "بزرگ‌ترین صرافی غیرمتمرکز مبتنی بر AMM روی BNB Smart Chain.",
    workflow: [
      { title: "قرارداد روتر", description: "معاملات به قرارداد Router عمومی پنکیک‌سواپ ارسال می‌شوند، که مسیری از طریق یک یا چند استخر پیدا می‌کند." },
      { title: "استعلام قیمت", description: "getAmountsOut خروجی مورد انتظار برای یک ورودی مشخص در آن مسیر را قبل از امضای هرچیزی محاسبه می‌کند." },
      { title: "تبدیل", description: "پس از تأیید، روتر توکن ورودی (یا BNB بومی) را می‌گیرد و توکن خروجی را به کیف‌پول شما می‌فرستد." },
      { title: "تسویه", description: "معامله یا کاملاً روی زنجیره در یک تراکنش تکمیل می‌شود، یا کاملاً برمی‌گردد - هیچ اجرای جزئی وجود ندارد." },
    ],
    explanation: [
      "صفحه /swap این اپلیکیشن مستقیماً با قرارداد Router V2 عمومی پنکیک‌سواپ صحبت می‌کند - همان قراردادی که رابط کاربری خود پنکیک‌سواپ استفاده می‌کند.",
      "همیشه قبل از تأیید، حداقل دریافتی و تأثیر قیمتی پیشنهادی را بررسی کنید؛ در جفت‌های کم‌معامله، تأثیر قیمتی می‌تواند حتی برای اندازه‌های معامله متوسط قابل‌توجه باشد.",
    ],
    faq: [
      {
        question: "آیا این اپلیکیشن علاوه بر کارمزد پنکیک‌سواپ، کارمزد اضافه می‌گیرد؟",
        answer: "خیر. فقط کارمزد معاملاتی استخر خود پنکیک‌سواپ اعمال می‌شود؛ این اپلیکیشن هیچ کارمزد اضافه‌ای اضافه نمی‌کند.",
      },
    ],
  },
  uniswap: {
    title: "یونی‌سواپ",
    summary: "پروتکل AMM که مدل بازارساز حاصل‌ضرب ثابت را رایج کرد، که اکنون چندین زنجیره را در بر می‌گیرد.",
    workflow: [
      { title: "انتخاب استخر", description: "استخرهای یونی‌سواپ نسخه ۳ به بعد بر اساس سطح کارمزد (مثلاً ۰.۰۵٪، ۰.۳٪، ۱٪) برای یک جفت یکسان تقسیم می‌شوند." },
      { title: "نقدینگی متمرکز", description: "از نسخه ۳ به بعد، تأمین‌کنندگان نقدینگی می‌توانند وجوه را در یک بازه قیمتی به‌جای بازه کامل صفر تا بی‌نهایت متمرکز کنند." },
      { title: "مسیریابی", description: "یک روتر (یا تجمیع‌کننده) بهترین مسیر را پیدا می‌کند، احتمالاً در چندین استخر و سطح کارمزد." },
      { title: "تبدیل", description: "معامله به‌صورت اتمی در برابر استخر(های) انتخاب‌شده اجرا می‌شود." },
    ],
    explanation: [
      "این داشبورد به‌طور مستقیم با یونی‌سواپ یکپارچه نیست (بر پایه BNB Smart Chain و پنکیک‌سواپ ساخته شده) - این صفحه فقط مطلب مرجع است، برای درک کلی AMM‌ها مفید است چون طراحی یونی‌سواپ الگویی است که بیشتر بقیه (از جمله پنکیک‌سواپ) بر اساس آن ساخته شده‌اند.",
    ],
    faq: [
      {
        question: "آیا می‌توانم استخرهای یونی‌سواپ را از این اپلیکیشن معامله کنم؟",
        answer: "خیر - صفحه تبدیل اینجا فقط به پنکیک‌سواپ روی BNB Smart Chain متصل است.",
      },
    ],
  },
  "smart-contracts": {
    title: "ریسک قرارداد هوشمند",
    summary: "چرا تعامل با هر قرارداد هوشمند - از جمله همین یکی - ریسک فنی ذاتی دارد.",
    workflow: [
      { title: "کد، کتاب قوانین است", description: "بایت‌کد مستقر شده یک قرارداد هوشمند - نه هیچ ادعای بازاریابی - دقیقاً تعیین می‌کند چه اتفاقی می‌تواند برای وجوه ارسال‌شده به آن بیفتد." },
      { title: "تغییرناپذیری", description: "بیشتر قراردادها پس از استقرار قابل تغییر نیستند مگر اینکه توسعه‌دهنده مکانیزم ارتقایی مشخصاً ساخته باشد، که خود یک فرض اعتماد است." },
      { title: "ممیزی‌ها ریسک را کاهش می‌دهند، حذف نمی‌کنند", description: "یک ممیزی شخص ثالث کد را برای الگوهای شناخته‌شده باگ بررسی می‌کند، اما نمی‌تواند عدم وجود همه باگ‌ها یا رفتار مخرب را تضمین کند." },
      { title: "تأیید خودتان", description: "خواندن ABI مستقر شده (همان‌طور که این اپلیکیشن انجام می‌دهد) دقیقاً می‌گوید چه توابعی وجود دارند و چه چیزی می‌پذیرند - نمی‌گوید چه چیزی را تضمین می‌کنند." },
    ],
    explanation: [
      "این اپلیکیشن فقط توابع تعریف‌شده در ABI خود قرارداد پنجره راند را فراخوانی می‌کند، و هرگز چیزی درباره رفتار یا قابل‌اعتماد بودن قرارداد فراتر از آنچه مستقیماً روی زنجیره قابل‌مشاهده است ادعا نمی‌کند.",
      "هرکسی که با هر قرارداد هوشمندی - از جمله همانی که این داشبورد برایش ساخته شده - تعامل می‌کند، باید به‌طور مستقل کد منبع قرارداد و هر ممیزی موجود را بررسی کند و بداند که بررسی‌های مجوز روی زنجیره (مانند توابع مخصوص مدیر) توسط خود قرارداد اجرا می‌شوند، نه توسط هیچ فرانت‌اندی.",
    ],
    faq: [
      {
        question: "آیا قراردادی که این اپلیکیشن با آن صحبت می‌کند ممیزی شده است؟",
        answer: "این اپلیکیشن به گزارش ممیزی برای قرارداد پنجره راند دسترسی ندارد. همیشه قبل از ارسال وجوه، کد منبع قرارداد و هر سابقه ممیزی را به‌طور مستقل بررسی کنید.",
      },
    ],
  },
  "wallet-security": {
    title: "امنیت کیف‌پول",
    summary: "عادت‌های عملی برای ایمن نگه‌داشتن یک کیف‌پول خودگردان هنگام استفاده از اپلیکیشن‌های وب۳.",
    workflow: [
      { title: "عبارت بازیابی آفلاین", description: "عبارت بازیابی شما هرگز نباید در یک وب‌سایت، چت یا ایمیل تایپ شود - فقط در خود اپلیکیشن کیف‌پول." },
      { title: "قبل از امضا تأیید کنید", description: "قبل از تأیید در کیف‌پول خود، بخوانید یک تراکنش دقیقاً چه کاری انجام می‌دهد (کدام قرارداد، کدام تابع، چقدر ارزش)." },
      { title: "محدود کردن مجوزها", description: "مجوزهای توکن به یک قرارداد اجازه می‌دهند توکن‌های شما را جابه‌جا کند - مجوزهای استفاده‌نشده را دوره‌ای بررسی و لغو کنید." },
      { title: "استفاده از کیف‌پول تازه برای آزمایش", description: "هنگام امتحان یک قرارداد ناآشنا، از کیف‌پولی استفاده کنید که فقط وجوهی را دارد که حاضرید ریسک کنید." },
    ],
    explanation: [
      "هر عملی که این اپلیکیشن می‌تواند انجام دهد محدود به چیزی است که کیف‌پول شما صراحتاً تأیید می‌کند - نمی‌تواند بدون امضای شما وجوه را جابه‌جا کند، و هرگز عبارت بازیابی شما را نمی‌خواهد.",
      "بزرگ‌ترین عامل ضررهای خودگردانی، باگ‌های قرارداد هوشمند نیست بلکه فیشینگ است: سایت‌های جعلی، عوامل پشتیبانی جعلی، و لینک‌های مخرب که افراد را فریب می‌دهند چیزی را که قصدش را نداشتند تأیید کنند.",
    ],
    faq: [
      {
        question: "آیا این اپلیکیشن هرگز عبارت بازیابی یا کلید خصوصی من را می‌خواهد؟",
        answer: "خیر، هرگز. هیچ اپلیکیشن وب۳ واقعی به آن نیاز ندارد - اتصالات کیف‌پول از افزونه مرورگر شما یا WalletConnect استفاده می‌کنند، که هرگز کلید خصوصی شما را به سایت افشا نمی‌کند.",
      },
    ],
  },
};

export function getLocalizedTopics(locale: "en" | "fa" = "en"): LearningTopic[] {
  if (locale !== "fa") return LEARNING_TOPICS;
  return LEARNING_TOPICS.map((topic) => ({
    ...topic,
    ...(LEARNING_TOPICS_FA[topic.slug] ?? {}),
  }));
}

export function getTopic(slug: string, locale: "en" | "fa" = "en") {
  return getLocalizedTopics(locale).find((t) => t.slug === slug);
}
