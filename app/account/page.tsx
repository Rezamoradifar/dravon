"use client";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { VoteShutdownCard } from "@/components/forms/vote-shutdown-card";
import { TerminateAccountCard } from "@/components/forms/terminate-account-card";
import { ResetWalletForm } from "@/components/forms/reset-wallet-form";
import { useTranslation } from "@/contexts/language-context";

export default function AccountActionsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t("accountPage.title")} description={t("accountPage.description")} />
      <NetworkBanner />
      <ConnectWalletGuard>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <VoteShutdownCard />
          <ResetWalletForm />
          <TerminateAccountCard />
        </div>
      </ConnectWalletGuard>
    </div>
  );
}
