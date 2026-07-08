"use client";

import { motion } from "framer-motion";
import { UserPlus, Wallet, Gift, RotateCw, KeyRound, ShieldOff } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { ContractActionCard, type ActionField } from "@/components/actions/contract-action-card";

const UINT24_MAX = 16_777_215;

const ACTIONS: Array<{
  functionName: Parameters<typeof ContractActionCard>[0]["functionName"];
  signature: string;
  title: string;
  description: string;
  icon: typeof UserPlus;
  fields: ActionField[];
  payable?: boolean;
  confirm?: { title: string; description: string; confirmLabel: string };
}> = [
  {
    functionName: "begin",
    signature: "begin(uint24,address,address)",
    title: "Begin",
    description: "Join the current round window by registering a start box with a direct and referral sponsor.",
    icon: UserPlus,
    payable: true,
    fields: [
      { key: "startBox", label: "Start Box", type: "uint", max: UINT24_MAX, placeholder: "0" },
      { key: "direct", label: "Direct Sponsor", type: "address", placeholder: "0x..." },
      { key: "referral", label: "Referral Sponsor", type: "address", placeholder: "0x..." },
    ],
  },
  {
    functionName: "chargeAccount",
    signature: "chargeAccount(uint24)",
    title: "Charge Account",
    description: "Top up an existing box in the round window.",
    icon: Wallet,
    payable: true,
    fields: [{ key: "targetBox", label: "Target Box", type: "uint", max: UINT24_MAX, placeholder: "0" }],
  },
  {
    functionName: "distributeMatchingBonuses",
    signature: "distributeMatchingBonuses(uint256,bool)",
    title: "Distribute Matching Bonuses",
    description: "Process matching bonus distribution for a batch of nodes.",
    icon: Gift,
    fields: [
      { key: "nodes", label: "Nodes", type: "uint", placeholder: "Number of nodes to process" },
      { key: "devPool", label: "Dev Pool", type: "bool" },
    ],
  },
  {
    functionName: "init",
    signature: "init(uint256)",
    title: "Init Round",
    description: "Initialize a round on the window contract.",
    icon: RotateCw,
    fields: [{ key: "round", label: "Round", type: "uint", placeholder: "Round id" }],
    confirm: {
      title: "Initialize this round?",
      description: "This is an admin-critical action that initializes round state on-chain.",
      confirmLabel: "Init Round",
    },
  },
  {
    functionName: "resetWalletAddress",
    signature: "resetWalletAddress(address)",
    title: "Reset Wallet Address",
    description: "Move your account to a new wallet address.",
    icon: KeyRound,
    fields: [{ key: "newAddr", label: "New Wallet Address", type: "address", placeholder: "0x..." }],
    confirm: {
      title: "Reset your wallet address?",
      description: "Your account will be moved to the new address you entered. This cannot be undone.",
      confirmLabel: "Reset Wallet",
    },
  },
  {
    functionName: "terminateAccount",
    signature: "terminateAccount()",
    title: "Terminate Account",
    description: "Permanently terminate your account in this round window.",
    icon: ShieldOff,
    fields: [],
    confirm: {
      title: "Terminate your account?",
      description: "This is irreversible. Your account in this round window will be permanently terminated.",
      confirmLabel: "Terminate",
    },
  },
];

export default function ContractActionsPage() {
  return (
    <div>
      <PageHeader
        title="Contract Actions"
        description="Every write function on the round window contract, in one console - parameters, gas estimate, and live transaction status."
      />
      <NetworkBanner />

      <ConnectWalletGuard>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {ACTIONS.map((action, i) => (
            <motion.div
              key={action.functionName}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <ContractActionCard {...action} />
            </motion.div>
          ))}
        </div>
      </ConnectWalletGuard>
    </div>
  );
}
