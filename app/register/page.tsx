"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { RegisterForm } from "@/components/forms/register-form";
import { PackageTierCards } from "@/components/registration/package-tier-cards";
import { PriceTicker } from "@/components/shared/price-ticker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRegistration } from "@/hooks/useUserRegistration";
import { useTranslation } from "@/contexts/language-context";

function AlreadyRegisteredNotice() {
  const { t } = useTranslation();
  return (
    <Card className="card-glow">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-medium">{t("registerPage.alreadyRegisteredTitle")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("registerPage.alreadyRegisteredBody")}</p>
        <Button asChild className="gap-1.5">
          <Link href="/charge">
            {t("registerPage.goToCharge")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref");
  const initialDirect = refParam && isAddress(refParam) ? refParam : undefined;

  const { address } = useAccount();
  const { isRegistered, isLoading } = useUserRegistration(address);
  const [selectedEntrance, setSelectedEntrance] = React.useState<number | undefined>(undefined);
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t("registerPage.title")} description={t("registerPage.description")} />
      <NetworkBanner />

      <div className="mb-6">
        <PriceTicker />
      </div>

      <ConnectWalletGuard>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : isRegistered ? (
          <AlreadyRegisteredNotice />
        ) : (
          <div className="space-y-6">
            <PackageTierCards selectedEntrance={selectedEntrance} onSelect={setSelectedEntrance} />
            <div className="max-w-xl">
              <RegisterForm entrance={selectedEntrance} initialDirect={initialDirect} />
            </div>
          </div>
        )}
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
