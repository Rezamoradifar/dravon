"use client";

import { WorkspaceHero } from "@/components/experience/workspace-hero";
import { QuickActions } from "@/components/experience/quick-actions";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { VoteShutdownCard } from "@/components/forms/vote-shutdown-card";
import { TerminateAccountCard } from "@/components/forms/terminate-account-card";
import { ResetWalletForm } from "@/components/forms/reset-wallet-form";
import { PreferencesCard } from "@/components/account/preferences-card";

export default function AccountActionsPage() {
  return (
    <div>
      <WorkspaceHero kind="account" />
      <QuickActions />
      <NetworkBanner />

      <div className="mb-4">
        <PreferencesCard />
      </div>

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
