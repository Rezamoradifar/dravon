import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <div>
      <PageHeader title="Register" description="Join the current round window." />
      <NetworkBanner />
      <ConnectWalletGuard>
        <div className="max-w-xl">
          <RegisterForm />
        </div>
      </ConnectWalletGuard>
    </div>
  );
}
