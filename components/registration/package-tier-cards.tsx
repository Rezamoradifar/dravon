"use client";

import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { CheckCircle2, Sparkles, Lock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PACKAGE_TIERS, tierCostUsd } from "@/lib/packages";
import { useEntranceCap } from "@/hooks/useEntranceCap";

export interface TierStatus {
  valid: boolean;
  reason?: string;
}

function TierCard({
  entrance,
  name,
  index,
  selected,
  onSelect,
  status,
}: {
  entrance: number;
  name: string;
  index: number;
  selected: boolean;
  onSelect: () => void;
  status: TierStatus;
}) {
  const { cap, isLoading } = useEntranceCap(entrance);
  const disabled = !status.valid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <Card
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onSelect()}
        onKeyDown={(e) => !disabled && e.key === "Enter" && onSelect()}
        className={cn(
          "card-glow relative overflow-hidden transition-all",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:-translate-y-0.5",
          selected && "ring-2 ring-primary",
        )}
      >
        {entrance === 50 && !disabled && (
          <span className="absolute right-3 top-3 z-10">
            <Badge className="gap-1">
              <Sparkles className="h-3 w-3" /> Popular
            </Badge>
          </span>
        )}
        <CardContent className="space-y-3 p-5">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-3xl font-bold">
            ${tierCostUsd(entrance).toFixed(2)}
            <span className="text-sm font-normal text-muted-foreground"> USDT</span>
          </p>
          <p className="text-xs text-muted-foreground">Start box #{entrance}</p>
          <div className="rounded-lg border bg-muted/30 p-2 text-xs">
            <span className="text-muted-foreground">Earnable cap (entranceCap): </span>
            {isLoading ? (
              <Skeleton className="mt-1 inline-block h-4 w-16 align-middle" />
            ) : (
              <span className="font-mono">{cap !== undefined ? `$${formatUnits(cap, 18)}` : "-"}</span>
            )}
          </div>
          {disabled && status.reason && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> {status.reason}
            </p>
          )}
          <Button
            type="button"
            variant={selected ? "default" : "outline"}
            className="w-full gap-1.5"
            disabled={disabled}
            onClick={onSelect}
          >
            {selected && <CheckCircle2 className="h-4 w-4" />}
            {selected ? "Selected" : disabled ? "Not available" : "Select this package"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PackageTierCards({
  selectedEntrance,
  onSelect,
  getStatus,
}: {
  selectedEntrance: number | undefined;
  onSelect: (entrance: number) => void;
  getStatus?: (entrance: number) => TierStatus;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {PACKAGE_TIERS.map((tier, i) => (
        <TierCard
          key={tier.entrance}
          entrance={tier.entrance}
          name={tier.name}
          index={i}
          selected={selectedEntrance === tier.entrance}
          onSelect={() => onSelect(tier.entrance)}
          status={getStatus ? getStatus(tier.entrance) : { valid: true }}
        />
      ))}
    </div>
  );
}
