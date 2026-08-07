"use client";

import { PageHeader } from "@/components/shared/page-header";
import { WalletSearch } from "@/components/user/wallet-search";
import { UserDashboardCards } from "@/components/user/user-dashboard-cards";
import { WeeklyWindowCard } from "@/components/shared/weekly-window-card";
import { ReferralStreakBadge } from "@/components/genealogy/referral-streak-badge";
import { AddressAvatar } from "@/components/shared/address-avatar";
import { AddressPill } from "@/components/shared/address-pill";
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
        {viewedAddress && (
          <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
            <AddressAvatar address={viewedAddress} size={44} />
            <AddressPill address={viewedAddress} chars={6} />
          </div>
        )}
      </div>
      <UserDashboardCards address={viewedAddress} />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyWindowCard address={viewedAddress} />
        <ReferralStreakBadge address={viewedAddress} />
      </div>
    </div>
  );
}
