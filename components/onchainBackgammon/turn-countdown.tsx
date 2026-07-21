"use client";

import * as React from "react";
import { Timer } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Visible per-turn clock - the server enforces this same deadline
 * server-side (auto-rolling or auto-playing if it elapses, see
 * gameRoom.ts's armTurnTimer), so this is a countdown of a real limit, not
 * just decoration. Recomputes locally every second from the deadline
 * timestamp the server sent, rather than trusting a client-side interval
 * alone, so it stays correct even if the tab was backgrounded.
 */
export function TurnCountdown({ deadline, isMyTurn }: { deadline: number | null; isMyTurn: boolean }) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return null;

  const remainingMs = Math.max(0, deadline - now);
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const isUrgent = remainingSeconds <= 10;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium tabular-nums transition-colors",
        isUrgent
          ? "animate-pulse border-red-400/40 bg-red-500/15 text-red-300"
          : isMyTurn
            ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300"
            : "border-white/10 bg-white/5 text-slate-400",
      )}
    >
      <Timer className="h-3.5 w-3.5" />
      {remainingSeconds}s
    </div>
  );
}
