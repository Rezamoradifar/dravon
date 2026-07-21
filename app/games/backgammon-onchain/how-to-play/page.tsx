"use client";

import Link from "next/link";
import {
  Dice5,
  MoveRight,
  ShieldAlert,
  Swords,
  Trophy,
  Wallet,
  Users,
  Gavel,
  Coins,
} from "lucide-react";

import { Board } from "@/components/onchainBackgammon/board";
import type { GameState } from "@/lib/onchainBackgammon/backgammonTypes";

/** The standard starting position - a static teaching visual, not live state. */
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

const FEE_SPLIT = [
  { label: "Owner fee", pct: "5.00%" },
  { label: "Platform fee", pct: "5.00%" },
  { label: "Marketing fee", pct: "2.50%" },
  { label: "Referral - level 1", pct: "4.00%" },
  { label: "Referral - level 2", pct: "2.00%" },
  { label: "Referral - level 3", pct: "1.50%" },
];

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Dice5;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-glow rounded-2xl p-5">
      <h2 className="font-gaming mb-3 flex items-center gap-2 text-lg font-semibold">
        <Icon className="h-5 w-5 text-indigo-400" /> {title}
      </h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

export default function HowToPlayPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="font-gaming text-3xl font-bold text-white sm:text-4xl">How to play</h1>
        <p className="mt-2 text-slate-400">
          Classic backgammon rules, plus exactly how staking, disputes, and payouts work on-chain here.
        </p>
      </div>

      <div className="gradient-border mx-auto w-full max-w-sm rounded-2xl">
        <div className="card-glow rounded-2xl p-3">
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

      <Section icon={Trophy} title="Objective">
        <p>
          Each player has 15 checkers. White moves from point 24 toward point 1, Black moves from
          point 1 toward point 24 - the two players always race in opposite directions. The first
          player to bring all 15 of their own checkers into their home board and then bear them all
          off the board wins the match.
        </p>
      </Section>

      <Section icon={Dice5} title="Turns and movement">
        <p>Each turn you roll two dice and move your checkers that many pips, following these rules:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Each die is a separate move - a roll of 3 and 5 lets you move one checker 3 and another 5, or the same checker 3 then 5.</li>
          <li>Rolling doubles (e.g. 4-4) gives you four moves of that number instead of two.</li>
          <li>You can only land on a point that is empty, holds your own checkers, or holds exactly one opposing checker (a &quot;blot&quot;).</li>
          <li>A point held by two or more opposing checkers is blocked - you cannot land there.</li>
          <li>If you can legally play a roll, you must - even if it is not the move you would have preferred.</li>
        </ul>
      </Section>

      <Section icon={Swords} title="Hitting and the bar">
        <p>
          Landing on a single opposing checker (a blot) sends it to the bar. A checker on the bar
          must re-enter the board in the opponent&apos;s home board before that player can make any
          other move - if every entry point is blocked by two or more opposing checkers, that
          player forfeits the rest of their turn.
        </p>
      </Section>

      <Section icon={MoveRight} title="Bearing off">
        <p>
          Once all 15 of your checkers are inside your own home board (points 1-6 for the player
          bearing off toward point 1, or 19-24 for the other side), you may start bearing them off -
          removing them from the board using die rolls that match each checker&apos;s point number. The
          first player to bear off all 15 checkers wins immediately.
        </p>
      </Section>

      <Section icon={Wallet} title="Staking a match">
        <p>
          Every table is created with a stake amount in either BNB or USDT (or 0, for a free
          match). The creator escrows their stake by opening the table; the joining player escrows
          the exact same amount when they join. BNB and USDT balances are always tracked and paid
          out completely separately - they never mix.
        </p>
      </Section>

      <Section icon={Coins} title="How a stake is split when a match ends">
        <p>
          When a match completes, 20% of each player&apos;s own stake is deducted from that player&apos;s own
          side (independently - a winner never loses a cut from their own winnings beyond this),
          and the rest goes to the winner:
        </p>
        <div className="mt-1 overflow-hidden rounded-lg border border-white/10">
          {FEE_SPLIT.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-3 py-1.5 text-xs ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
            >
              <span className="text-slate-400">{row.label}</span>
              <span className="font-mono text-slate-200">{row.pct}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          A referral level with nobody registered falls back to the platform fee wallet rather than
          being lost. Set who referred you once, ever, from the Referral page.
        </p>
      </Section>

      <Section icon={Gavel} title="Submitting a result, disputes, and timeouts">
        <p>
          After a match finishes, either player submits the result on-chain. The other player then
          either confirms it (finalizing the payout immediately) or disputes it, which escalates the
          match to arbiter review. If the other player does neither, the submitter can finalize
          unilaterally once 24 hours have passed - so an unresponsive opponent can never freeze a
          match forever.
        </p>
      </Section>

      <Section icon={Users} title="Weekly top-wagerer rewards">
        <p>
          Once a week, a share of the platform&apos;s accumulated fee (the smaller of that week&apos;s fee
          take and its actual on-chain balance) is redistributed to that week&apos;s top 3 players by
          total completed-match stake volume - split 50% / 30% / 20% for 1st, 2nd, and 3rd place.
          Cancelled matches don&apos;t count toward this, since they refund in full and pay no fee.
        </p>
      </Section>

      <Section icon={ShieldAlert} title="Withdrawing winnings">
        <p>
          Winnings, fees, referral commissions, and cancellation refunds are never sent
          automatically - they&apos;re credited to your balance on-chain and you withdraw them yourself
          (per asset) from the Settings page whenever you like. This is a deliberate safety choice:
          it means one broken or reverting address can never freeze payouts for every other player.
        </p>
      </Section>

      <div className="flex justify-center py-4">
        <Link
          href="/games/backgammon-onchain/lobby"
          className="font-gaming rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 px-10 py-3.5 text-base font-bold tracking-wide text-white shadow-[0_8px_30px_-8px_hsl(245_83%_60%/0.6)] transition hover:shadow-[0_8px_36px_-6px_hsl(245_83%_60%/0.75)] hover:brightness-110"
        >
          PLAY NOW
        </Link>
      </div>
    </div>
  );
}
