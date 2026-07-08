export interface HelpFaqItem {
  question: string;
  answer: string;
}

export const HELP_FAQ: HelpFaqItem[] = [
  {
    question: "Do I need an account or password?",
    answer: "No. Connecting your wallet is your login - there's no separate username/password.",
  },
  {
    question: "Which networks are supported?",
    answer:
      "The contract lives on BNB Smart Chain. The wallet connector supports switching networks, but all contract actions require BNB Smart Chain.",
  },
  {
    question: "Why can't I select a custom amount when registering?",
    answer:
      "The contract only accepts three fixed packages (10/50/100, i.e. $11/$55/$110). Any other amount is rejected on-chain.",
  },
  {
    question: "I sent BNB but got some of it back - is that a bug?",
    answer:
      "No. Paying with BNB sends slightly more than needed as a buffer; the contract swaps only the exact USDT amount required and automatically refunds the rest.",
  },
  {
    question: "Why is my Top-Up option greyed out?",
    answer:
      "You can only top up to a strictly higher package than your current one (except a $110 renewal, which has its own cap). The page shows the reason under any disabled option.",
  },
  {
    question: "Where do I see my earnings?",
    answer:
      "On the Profile / My Dashboard page - Direct Earned, Binary Earned, and Earnable are shown there and update as the contract processes payouts.",
  },
  {
    question: "How do I withdraw my earnings?",
    answer: "You don't need to - earnings are sent to your wallet automatically. See the Withdrawal Guide section.",
  },
  {
    question: "Is the Swap page connected to real funds?",
    answer: "Yes. Unlike the Learning Center, Swap executes real trades with real funds via PancakeSwap.",
  },
  {
    question: "Is the Learning Center Simulator using real money?",
    answer: "No. Every number there is a manual input you control; no wallet or transaction is involved.",
  },
  {
    question: "Can I change my registered wallet address?",
    answer: "Yes, via Reset Wallet Address on the Account Actions page. This is permanent once confirmed.",
  },
  {
    question: "What happens if I terminate my account?",
    answer:
      "It's permanent for this round window. Any eligible insurance/assurance balance is paid out to your wallet at that moment.",
  },
  {
    question: "Why did my transaction revert?",
    answer: "See the Troubleshooting table below for the most common on-chain error messages and what they mean.",
  },
];

export interface TroubleshootingRow {
  symptom: string;
  cause: string;
  fix: string;
}

export const TROUBLESHOOTING: TroubleshootingRow[] = [
  {
    symptom: '"Connect Wallet" does nothing',
    cause: "Wallet extension not installed / blocked pop-up",
    fix: "Install MetaMask/Trust Wallet or allow the connection pop-up",
  },
  {
    symptom: '"Switch network" banner won\'t go away',
    cause: "Wallet still on the wrong chain",
    fix: "Click the banner, approve the network switch in your wallet",
  },
  {
    symptom: 'Transaction stuck on "Awaiting signature"',
    cause: "Wallet pop-up hidden behind another window, or dismissed",
    fix: "Check your wallet extension/app for a pending request",
  },
  {
    symptom: "InvalidStartBox error",
    cause: "Trying to register/top-up with a value other than the three valid packages",
    fix: "Only use the package cards shown on Register/Charge Account",
  },
  {
    symptom: "InsufficientPayment error",
    cause: "Sent too little BNB, or USDT allowance too low",
    fix: "Increase the BNB amount, or approve a sufficient USDT allowance",
  },
  {
    symptom: "UserNotFound error",
    cause: "Action requires a registered wallet, but this one isn't registered",
    fix: "Register first",
  },
  {
    symptom: "WindowClosed error",
    cause: "This round window has already closed",
    fix: "Wait for the new round window, or check the Dashboard's newer-window banner",
  },
  {
    symptom: "AlreadyVoted error",
    cause: "You already voted to shut down this round",
    fix: "No action needed - one vote per round is allowed",
  },
  {
    symptom: 'Swap quote shows "No liquidity route"',
    cause: "The selected token pair has no direct pool",
    fix: "Choose a different token pair",
  },
  {
    symptom: "Gas estimate fails silently",
    cause: "Wallet not connected, or invalid inputs",
    fix: "Fill in all required fields correctly, then try again",
  },
];

export interface HelpSection {
  id: string;
  title: string;
}

export const HELP_SECTIONS: HelpSection[] = [
  { id: "wallet-connection", title: "Wallet Connection" },
  { id: "dashboard", title: "Dashboard" },
  { id: "registration", title: "Registration" },
  { id: "deposit", title: "Deposit Guide" },
  { id: "withdrawal", title: "Withdrawal Guide" },
  { id: "profile", title: "Profile" },
  { id: "swap", title: "Swap" },
  { id: "learning-center", title: "Learning Center" },
  { id: "statistics", title: "Statistics" },
  { id: "account-settings", title: "Account Settings" },
  { id: "security", title: "Security" },
  { id: "faq", title: "FAQ" },
  { id: "troubleshooting", title: "Troubleshooting" },
];
