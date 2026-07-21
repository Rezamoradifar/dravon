"use client";

import * as React from "react";

import { WS_BASE_URL } from "./api";
import type { GameState, Move } from "./backgammonTypes";

export type ServerMessage =
  | { type: "matched"; opponentAddress: string; opponentWalletId: string; amICreator: boolean; stake: string }
  | { type: "gameCreated"; onChainGameId: string }
  | { type: "roomJoined"; gameId: string; color: "white" | "black" | null; state: GameState | null }
  | { type: "rolled"; turn: "white" | "black"; dice: number[]; turnNumber: number }
  | { type: "moved"; move: Move; wasHit: boolean; state: GameState }
  | { type: "noLegalMoves"; turn: "white" | "black" }
  | { type: "turnEnded"; turn: "white" | "black" }
  | { type: "gameOver"; winner: "white" | "black" };

type ClientMessage =
  | { type: "queue"; stake: string }
  | { type: "cancelQueue" }
  | { type: "gameCreated"; onChainGameId: string }
  | { type: "joinRoom"; gameId: string }
  | { type: "roll"; gameId: string }
  | { type: "move"; gameId: string; move: unknown };

type Listener = (message: ServerMessage) => void;

/**
 * A single persistent WebSocket connection for the authenticated session,
 * shared for both matchmaking and live gameplay (they're the same socket -
 * see backend/src/ws/server.ts's message router).
 *
 * Consumers subscribe with `onMessage` and update their own state directly
 * from within that callback, since it fires from the socket's own message
 * event rather than from a React render/effect cycle.
 */
export function useGameSocket(token: string | null) {
  const socketRef = React.useRef<WebSocket | null>(null);
  const listenersRef = React.useRef<Set<Listener>>(new Set());
  // Messages sent before the handshake finishes (e.g. clicking "Find a
  // match" right after signing in, before onopen fires) used to be dropped
  // silently - send() checked readyState and simply did nothing, while the
  // caller had no way to know. Queuing here and flushing on open means a
  // send() call can never be lost to that race, regardless of how fast the
  // caller sends after connecting.
  const pendingRef = React.useRef<ClientMessage[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;
    const authToken = token;

    let stopped = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      const socket = new WebSocket(`${WS_BASE_URL}/ws?token=${encodeURIComponent(authToken)}`);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsOpen(true);
        for (const message of pendingRef.current) socket.send(JSON.stringify(message));
        pendingRef.current = [];
      };
      // A dropped connection (network blip, server restart) used to just
      // sit closed forever - nothing ever reconnected it, so a player
      // mid-queue or mid-game would silently stop hearing from the server
      // with no way back short of a full page reload. Reconnecting here
      // (unless this effect is tearing down, e.g. on sign-out) at least
      // restores the transport; server-side queue state still needs the
      // caller to re-send "queue" once reconnected, since the backend drops
      // a disconnected socket's queue entry immediately (see matchmaker.ts).
      socket.onclose = () => {
        setIsOpen(false);
        if (stopped) return;
        reconnectTimer = setTimeout(connect, 1500);
      };
      socket.onmessage = (event) => {
        let message: ServerMessage;
        try {
          message = JSON.parse(event.data) as ServerMessage;
        } catch {
          return;
        }
        for (const listener of listenersRef.current) listener(message);
      };
    }

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
      pendingRef.current = [];
    };
  }, [token]);

  const onMessage = React.useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const send = React.useCallback((message: ClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      pendingRef.current.push(message);
    }
  }, []);

  return { isOpen, onMessage, send };
}
