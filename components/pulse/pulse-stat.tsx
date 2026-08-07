"use client";

import type { LucideIcon } from "lucide-react";

import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

export function PulseStat({
  label,
  value,
  prefix = "",
  suffix = "",
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  accent?: "primary" | "accent-2";
}) {
  const animated = useCountUp(value);
  const display = Number.isInteger(value)
    ? Math.round(animated).toLocaleString("en-US")
    : animated.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 text-center backdrop-blur-sm">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-[0.15] blur-2xl",
          accent === "primary" ? "bg-primary" : "bg-[hsl(var(--accent-2))]",
        )}
      />
      <Icon
        className={cn(
          "relative mx-auto mb-3 h-6 w-6",
          accent === "primary" ? "text-primary" : "text-[hsl(var(--accent-2))]",
        )}
      />
      <div
        className={cn(
          "relative font-mono text-4xl font-bold tabular-nums tracking-tight md:text-5xl",
          accent === "primary" ? "text-primary" : "text-[hsl(var(--accent-2))]",
        )}
      >
        {prefix}
        {display}
        {suffix}
      </div>
      <p className="relative mt-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
