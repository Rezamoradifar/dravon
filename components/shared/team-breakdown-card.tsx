"use client";

import type { Address } from "viem";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamBreakdown } from "@/hooks/useTeamBreakdown";
import { useTranslation } from "@/contexts/language-context";

/**
 * Left/right here mean the contract's binary tree slots (getUserTree index 1
 * vs 2), not screen direction - so no directional arrow icons, since those
 * would visually mislead under RTL where grid order flips.
 */

export function TeamBreakdownCard({ address }: { address?: Address }) {
  const { leftCount, rightCount, isLoading } = useTeamBreakdown(address);
  const { t } = useTranslation();

  if (!address) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="card-glow h-full">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Users className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">{t("teamBreakdown.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("teamBreakdown.left")}
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <p className="mt-1 text-xl font-semibold">{leftCount}</p>
              )}
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("teamBreakdown.right")}
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <p className="mt-1 text-xl font-semibold">{rightCount}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t("teamBreakdown.hint")}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
