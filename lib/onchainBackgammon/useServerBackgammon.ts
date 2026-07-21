"use client";

import * as React from "react";

import { getLegalMoves } from "./legalMoves";
import type { GameState, MoveSource, Player } from "./backgammonTypes";
import type { ServerMessage } from "./useGameSocket";
import { playSound } from "@/lib/backgammon/sound";
import { vibrate } from "@/lib/haptics";

export function useServerBackgammon(params: {
  gameId: string;
  myColor: Player | null;
  onMessage: (listener: (message: ServerMessage) => void) => () => void;
  send: (message: { type: "roll"; gameId: string } | { type: "move"; gameId: string; move: unknown }) => void;
}) {
  const { gameId, myColor, onMessage, send } = params;
  const [state, setState] = React.useState<GameState | null>(null);
  const [selected, setSelected] = React.useState<MoveSource | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    return onMessage((serverMessage) => {
      switch (serverMessage.type) {
        case "roomJoined":
          if (serverMessage.gameId === gameId && serverMessage.state) setState(serverMessage.state);
          break;
        case "rolled":
          setState((prev) =>
            prev ? { ...prev, turn: serverMessage.turn, dice: serverMessage.dice, lastRoll: serverMessage.dice, hasRolled: true } : prev,
          );
          setMessage(null);
          playSound("roll");
          vibrate("tap");
          break;
        case "moved":
          setState(serverMessage.state);
          setSelected(null);
          if (serverMessage.move.to === null) {
            playSound("bearOff");
            vibrate("success");
          } else if (serverMessage.wasHit) {
            playSound("hit");
            vibrate("warning");
          } else {
            playSound("move");
            vibrate("tap");
          }
          break;
        case "noLegalMoves":
          setMessage("noMoves");
          playSound("noMoves");
          vibrate("warning");
          break;
        case "turnEnded":
          setState((prev) => (prev ? { ...prev, turn: serverMessage.turn, dice: [], hasRolled: false } : prev));
          setMessage(null);
          setSelected(null);
          break;
        case "gameOver":
          setState((prev) => (prev ? { ...prev, winner: serverMessage.winner } : prev));
          playSound("win");
          vibrate("success");
          break;
      }
    });
  }, [onMessage, gameId]);

  const isMyTurn = state !== null && myColor !== null && state.turn === myColor;

  const legalMoves = React.useMemo(() => {
    if (!state || !state.hasRolled || state.winner || !isMyTurn) return [];
    return getLegalMoves(state, state.turn);
  }, [state, isMyTurn]);

  const legalDestinationsFromSelected = React.useMemo(() => {
    if (!selected) return [];
    return legalMoves.filter((m) =>
      selected.type === "bar" ? m.source.type === "bar" : m.source.type === "point" && m.source.point === selected.point,
    );
  }, [legalMoves, selected]);

  const canRoll = isMyTurn && state !== null && !state.hasRolled && !state.winner;
  const isInteractive = isMyTurn && state !== null && state.hasRolled && !state.winner;

  function roll() {
    if (!canRoll) return;
    send({ type: "roll", gameId });
  }

  function selectSource(source: MoveSource) {
    if (!isInteractive) return;
    const candidates = legalMoves.filter((m) =>
      source.type === "bar" ? m.source.type === "bar" : m.source.type === "point" && m.source.point === source.point,
    );
    if (candidates.length === 0) return;
    setSelected(source);
  }

  function moveTo(to: number | null) {
    const move = legalDestinationsFromSelected.find((m) => m.to === to);
    if (!move) return;
    send({ type: "move", gameId, move });
  }

  return {
    state,
    selected,
    legalMoves,
    legalDestinationsFromSelected,
    message,
    isMyTurn,
    canRoll,
    isInteractive,
    roll,
    selectSource,
    moveTo,
    clearSelection: () => setSelected(null),
  };
}
