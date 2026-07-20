"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, PartyPopper } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Board } from "@/components/games/backgammon/board";
import { GameControls } from "@/components/games/backgammon/game-controls";
import { useBackgammon } from "@/hooks/useBackgammon";
import { useBackgammonSound } from "@/hooks/useBackgammonSound";
import { fireConfetti } from "@/lib/confetti";
import type { GameMode } from "@/lib/backgammon/types";
import { useTranslation } from "@/contexts/language-context";

export default function BackgammonPage() {
  const { t } = useTranslation();
  const [mode, setMode] = React.useState<GameMode>("ai");
  const game = useBackgammon(mode);
  const sound = useBackgammonSound();

  const wonBefore = React.useRef(false);
  React.useEffect(() => {
    if (game.state.winner && !wonBefore.current) {
      wonBefore.current = true;
      fireConfetti();
    }
    if (!game.state.winner) wonBefore.current = false;
  }, [game.state.winner]);

  function handleModeChange(next: GameMode) {
    setMode(next);
    game.newGame(next);
  }

  const isInteractive =
    !game.state.winner && game.state.hasRolled && !(mode === "ai" && game.isAiTurn);

  return (
    <div>
      <PageHeader
        title={t("backgammon.title")}
        description={t("backgammon.description")}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link href="/games">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("backgammon.backToGames")}
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <GameControls
          mode={mode}
          state={game.state}
          canRoll={game.canRoll}
          isAiTurn={game.isAiTurn}
          message={game.message}
          soundEnabled={sound.enabled}
          onModeChange={handleModeChange}
          onRoll={game.roll}
          onNewGame={() => game.newGame()}
          onToggleSound={sound.toggle}
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
            <CardTitle className="text-base">{t("backgammon.rulesTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{t("backgammon.rulesBody")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
