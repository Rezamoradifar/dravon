"use client";

import * as React from "react";

const STATS_KEY = "round-dashboard:backgammon-stats:v1";

export interface BackgammonStats {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  bestStreak: number;
}

const DEFAULT_STATS: BackgammonStats = { gamesPlayed: 0, wins: 0, currentStreak: 0, bestStreak: 0 };

function readStats(): BackgammonStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

function writeStats(stats: BackgammonStats) {
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore quota / private-mode errors
  }
}

/**
 * Personal, this-device-only stats - there's no backend, so there's no way
 * to rank against other real players. This tracks the vs-AI outcomes only,
 * since local pass-and-play has no single "you" to attribute a win to.
 */
export function useBackgammonStats() {
  const [stats, setStats] = React.useState<BackgammonStats>(DEFAULT_STATS);

  React.useEffect(() => {
    setStats(readStats());
  }, []);

  const recordGame = React.useCallback((won: boolean) => {
    setStats((prev) => {
      const currentStreak = won ? prev.currentStreak + 1 : 0;
      const next: BackgammonStats = {
        gamesPlayed: prev.gamesPlayed + 1,
        wins: prev.wins + (won ? 1 : 0),
        currentStreak,
        bestStreak: Math.max(prev.bestStreak, currentStreak),
      };
      writeStats(next);
      return next;
    });
  }, []);

  return { stats, recordGame };
}
