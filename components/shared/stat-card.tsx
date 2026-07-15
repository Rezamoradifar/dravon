"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  hint,
  index = 0,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  loading?: boolean;
  hint?: string;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Card className={cn("card-glow h-full", className)}>
        <CardContent className="flex items-start justify-between gap-4 p-5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-7 w-24" />
            ) : (
              <p className="mt-1 truncate text-xl font-semibold tabular-nums">{value}</p>
            )}
            {hint && !loading && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
            )}
          </div>
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
