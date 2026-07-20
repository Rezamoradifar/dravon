"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, PartyPopper } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Board } from "@/components/games/backgammon/board";
import { GameControls } from "@/components/games/backgammon/game-controls";
import { useBackgammon } from "@/hooks/useBackgammon";
import { useBackgammonSound } from "@/hooks/useBackgammonSound";
import { useBackgammonStats } from "@/hooks/useBackgammonStats";
import { fireConfetti } from "@/lib/confetti";
import type { Difficulty, GameMode } from "@/lib/backgammon/types";
import { useTranslation } from "@/contexts/language-context";

const STREAK_THRESHOLDS = [10, 5, 3];
const GAMES_THRESHOLDS = [100, 50, 10];

export default function BackgammonPage() {
  const { t } = useTranslation();
  const [mode, setMode] = React.useState<GameMode>("ai");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("medium");
  const game = useBackgammon(mode, difficulty);
  const sound = useBackgammonSound();
  const { stats, recordGame } = useBackgammonStats();

  const wonBefore = React.useRef(false);
  React.useEffect(() => {
    if (game.state.winner && !wonBefore.current) {
      wonBefore.current = true;
      fireConfetti();
      if (mode === "ai") recordGame(game.state.winner === game.humanPlayer);
    }
    if (!game.state.winner) wonBefore.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.state.winner]);

  function handleModeChange(next: GameMode) {
    setMode(next);
    game.newGame(next);
  }

  const isInteractive =
    !game.state.winner && game.state.hasRolled && !(mode === "ai" && game.isAiTurn);

  const streakBadge = STREAK_THRESHOLDS.find((n) => stats.bestStreak >= n);
  const gamesBadge = GAMES_THRESHOLDS.find((n) => stats.gamesPlayed >= n);

  return (
    <div>
      <PageHeader
        title={t("backgammon.title")}
        description={t("backgammon.description")}
        actions={
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" />
                  {t("backgammon.rulesTitle")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("backgammon.rulesTitle")}</DialogTitle>
                  <DialogDescription className="pt-2 text-left leading-relaxed">
                    {t("backgammon.rulesBody")}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href="/games">
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("backgammon.backToGames")}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        <GameControls
          mode={mode}
          state={game.state}
          canRoll={game.canRoll}
          canUndo={game.canUndo}
          isAiTurn={game.isAiTurn}
          message={game.message}
          soundEnabled={sound.enabled}
          difficulty={difficulty}
          onModeChange={handleModeChange}
          onRoll={game.roll}
          onUndo={game.undo}
          onNewGame={() => game.newGame()}
          onToggleSound={sound.toggle}
          onDifficultyChange={setDifficulty}
        />

        {game.state.winner && (
          <Card className="card-glow border-success/40 bg-success/5">
            <CardContent className="flex items-center gap-3 p-4">
              <PartyPopper className="h-5 w-5 text-success" />
              <p className="text-sm font-medium">
                {mode === "ai"
                  ? game.state.winner === game.humanPlayer
                    ? t("backgammon.winnerYou")
                    : t("backgammon.winnerAi")
                  : game.state.winner === "white"
                    ? t("backgammon.winnerWhite")
                    : t("backgammon.winnerBlack")}
              </p>
            </CardContent>
          </Card>
        )}

        <Board
          state={game.state}
          selected={game.selected}
          legalMoves={game.legalMoves}
          legalDestinations={game.legalDestinationsFromSelected}
          isInteractive={isInteractive}
          onSelectPoint={(point) => game.selectSource({ type: "point", point })}
          onSelectBar={() => game.selectSource({ type: "bar" })}
          onMoveToPoint={(point) => game.moveTo(point)}
          onBearOff={() => game.moveTo(null)}
        />

        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-base">{t("backgammon.statsTitle")}</CardTitle>
            <p className="text-xs text-muted-foreground">{t("backgammon.statsSubtitle")}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label={t("backgammon.statsGamesPlayed")} value={stats.gamesPlayed} />
              <StatTile label={t("backgammon.statsWins")} value={stats.wins} />
              <StatTile label={t("backgammon.statsCurrentStreak")} value={stats.currentStreak} />
              <StatTile label={t("backgammon.statsBestStreak")} value={stats.bestStreak} />
            </div>
            {(streakBadge || gamesBadge) && (
              <div className="flex flex-wrap gap-2">
                {streakBadge && (
                  <Badge variant="success">🔥 {t("backgammon.streakBadge", { n: streakBadge })}</Badge>
                )}
                {gamesBadge && (
                  <Badge variant="secondary">🏆 {t("backgammon.gamesBadge", { n: gamesBadge })}</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-dashed opacity-80">
          <CardHeader>
            <CardTitle className="text-base">{t("backgammon.bettingTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("backgammon.bettingComingSoon")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background/40 p-3 text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
