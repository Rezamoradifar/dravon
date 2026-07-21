"use client";

import * as React from "react";
import { usePublicClient } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { Vault, TrendingUp, Users, Trophy } from "lucide-react";

import { GAME_MANAGER_ADDRESS, MOCK_USDT_ADDRESS } from "@/contracts/onchainBackgammon/addresses";
import gameManagerAbi from "@/contracts/onchainBackgammon/abi/GameManager.json";

const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000" as const;
const USDT_DECIMALS = 6;

const FEE_ROWS = [
  { label: "Owner fee", pct: "5.00%", note: "Fixed platform ownership cut" },
  { label: "Platform fee", pct: "5.00%", note: "Funds the weekly top-wagerer prize pool below" },
  { label: "Marketing fee", pct: "2.50%", note: "Growth and promotion" },
];

const REFERRAL_ROWS = [
  { label: "Level 1 - your direct referrer", pct: "4.00%" },
  { label: "Level 2 - their referrer", pct: "2.00%" },
  { label: "Level 3 - their referrer's referrer", pct: "1.50%" },
];

/**
 * The weekly reward pool's holding account is the same platformFeeWallet
 * that collects the 5% platform fee - its live pendingWithdrawals balance
 * (per asset) is exactly what next week's top-3 distribution draws from,
 * so reading it directly on-chain (no backend needed) gives an accurate
 * "how big is the pool right now" figure, not a simulated one.
 */
function usePlatformPool() {
  const publicClient = usePublicClient();
  const [feeWallet, setFeeWallet] = React.useState<`0x${string}` | null>(null);
  const [bnbPool, setBnbPool] = React.useState<bigint | null>(null);
  const [usdtPool, setUsdtPool] = React.useState<bigint | null>(null);

  React.useEffect(() => {
    if (!publicClient || !GAME_MANAGER_ADDRESS) return;
    let cancelled = false;

    async function load() {
      try {
        const wallet = (await publicClient!.readContract({
          address: GAME_MANAGER_ADDRESS,
          abi: gameManagerAbi,
          functionName: "platformFeeWallet",
        })) as `0x${string}`;
        if (cancelled) return;
        setFeeWallet(wallet);

        const [bnb, usdt] = await Promise.all([
          publicClient!.readContract({
            address: GAME_MANAGER_ADDRESS,
            abi: gameManagerAbi,
            functionName: "pendingWithdrawals",
            args: [wallet, NATIVE_TOKEN],
          }) as Promise<bigint>,
          publicClient!.readContract({
            address: GAME_MANAGER_ADDRESS,
            abi: gameManagerAbi,
            functionName: "pendingWithdrawals",
            args: [wallet, MOCK_USDT_ADDRESS],
          }) as Promise<bigint>,
        ]);
        if (cancelled) return;
        setBnbPool(bnb);
        setUsdtPool(usdt);
      } catch {
        // Leave as null - the vault card just shows "unavailable" rather than a wrong number.
      }
    }

    void load();
    const interval = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicClient]);

  return { feeWallet, bnbPool, usdtPool };
}

export default function RevenuePlanPage() {
  const { feeWallet, bnbPool, usdtPool } = usePlatformPool();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-gaming text-2xl font-semibold">Revenue plan</h1>
        <p className="mt-1 text-sm text-slate-400">
          Exactly what happens to a wager when a match settles - straight from the deployed contract, nothing hidden.
        </p>
      </div>

      <section className="card-glow rounded-2xl p-5">
        <h2 className="font-gaming mb-3 flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-5 w-5 text-indigo-400" /> Where a 20% cut goes
        </h2>
        <p className="mb-4 text-sm text-slate-400">
          When a match completes, 20% of each player&apos;s own stake is deducted from that player&apos;s own side and the
          rest goes to the winner - split into two groups, computed and paid out atomically in the same settlement
          transaction:
        </p>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Platform - 12.5%</p>
        <div className="mb-4 overflow-hidden rounded-lg border border-white/10">
          {FEE_ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-3 px-3 py-2 text-sm ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
            >
              <div>
                <span className="text-slate-200">{row.label}</span>
                <p className="text-xs text-slate-500">{row.note}</p>
              </div>
              <span className="font-mono text-slate-200">{row.pct}</span>
            </div>
          ))}
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Referral - 7.5%</p>
        <div className="overflow-hidden rounded-lg border border-white/10">
          {REFERRAL_ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-3 py-2 text-sm ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
            >
              <span className="text-slate-300">{row.label}</span>
              <span className="font-mono text-slate-200">{row.pct}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          A referral level with nobody registered falls back to the platform fee wallet rather than being lost.
        </p>
      </section>

      <section className="card-glow relative overflow-hidden rounded-2xl p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(circle at 50% 0%, hsl(38 92% 50% / 0.25), transparent 60%)" }}
        />
        <h2 className="font-gaming relative mb-3 flex items-center gap-2 text-lg font-semibold">
          <Vault className="h-5 w-5 text-amber-300" /> Weekly prize pool
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-normal text-emerald-300">Live</span>
        </h2>
        <p className="relative mb-4 text-sm text-slate-400">
          The platform fee wallet doubles as the prize pool - once a week, the smaller of that week&apos;s fee take and
          this live balance is split 50% / 30% / 20% between the top 3 players by total wagered volume.
        </p>

        <div className="relative grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-center">
            <p className="text-xs text-slate-400">BNB pool</p>
            <p className="mt-1 font-mono text-xl font-bold text-amber-200">
              {bnbPool !== null ? formatEther(bnbPool) : "..."}
            </p>
          </div>
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-center">
            <p className="text-xs text-slate-400">USDT pool</p>
            <p className="mt-1 font-mono text-xl font-bold text-amber-200">
              {usdtPool !== null ? formatUnits(usdtPool, USDT_DECIMALS) : "..."}
            </p>
          </div>
        </div>

        {feeWallet && (
          <p className="relative mt-3 text-center text-xs text-slate-500">
            Reserve wallet: <span className="font-mono">{feeWallet}</span>
          </p>
        )}
      </section>

      <section className="card-glow rounded-2xl p-5">
        <h2 className="font-gaming mb-3 flex items-center gap-2 text-lg font-semibold">
          <Trophy className="h-5 w-5 text-emerald-400" /> Top 3 split
        </h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3">
            <p className="text-xs text-slate-400">1st</p>
            <p className="text-lg font-bold text-amber-200">50%</p>
          </div>
          <div className="rounded-lg border border-slate-300/30 bg-slate-300/10 p-3">
            <p className="text-xs text-slate-400">2nd</p>
            <p className="text-lg font-bold text-slate-200">30%</p>
          </div>
          <div className="rounded-lg border border-orange-400/30 bg-orange-400/10 p-3">
            <p className="text-xs text-slate-400">3rd</p>
            <p className="text-lg font-bold text-orange-300">20%</p>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <Users className="h-3.5 w-3.5" /> Ranked by total stake volume across matches that actually settled that week -
          cancelled matches don&apos;t count.
        </p>
      </section>
    </div>
  );
}
