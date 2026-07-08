"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { isAddress } from "viem";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { RegisterForm } from "@/components/forms/register-form";
import { PackagePresets } from "@/components/forms/package-presets";
import { PriceTicker } from "@/components/shared/price-ticker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSavedPresets, type RegisterPreset } from "@/hooks/useSavedPresets";

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref");
  const initialDirect = refParam && isAddress(refParam) ? refParam : undefined;

  const { presets, save, hydrated } = useSavedPresets();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [appliedPreset, setAppliedPreset] = React.useState<(RegisterPreset & { appliedAt: number }) | null>(
    null,
  );

  return (
    <div>
      <PageHeader title="Register" description="Join the current round window." />
      <NetworkBanner />

      {initialDirect && (
        <Alert className="mb-6">
          <AlertDescription>
            Referral link applied - direct sponsor pre-filled from your link.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <PriceTicker />
      </div>

      <ConnectWalletGuard>
        <div className="space-y-6">
          {hydrated && (
            <PackagePresets
              presets={presets}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              onApply={(preset) => setAppliedPreset({ ...preset, appliedAt: Date.now() })}
              onRename={(index, name) => save(index, { ...presets[index], name })}
            />
          )}

          <div className="max-w-xl">
            <RegisterForm
              appliedPreset={appliedPreset}
              initialDirect={initialDirect}
              onSavePreset={(fields) =>
                save(selectedIndex, { ...presets[selectedIndex], ...fields })
              }
            />
          </div>
        </div>
      </ConnectWalletGuard>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  );
}
