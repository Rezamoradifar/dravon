"use client";

import { motion } from "framer-motion";
import { X, CheckCircle2, XCircle, Users } from "lucide-react";
import type { Address } from "viem";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddressPill } from "@/components/shared/address-pill";
import { useUserRegistration } from "@/hooks/useUserRegistration";
import { useTranslation } from "@/contexts/language-context";

export function NodeDetailPanel({
  address,
  memberCount,
  onClose,
}: {
  address: Address;
  memberCount: number;
  onClose: () => void;
}) {
  const { isRegistered, currentEntrance, isLoading } = useUserRegistration(address);
  const { t } = useTranslation();

  return (
    <motion.div
      key={address}
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
    >
    <Card className="card-glow">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-base">{t("nodeDetailPanel.title")}</CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label={t("nodeDetailPanel.close")}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("nodeDetailPanel.address")}</span>
          <AddressPill address={address} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("nodeDetailPanel.status")}</span>
          {isLoading ? (
            <span className="text-muted-foreground">{t("nodeDetailPanel.loading")}</span>
          ) : isRegistered ? (
            <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("nodeDetailPanel.active")}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 border-muted-foreground/40 text-muted-foreground">
              <XCircle className="h-3.5 w-3.5" />
              {t("nodeDetailPanel.inactive")}
            </Badge>
          )}
        </div>

        {isRegistered && currentEntrance !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("nodeDetailPanel.entranceTier")}</span>
            <span className="font-medium">{currentEntrance}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("nodeDetailPanel.subordinates")}</span>
          <span className="inline-flex items-center gap-1 font-medium">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            {memberCount}
          </span>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
