"use client";

import * as React from "react";
import { Medal } from "lucide-react";

import { apiFetch, type LeaderboardRow } from "@/lib/onchainBackgammon/api";
import { shortenAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

const PODIUM_STYLES = [
  { medal: "text-amber-300", ring: "border-amber-400/40 bg-amber-400/10", label: "1st" },
  { medal: "text-slate-300", ring: "border-slate-300/30 bg-slate-300/10", label: "2nd" },
  { medal: "text-orange-400", ring: "border-orange-400/30 bg-orange-400/10", label: "3rd" },
];

export default function LeaderboardPage() {
  const [rows, setRows] = React.useState<LeaderboardRow[] | null>(null);

  React.useEffect(() => {
    apiFetch<LeaderboardRow[]>("/leaderboard").then(setRows).catch(() => setRows([]));
  }, []);

  const podium = rows?.slice(0, 3) ?? [];
  const rest = rows?.slice(3) ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-gaming mb-6 text-2xl font-semibold">Leaderboard</h1>

      {!rows && <p className="text-slate-400">Loading...</p>}
      {rows && rows.length === 0 && <p className="text-slate-400">No completed games yet.</p>}

      {podium.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {podium.map((row, i) => {
            const style = PODIUM_STYLES[i];
            const winRate = row.gamesPlayed > 0 ? Math.round((row.wins / row.gamesPlayed) * 100) : 0;
            return (
              <div
                key={row.address}
                className={cn("card-glow flex flex-col items-center gap-2 rounded-2xl border p-4 text-center", style.ring)}
              >
                <Medal className={cn("h-8 w-8", style.medal)} />
                <span className="text-xs font-medium text-slate-400">{style.label}</span>
                <span className="font-mono text-sm">{row.displayName ?? shortenAddress(row.address)}</span>
                <span className="text-2xl font-bold">{row.wins}</span>
                <span className="text-xs text-slate-400">wins - {winRate}% win rate</span>
              </div>
            );
          })}
        </div>
      )}

      {rest.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-2">Rank</th>
              <th className="pb-2">Player</th>
              <th className="pb-2">Wins</th>
              <th className="pb-2">Losses</th>
              <th className="pb-2">Streak</th>
              <th className="pb-2">Best streak</th>
            </tr>
          </thead>
          <tbody>
            {rest.map((row, i) => (
              <tr key={row.address} className="border-t border-white/10">
                <td className="py-2 text-slate-500">{i + 4}</td>
                <td className="py-2 font-mono">{row.displayName ?? shortenAddress(row.address)}</td>
                <td className="py-2">{row.wins}</td>
                <td className="py-2">{row.losses}</td>
                <td className="py-2">{row.currentStreak}</td>
                <td className="py-2">{row.bestStreak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
