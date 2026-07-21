"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { apiFetch, type GameHistoryEntry } from "@/lib/onchainBackgammon/api";
import { shortenAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";
const USDT_DECIMALS = 6;

type OutcomeFilter = "all" | "won" | "lost" | "cancelled";
type SortMode = "recent" | "stake";

function outcomeOf(g: GameHistoryEntry, address: string | undefined): "won" | "lost" | "cancelled" {
  if (g.state === "CANCELLED") return "cancelled";
  const you = g.players.find((p) => p.address.toLowerCase() === address?.toLowerCase());
  const won = Boolean(g.winner && you && g.winner.toLowerCase() === you.address.toLowerCase());
  return won ? "won" : "lost";
}

function stakeAsNumber(g: GameHistoryEntry): number {
  try {
    return g.stakeToken === NATIVE_TOKEN
      ? Number(formatEther(BigInt(g.stake)))
      : Number(formatUnits(BigInt(g.stake), USDT_DECIMALS));
  } catch {
    return 0;
  }
}

function formatStake(g: GameHistoryEntry): string {
  if (g.stake === "0") return "Free";
  const asset = g.stakeToken === NATIVE_TOKEN ? "BNB" : "USDT";
  return `${stakeAsNumber(g)} ${asset}`;
}

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const [games, setGames] = React.useState<GameHistoryEntry[] | null>(null);
  const [outcomeFilter, setOutcomeFilter] = React.useState<OutcomeFilter>("all");
  const [sortMode, setSortMode] = React.useState<SortMode>("recent");

  React.useEffect(() => {
    if (!address) return;
    apiFetch<GameHistoryEntry[]>(`/games/history/${address}`).then(setGames).catch(() => setGames([]));
  }, [address]);

  if (!isConnected) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="text-slate-300">Connect a wallet to see your game history.</p>
        <ConnectButton />
      </div>
    );
  }

  const filtered = (games ?? []).filter((g) => outcomeFilter === "all" || outcomeOf(g, address) === outcomeFilter);
  const sorted = [...filtered].sort((a, b) =>
    sortMode === "stake"
      ? stakeAsNumber(b) - stakeAsNumber(a)
      : new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime(),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-gaming mb-6 text-2xl font-semibold">Your game history</h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "won", "lost", "cancelled"] as OutcomeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setOutcomeFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs capitalize transition",
                outcomeFilter === f ? "border-indigo-400 bg-indigo-500/20 text-white" : "border-white/10 text-slate-400 hover:bg-white/5",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-xs text-slate-300"
        >
          <option value="recent">Most recent</option>
          <option value="stake">Highest stake</option>
        </select>
      </div>

      {!games && <p className="text-slate-400">Loading...</p>}
      {games && sorted.length === 0 && <p className="text-slate-400">No games match this filter.</p>}

      <ul className="flex flex-col gap-2">
        {sorted.map((g) => {
          const outcome = outcomeOf(g, address);
          return (
            <li
              key={g.gameId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm"
            >
              <span className="text-slate-500">Game #{g.gameId}</span>
              <span className="text-slate-400">{g.players.map((p) => shortenAddress(p.address)).join(" vs ")}</span>
              <span className="font-medium">{formatStake(g)}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  outcome === "won" && "bg-emerald-500/20 text-emerald-300",
                  outcome === "lost" && "bg-red-500/20 text-red-300",
                  outcome === "cancelled" && "bg-white/10 text-slate-400",
                )}
              >
                {outcome}
              </span>
              <span className="text-xs text-slate-500">
                {g.completedAt ? new Date(g.completedAt).toLocaleDateString() : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
