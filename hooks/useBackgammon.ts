"use client";

import * as React from "react";

import {
  applyMove,
  createInitialState,
  endTurn,
  getLegalMoves,
  hasAnyLegalMove,
  startTurn,
} from "@/lib/backgammon/engine";
import { playAiTurn } from "@/lib/backgammon/ai";
import type { GameMode, GameState, Move, MoveSource, Player } from "@/lib/backgammon/types";
import { vibrate } from "@/lib/haptics";

const HUMAN_PLAYER: Player = "white";
const AI_TURN_DELAY_MS = 650;

export function useBackgammon(mode: GameMode) {
  const [state, setState] = React.useState<GameState>(() => createInitialState());
  const [selected, setSelected] = React.useState<MoveSource | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const isAiTurn = mode === "ai" && state.turn !== HUMAN_PLAYER;

  const legalMoves = React.useMemo(
    () => (state.hasRolled && !state.winner ? getLegalMoves(state, state.turn) : []),
    [state],
  );

  const legalDestinationsFromSelected = React.useMemo(() => {
    if (!selected) return [];
    return legalMoves.filter((m) =>
      selected.type === "bar" ? m.source.type === "bar" : m.source.type === "point" && m.source.point === selected.point,
    );
  }, [legalMoves, selected]);

  // Auto-end the turn once dice are exhausted or no legal move remains.
  React.useEffect(() => {
    if (state.winner || !state.hasRolled) return;
    if (state.dice.length === 0) {
      const t = setTimeout(() => setState((s) => endTurn(s)), 400);
      return () => clearTimeout(t);
    }
    if (!hasAnyLegalMove(state, state.turn)) {
      setMessage("noMoves");
      const t = setTimeout(() => setState((s) => endTurn(s)), 900);
      return () => clearTimeout(t);
    }
    setMessage(null);
  }, [state]);

  // Drive the AI's own turn: roll, then play every die with the heuristic bot.
  React.useEffect(() => {
    if (mode !== "ai" || state.winner) return;
    if (state.turn === HUMAN_PLAYER) return;

    if (!state.hasRolled) {
      const t = setTimeout(() => setState((s) => startTurn(s)), AI_TURN_DELAY_MS);
      return () => clearTimeout(t);
    }
    if (state.dice.length > 0) {
      const t = setTimeout(() => setState((s) => playAiTurn(s, s.turn)), AI_TURN_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [mode, state]);

  const canRoll = !state.hasRolled && !state.winner && !(mode === "ai" && isAiTurn);

  function roll() {
    if (!canRoll) return;
    setState((s) => startTurn(s));
    setSelected(null);
  }

  function selectSource(source: MoveSource) {
    if (state.winner || !state.hasRolled || isAiTurn) return;
    const candidates = legalMoves.filter((m) =>
      source.type === "bar" ? m.source.type === "bar" : m.source.type === "point" && m.source.point === source.point,
    );
    if (candidates.length === 0) return;
    setSelected(source);
  }

  function moveTo(to: number | null) {
    const move: Move | undefined = legalDestinationsFromSelected.find((m) => m.to === to);
    if (!move) return;
    setState((s) => applyMove(s, move));
    setSelected(null);
    vibrate("tap");
  }

  function newGame(nextMode?: GameMode) {
    setState(createInitialState());
    setSelected(null);
    setMessage(null);
    return nextMode;
  }

  return {
    state,
    selected,
    legalMoves,
    legalDestinationsFromSelected,
    message,
    isAiTurn,
    canRoll,
    humanPlayer: HUMAN_PLAYER,
    roll,
    selectSource,
    moveTo,
    newGame,
    clearSelection: () => setSelected(null),
  };
}
