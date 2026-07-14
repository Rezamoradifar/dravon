"use client";

import { motion } from "framer-motion";
import { UserPlus, Wallet, Gift, RotateCw, KeyRound, ShieldOff } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { ContractActionCard, type ActionField } from "@/components/actions/contract-action-card";
import { useTranslation } from "@/contexts/language-context";

const UINT24_MAX = 16_777_215;

function useActions(): Array<{
  functionName: Parameters<typeof ContractActionCard>[0]["functionName"];
  signature: string;
  title: string;
  description: string;
  icon: typeof UserPlus;
  fields: ActionField[];
  payable?: boolean;
  confirm?: { title: string; description: string; confirmLabel: string };
}> {
  const { t } = useTranslation();
  return [
    {
      functionName: "begin",
      signature: "begin(uint24,address,address)",
      title: t("contractActionsPage.begin.title"),
      description: t("contractActionsPage.begin.description"),
      icon: UserPlus,
      payable: true,
      fields: [
        { key: "startBox", label: t("contractActionsPage.begin.startBox"), type: "uint", max: UINT24_MAX, placeholder: "0" },
        { key: "direct", label: t("contractActionsPage.begin.directSponsor"), type: "address", placeholder: "0x..." },
        { key: "referral", label: t("contractActionsPage.begin.referralSponsor"), type: "address", placeholder: "0x..." },
      ],
    },
    {
      functionName: "chargeAccount",
      signature: "chargeAccount(uint24)",
      title: t("contractActionsPage.chargeAccount.title"),
      description: t("contractActionsPage.chargeAccount.description"),
      icon: Wallet,
      payable: true,
      fields: [{ key: "targetBox", label: t("contractActionsPage.chargeAccount.targetBox"), type: "uint", max: UINT24_MAX, placeholder: "0" }],
    },
    {
      functionName: "distributeMatchingBonuses",
      signature: "distributeMatchingBonuses(uint256,bool)",
      title: t("contractActionsPage.distributeMatchingBonuses.title"),
      description: t("contractActionsPage.distributeMatchingBonuses.description"),
      icon: Gift,
      fields: [
        { key: "nodes", label: t("contractActionsPage.distributeMatchingBonuses.nodes"), type: "uint", placeholder: t("contractActionsPage.distributeMatchingBonuses.nodesPlaceholder") },
        { key: "devPool", label: t("contractActionsPage.distributeMatchingBonuses.devPool"), type: "bool" },
      ],
    },
    {
      functionName: "init",
      signature: "init(uint256)",
      title: t("contractActionsPage.init.title"),
      description: t("contractActionsPage.init.description"),
      icon: RotateCw,
      fields: [{ key: "round", label: t("contractActionsPage.init.round"), type: "uint", placeholder: t("contractActionsPage.init.roundPlaceholder") }],
      confirm: {
        title: t("contractActionsPage.init.confirmTitle"),
        description: t("contractActionsPage.init.confirmDescription"),
        confirmLabel: t("contractActionsPage.init.confirmLabel"),
      },
    },
    {
      functionName: "resetWalletAddress",
      signature: "resetWalletAddress(address)",
      title: t("contractActionsPage.resetWalletAddress.title"),
      description: t("contractActionsPage.resetWalletAddress.description"),
      icon: KeyRound,
      fields: [{ key: "newAddr", label: t("contractActionsPage.resetWalletAddress.newAddr"), type: "address", placeholder: "0x..." }],
      confirm: {
        title: t("contractActionsPage.resetWalletAddress.confirmTitle"),
        description: t("contractActionsPage.resetWalletAddress.confirmDescription"),
        confirmLabel: t("contractActionsPage.resetWalletAddress.confirmLabel"),
      },
    },
    {
      functionName: "terminateAccount",
      signature: "terminateAccount()",
      title: t("contractActionsPage.terminateAccount.title"),
      description: t("contractActionsPage.terminateAccount.description"),
      icon: ShieldOff,
      fields: [],
      confirm: {
        title: t("contractActionsPage.terminateAccount.confirmTitle"),
        description: t("contractActionsPage.terminateAccount.confirmDescription"),
        confirmLabel: t("contractActionsPage.terminateAccount.confirmLabel"),
      },
    },
  ];
}

export default function ContractActionsPage() {
  const { t } = useTranslation();
  const actions = useActions();

  return (
    <div>
      <PageHeader
        title={t("contractActionsPage.title")}
        description={t("contractActionsPage.description")}
      />
      <NetworkBanner />

      <ConnectWalletGuard>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {actions.map((action, i) => (
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
