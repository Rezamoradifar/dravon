"use client";

import Link from "next/link";
import { Coins, ShieldCheck, Users, Zap } from "lucide-react";

import { Board } from "@/components/onchainBackgammon/board";
import type { GameState } from "@/lib/onchainBackgammon/backgammonTypes";

/** The standard starting position, rendered read-only purely as a hero
 * visual - real gameplay always uses live state broadcast by the server. */
const DEMO_STATE: GameState = {
  points: Array.from({ length: 24 }, (_, i) => {
    const point = i + 1;
    const preset: Record<number, { owner: "white" | "black"; count: number }> = {
      24: { owner: "white", count: 2 },
      13: { owner: "white", count: 5 },
      8: { owner: "white", count: 3 },
      6: { owner: "white", count: 5 },
      1: { owner: "black", count: 2 },
      12: { owner: "black", count: 5 },
      17: { owner: "black", count: 3 },
      19: { owner: "black", count: 5 },
    };
    return preset[point] ?? { owner: null, count: 0 };
  }),
  bar: { white: 0, black: 0 },
  borneOff: { white: 0, black: 0 },
  turn: "white",
  dice: [],
  hasRolled: false,
  winner: null,
  lastRoll: [],
};

const FEATURES = [
  { icon: Coins, text: "Optional BNB stakes - 0 for a free match, or set your own wager" },
  { icon: ShieldCheck, text: "Every match, escrow, and payout settled on-chain - nothing hidden" },
  { icon: Zap, text: "Server-validated live play - no lag, no cheating, no trust required" },
  { icon: Users, text: "Referral commissions up to 3 levels deep, paid automatically" },
];

export default function OnchainBackgammonHome() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60"
        style={{
          background:
            "radial-gradient(circle at 30% 0%, hsl(38 92% 50% / 0.12), transparent 55%), radial-gradient(circle at 80% 10%, hsl(245 83% 67% / 0.14), transparent 50%)",
        }}
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium tracking-wide text-amber-300">
            LIVE ON BSC TESTNET
          </span>
          <h1 className="font-gaming text-4xl font-bold tracking-tight text-white [text-shadow:0_0_30px_hsl(245_83%_67%/0.35)] sm:text-6xl">
            ON-CHAIN
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-indigo-300 to-indigo-400 bg-clip-text text-transparent">
              BACKGAMMON
            </span>
          </h1>
          <p className="max-w-xl text-lg text-slate-300">
            Real 1v1 matches, your own wallet, no middleman. Roll the dice, run the checkers home,
            and settle every wager on-chain against a real opponent on BNB Smart Chain.
          </p>
        </div>

        <div className="w-full max-w-md gradient-border rounded-2xl">
          <div className="card-glow rounded-2xl p-3 sm:p-4">
            <Board
              state={DEMO_STATE}
              selected={null}
              legalMoves={[]}
              legalDestinations={[]}
              isInteractive={false}
              onSelectPoint={() => {}}
              onSelectBar={() => {}}
              onMoveToPoint={() => {}}
              onBearOff={() => {}}
            />
          </div>
        </div>

        <Link
          href="/games/backgammon-onchain/lobby"
          className="font-gaming rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 px-10 py-3.5 text-base font-bold tracking-wide text-white shadow-[0_8px_30px_-8px_hsl(245_83%_60%/0.6)] transition hover:shadow-[0_8px_36px_-6px_hsl(245_83%_60%/0.75)] hover:brightness-110"
        >
          PLAY NOW
        </Link>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="card-glow flex items-center gap-3 rounded-xl px-4 py-3 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm text-slate-300">{text}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          Currently deployed on BSC Testnet only - stakes are test BNB, not real funds.
        </p>
      </div>
    </div>
  );
}
