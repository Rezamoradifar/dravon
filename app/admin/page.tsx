"use client";

import { ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { Card, CardContent } from "@/components/ui/card";
import { MatchingBonusForm } from "@/components/admin/matching-bonus-form";
import { InitRoundForm } from "@/components/admin/init-round-form";
import { NetworkGrowthChart } from "@/components/dashboard/network-growth-chart";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { UserLookupPanel } from "@/components/admin/user-lookup-panel";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useTranslation } from "@/contexts/language-context";

export default function AdminPage() {
  const isAdmin = useIsAdmin();
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("adminPage.title")}
        description={t("adminPage.description")}
        actions={isAdmin ? <ExportCsvButton /> : undefined}
      />
      <NetworkBanner />
      <ConnectWalletGuard>
        {isAdmin ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <MatchingBonusForm />
              <InitRoundForm />
            </div>
            <NetworkGrowthChart />
            <UserLookupPanel />
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <ShieldAlert className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">{t("adminPage.notAuthorized")}</p>
              <p className="max-w-sm text-sm text-muted-foreground">{t("adminPage.notAuthorizedBody")}</p>
            </CardContent>
          </Card>
        )}
      </ConnectWalletGuard>
    </div>
  );
}
