import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { ChargeAccountForm } from "@/components/forms/charge-account-form";

export default function ChargeAccountPage() {
  return (
    <div>
      <PageHeader title="Charge Account" description="Top up an existing box in the round." />
      <NetworkBanner />
      <ConnectWalletGuard>
        <div className="max-w-xl">
          <ChargeAccountForm />
        </div>
      </ConnectWalletGuard>
    </div>
  );
}
