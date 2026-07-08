import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { VoteShutdownCard } from "@/components/forms/vote-shutdown-card";
import { TerminateAccountCard } from "@/components/forms/terminate-account-card";
import { ResetWalletForm } from "@/components/forms/reset-wallet-form";

export default function AccountActionsPage() {
  return (
    <div>
      <PageHeader title="Account Actions" description="Voting, termination and wallet reset for your account." />
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
