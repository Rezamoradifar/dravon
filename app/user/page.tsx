"use client";

import { PageHeader } from "@/components/shared/page-header";
import { WalletSearch } from "@/components/user/wallet-search";
import { UserDashboardCards } from "@/components/user/user-dashboard-cards";
import { useWalletView } from "@/context/wallet-view-context";
import { useTranslation } from "@/contexts/language-context";

export default function UserDashboardPage() {
  const { searchedAddress, setSearchedAddress, viewedAddress } = useWalletView();
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t("userPage.title")} description={t("userPage.description")} />
      <div className="mb-6 rounded-xl border bg-card p-4">
        <WalletSearch value={searchedAddress} onChange={setSearchedAddress} />
        <p className="mt-2 text-xs text-muted-foreground">{t("userPage.walletPersists")}</p>
      </div>
      <UserDashboardCards address={viewedAddress} />
    </div>
  );
}
