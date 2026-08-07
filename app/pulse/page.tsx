"use client";

import * as React from "react";
import { Maximize2, Minimize2, Landmark, TrendingUp, Gem, Users, Coins, ShieldCheck } from "lucide-react";
import { formatUnits } from "viem";

import { PulseStat } from "@/components/pulse/pulse-stat";
import { Button } from "@/components/ui/button";
import { useMainBulkInfo } from "@/hooks/useMainBulkInfo";
import { useStageInfo } from "@/hooks/useStageInfo";
import { useWeeklyWindowInfo } from "@/hooks/useWeeklyWindowInfo";
import { useTranslation } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

const STAGE_COLOR: Record<number, string> = {
  1: "text-success border-success/40 bg-success/10",
  2: "text-sky-500 border-sky-500/40 bg-sky-500/10",
  3: "text-amber-500 border-amber-500/40 bg-amber-500/10",
  4: "text-destructive border-destructive/40 bg-destructive/10",
};

function toNumber(value?: string): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

export default function NetworkPulsePage() {
  const { info } = useMainBulkInfo(0);
  const { info: stage } = useStageInfo();
  const { week } = useWeeklyWindowInfo();
  const { t } = useTranslation();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    function onChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  }

  const currentStage = stage?.stage && stage.stage >= 1 && stage.stage <= 4 ? stage.stage : undefined;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl",
        isFullscreen && "flex min-h-screen flex-col justify-center bg-background p-10",
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[420px] w-[420px] animate-pulse rounded-full bg-primary/20 blur-[100px]" />
        <div
          className="absolute bottom-0 right-1/4 h-[420px] w-[420px] animate-pulse rounded-full bg-[hsl(var(--accent-2)/0.15)] blur-[100px]"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-destructive">
              {t("pulsePage.live")}
            </p>
            <h1 className="text-gradient text-3xl font-bold tracking-tight md:text-4xl">
              {t("pulsePage.title")}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentStage && (
            <span
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold",
                STAGE_COLOR[currentStage],
              )}
            >
              {t("pulsePage.stageBadge", {
                stage: String(currentStage),
                label: t(`stageIndicator.stage${currentStage}.label`),
              })}
            </span>
          )}
          <Button variant="outline" size="icon" onClick={toggleFullscreen} aria-label={t("pulsePage.fullscreen")}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <PulseStat
          label={t("pulsePage.totalVolume")}
          value={toNumber(info?.allEnteredUSD)}
          prefix="$"
          icon={Landmark}
          accent="primary"
        />
        <PulseStat
          label={t("pulsePage.roundVolume")}
          value={toNumber(info?.roundEnteredUSD)}
          prefix="$"
          icon={TrendingUp}
          accent="accent-2"
        />
        <PulseStat
          label={t("pulsePage.activeUsers")}
          value={Number(info?.userCount ?? 0n)}
          icon={Users}
          accent="primary"
        />
        <PulseStat
          label={t("pulsePage.roundPoints")}
          value={Number(info?.roundPoints ?? 0n)}
          icon={Gem}
          accent="accent-2"
        />
        <PulseStat
          label={t("pulsePage.weeklyPool")}
          value={week?.pool !== undefined ? Number(formatUnits(week.pool, 18)) : 0}
          prefix="$"
          icon={Coins}
          accent="primary"
        />
        <PulseStat
          label={t("pulsePage.pointValue")}
          value={toNumber(info?.pointValue)}
          prefix="$"
          icon={ShieldCheck}
          accent="accent-2"
        />
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">{t("pulsePage.footnote")}</p>
    </div>
  );
}
