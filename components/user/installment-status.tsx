"use client";
import Link from "next/link";
import { formatUnits, type Address } from "viem";
import { useUserRegistration } from "@/hooks/useUserRegistration";
import { useTranslation } from "@/contexts/language-context";
import { canPayOffInstallment } from "@/lib/contract-v74";
export function InstallmentStatus({ address }: { address?: Address }) {
  const { debt, currentEntrance } = useUserRegistration(address);
  const { t } = useTranslation();
  if (!address || debt === undefined || debt === 0n) return null;
  return <div className="mb-6 space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
    <p>{t("contractV74.debt", { amount: formatUnits(debt, 18) })}</p>
    {canPayOffInstallment(currentEntrance, debt) && <Link className="inline-block underline" href="/charge">{t("contractV74.payoff")}</Link>}
  </div>;
}
