"use client";

import { ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { Card, CardContent } from "@/components/ui/card";
import { MatchingBonusForm } from "@/components/admin/matching-bonus-form";
import { InitRoundForm } from "@/components/admin/init-round-form";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export default function AdminPage() {
  const isAdmin = useIsAdmin();

  return (
    <div>
      <PageHeader
        title="Admin Panel"
        description="Owner-only actions: distribute matching bonuses and initialize rounds."
      />
      <NetworkBanner />
      <ConnectWalletGuard>
        {isAdmin ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MatchingBonusForm />
            <InitRoundForm />
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <ShieldAlert className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">You are not authorized to view this page</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                This panel is only shown to the configured admin wallet
                (NEXT_PUBLIC_ADMIN_ADDRESS). The contract itself enforces the real
                permission check for these calls.
              </p>
            </CardContent>
          </Card>
        )}
      </ConnectWalletGuard>
    </div>
  );
}
