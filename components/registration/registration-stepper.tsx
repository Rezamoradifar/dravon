"use client";

import { Check, Wallet2, Network, UserCheck, PenLine, Loader2, PartyPopper } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

export type RegistrationStep = "connect" | "network" | "referrer" | "confirm" | "pending" | "success";

const STEPS: { key: RegistrationStep; icon: typeof Wallet2 }[] = [
  { key: "connect", icon: Wallet2 },
  { key: "network", icon: Network },
  { key: "referrer", icon: UserCheck },
  { key: "confirm", icon: PenLine },
  { key: "pending", icon: Loader2 },
  { key: "success", icon: PartyPopper },
];

export function RegistrationStepper({ current }: { current: RegistrationStep }) {
  const { t } = useTranslation();
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex shrink-0 items-center gap-1">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors",
                isDone && "border-success bg-success/10 text-success",
                isActive && !isDone && "border-primary bg-primary/10 text-primary",
                !isDone && !isActive && "border-border bg-muted/30 text-muted-foreground",
              )}
              title={t(`registrationStepper.${step.key}`)}
            >
              {isDone ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className={cn("h-4 w-4", isActive && step.key === "pending" && "animate-spin")} />
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 w-4 shrink-0 sm:w-8", isDone ? "bg-success" : "bg-border")} />
            )}
          </div>
        );
      })}
      <span className="ms-2 shrink-0 text-xs font-medium text-muted-foreground sm:text-sm">
        {t(`registrationStepper.${current}`)}
      </span>
    </div>
  );
}
