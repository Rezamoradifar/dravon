"use client";

import { Dice5, RotateCcw, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiceTray } from "./dice";
import type { GameMode, GameState } from "@/lib/backgammon/types";
import { useTranslation } from "@/contexts/language-context";

export function GameControls({
  mode,
  state,
  canRoll,
  isAiTurn,
  message,
  soundEnabled,
  onModeChange,
  onRoll,
  onNewGame,
  onToggleSound,
}: {
  mode: GameMode;
  state: GameState;
  canRoll: boolean;
  isAiTurn: boolean;
  message: string | null;
  soundEnabled: boolean;
  onModeChange: (mode: GameMode) => void;
  onRoll: () => void;
  onNewGame: () => void;
  onToggleSound: () => void;
}) {
  const { t } = useTranslation();

  const turnLabel = (() => {
    if (state.winner) {
      if (mode === "ai") return state.winner === "white" ? t("backgammon.winnerYou") : t("backgammon.winnerAi");
      return state.winner === "white" ? t("backgammon.winnerWhite") : t("backgammon.winnerBlack");
    }
    if (isAiTurn) return t("backgammon.aiTurn");
    if (mode === "local") {
      return state.turn === "white" ? t("backgammon.localTurnWhite") : t("backgammon.localTurnBlack");
    }
    return t("backgammon.yourTurn");
  })();

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={mode} onValueChange={(v) => onModeChange(v as GameMode)}>
          <TabsList>
            <TabsTrigger value="ai">{t("backgammon.modeAi")}</TabsTrigger>
            <TabsTrigger value="local">{t("backgammon.modeLocal")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onToggleSound}
            aria-label={soundEnabled ? t("backgammon.soundOn") : t("backgammon.soundOff")}
            title={soundEnabled ? t("backgammon.soundOn") : t("backgammon.soundOff")}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onNewGame}>
            <RotateCcw className="h-3.5 w-3.5" />
            {t("backgammon.newGame")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">{turnLabel}</p>
          {message === "noMoves" && !state.winner && (
            <p className="text-xs text-destructive">{t("backgammon.noMoves")}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <DiceTray lastRoll={state.lastRoll} remaining={state.dice} />
          <Button size="sm" className="gap-1.5" disabled={!canRoll} onClick={onRoll}>
            <Dice5 className="h-4 w-4" />
            {t("backgammon.roll")}
          </Button>
        </div>
      </div>
    </div>
  );
}
