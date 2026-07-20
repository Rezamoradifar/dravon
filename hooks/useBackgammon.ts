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
import { playSound } from "@/lib/backgammon/sound";
import type { Difficulty, GameMode, GameState, Move, MoveSource, Player } from "@/lib/backgammon/types";
import { vibrate } from "@/lib/haptics";

const HUMAN_PLAYER: Player = "white";
const AI_TURN_DELAY_MS = 650;

export function useBackgammon(mode: GameMode, difficulty: Difficulty = "medium") {
  const [state, setState] = React.useState<GameState>(() => createInitialState());
  const [selected, setSelected] = React.useState<MoveSource | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  // Snapshots of state before each move made this turn, so the current
  // player can undo a misclick before the turn ends. Cleared whenever the
  // turn changes (see the effect below) or a new game/turn starts.
  const historyRef = React.useRef<GameState[]>([]);
  const [canUndo, setCanUndo] = React.useState(false);

  const isAiTurn = mode === "ai" && state.turn !== HUMAN_PLAYER;

  React.useEffect(() => {
    historyRef.current = [];
    setCanUndo(false);
  }, [state.turn]);

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
      if (message !== "noMoves") {
        playSound("noMoves");
        vibrate("warning");
      }
      setMessage("noMoves");
      const t = setTimeout(() => setState((s) => endTurn(s)), 900);
      return () => clearTimeout(t);
    }
    setMessage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Celebrate a win once, the moment it happens.
  const wonRef = React.useRef(false);
  React.useEffect(() => {
    if (state.winner && !wonRef.current) {
      wonRef.current = true;
      playSound("win");
      vibrate("success");
    }
    if (!state.winner) wonRef.current = false;
  }, [state.winner]);

  // Drive the AI's own turn: roll, then play every die with the heuristic bot.
  React.useEffect(() => {
    if (mode !== "ai" || state.winner) return;
    if (state.turn === HUMAN_PLAYER) return;

    if (!state.hasRolled) {
      const t = setTimeout(() => setState((s) => startTurn(s)), AI_TURN_DELAY_MS);
      return () => clearTimeout(t);
    }
    if (state.dice.length > 0) {
      const t = setTimeout(() => setState((s) => playAiTurn(s, s.turn, difficulty)), AI_TURN_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [mode, state, difficulty]);

  const canRoll = !state.hasRolled && !state.winner && !(mode === "ai" && isAiTurn);

  function roll() {
    if (!canRoll) return;
    historyRef.current = [];
    setCanUndo(false);
    setState((s) => startTurn(s));
    setSelected(null);
    playSound("roll");
    vibrate("tap");
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

    const isBearOff = move.to === null;
    const isHit =
      !isBearOff &&
      (() => {
        const dest = state.points[(move.to as number) - 1];
        return dest.owner !== null && dest.owner !== state.turn && dest.count === 1;
      })();

    historyRef.current.push(state);
    setCanUndo(true);
    setState((s) => applyMove(s, move));
    setSelected(null);

    if (isBearOff) {
      playSound("bearOff");
      vibrate("success");
    } else if (isHit) {
      playSound("hit");
      vibrate("warning");
    } else {
      playSound("move");
      vibrate("tap");
    }
  }

  function undo() {
    const previous = historyRef.current.pop();
    if (!previous) return;
    setCanUndo(historyRef.current.length > 0);
    setState(previous);
    setSelected(null);
  }

  function newGame(nextMode?: GameMode) {
    historyRef.current = [];
    setCanUndo(false);
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
    canUndo: canUndo && !isAiTurn && !state.winner,
    humanPlayer: HUMAN_PLAYER,
    roll,
    selectSource,
    moveTo,
    undo,
    newGame,
    clearSelection: () => setSelected(null),
  };
}
