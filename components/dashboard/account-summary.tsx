"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccountReadError } from "@/components/shared/account-read-error";
import { useUserRegistration } from "@/hooks/useUserRegistration";
import { tierByEntrance } from "@/lib/packages";
import { useTranslation } from "@/contexts/language-context";

export function AccountSummary() {
  const { address } = useAccount();
  const account = useUserRegistration(address);
  const { t, locale } = useTranslation();
  const amount = (value?: bigint) => value === undefined ? "—" : Number(formatUnits(value, 18)).toLocaleString(locale, { maximumFractionDigits: 2 });
  return <Card className="card-glow mb-6">
    <CardHeader><CardTitle>{t("improvements.account")}</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {!address ? <p className="text-sm text-muted-foreground">{t("improvements.connected")}</p> : account.isError ? <AccountReadError onRetry={() => { void account.refetch(); }} /> : account.isLoading || account.isRegistered === undefined ? <p role="status">{t("improvements.loading")}</p> : <>
        <p className="font-medium">{t(account.isRegistered ? "improvements.registered" : "improvements.unregistered")}</p>
        {account.isRegistered && <dl className="grid gap-4 sm:grid-cols-3">
          <div><dt className="text-sm text-muted-foreground">{t("improvements.package")}</dt><dd>{tierByEntrance(account.currentEntrance ?? 0)?.name ?? "—"}</dd></div>
          <div><dt className="text-sm text-muted-foreground">{t("improvements.debt")}</dt><dd>{amount(account.debt)}</dd></div>
          <div><dt className="text-sm text-muted-foreground">{t("improvements.remaining")}</dt><dd>{amount(account.periodEarnable)}</dd></div>
        </dl>}
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link href={account.isRegistered ? "/charge" : "/register"}>{t(account.isRegistered ? "improvements.manage" : "improvements.start")}</Link></Button>
          {account.isRegistered && <Button asChild variant="outline"><Link href="/genealogy">{t("improvements.network")}</Link></Button>}
        </div>
      </>}
    </CardContent>
  </Card>;
}
