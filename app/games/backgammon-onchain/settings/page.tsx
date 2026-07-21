"use client";

import * as React from "react";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Volume2, VolumeX, Vibrate } from "lucide-react";

import { useAuth } from "@/lib/onchainBackgammon/auth";
import { shortenAddress } from "@/lib/format";
import { GAME_MANAGER_ADDRESS, MOCK_USDT_ADDRESS } from "@/contracts/onchainBackgammon/addresses";
import gameManagerAbi from "@/contracts/onchainBackgammon/abi/GameManager.json";
import { isSoundEnabled, setSoundEnabled } from "@/lib/backgammon/sound";
import { isHapticsEnabled, setHapticsEnabled, vibrate } from "@/lib/haptics";

const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000" as const;
const USDT_DECIMALS = 6;

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-gaming mb-6 text-2xl font-semibold">On-Chain Backgammon settings</h1>

      <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-sm font-medium">Wallet</p>
        {isConnected ? (
          <p className="font-mono text-sm text-slate-300">{address ? shortenAddress(address) : ""}</p>
        ) : (
          <ConnectButton />
        )}
      </div>

      {isConnected && (
        <>
          <WithdrawableBalance address={address} token={NATIVE_TOKEN} label="BNB" decimals={18} />
          <WithdrawableBalance address={address} token={MOCK_USDT_ADDRESS} label="USDT" decimals={USDT_DECIMALS} />
        </>
      )}

      <PreferencesCard />

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-sm font-medium">Session</p>
        <p className="mb-3 text-sm text-slate-300">{isAuthenticated ? "Signed in" : "Not signed in"}</p>
        {isAuthenticated && (
          <button onClick={logout} className="rounded-full border border-white/20 px-4 py-1.5 text-sm hover:bg-white/5">
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Winnings, fees, referral commissions, and cancellation refunds all land
 * here as a pull-payment balance (see GameManager's NatSpec for why) - keyed
 * by (account, token), so BNB and USDT are separate balances that never mix
 * and must be withdrawn separately.
 */
function WithdrawableBalance({
  address,
  token,
  label,
  decimals,
}: {
  address: `0x${string}` | undefined;
  token: `0x${string}`;
  label: string;
  decimals: number;
}) {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [isWithdrawing, setIsWithdrawing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { data: balance, refetch } = useReadContract({
    address: GAME_MANAGER_ADDRESS,
    abi: gameManagerAbi,
    functionName: "pendingWithdrawals",
    args: address ? [address, token] : undefined,
    query: { enabled: Boolean(GAME_MANAGER_ADDRESS && address) },
  });

  async function withdraw() {
    if (!GAME_MANAGER_ADDRESS || !publicClient) return;
    setError(null);
    setIsWithdrawing(true);
    try {
      const hash = await writeContractAsync({
        address: GAME_MANAGER_ADDRESS,
        abi: gameManagerAbi,
        functionName: "withdraw",
        args: [token],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  }

  if (!GAME_MANAGER_ADDRESS) return null;

  const amount = typeof balance === "bigint" ? balance : BigInt(0);
  const formatted = decimals === 18 ? formatEther(amount) : formatUnits(amount, decimals);

  return (
    <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="mb-2 text-sm font-medium">Withdrawable {label} balance</p>
      <p className="mb-3 font-mono text-lg">
        {formatted} {label}
      </p>
      <button
        onClick={() => void withdraw()}
        disabled={amount === BigInt(0) || isWithdrawing}
        className="rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
      >
        {isWithdrawing ? "Withdrawing..." : "Withdraw"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

/**
 * Sound/haptics preferences - shared with the free backgammon game
 * (lib/backgammon/sound.ts, lib/haptics.ts) since they're the same
 * conceptual "is this game noisy" setting regardless of which mode a
 * player is in, and both games play through the same events (roll, move,
 * hit, bear off, win).
 */
function PreferencesCard() {
  const [soundEnabled, setSound] = React.useState(true);
  const [hapticsEnabled, setHaptics] = React.useState(true);

  React.useEffect(() => {
    setSound(isSoundEnabled());
    setHaptics(isHapticsEnabled());
  }, []);

  function toggleSound() {
    const next = !soundEnabled;
    setSound(next);
    setSoundEnabled(next);
  }

  function toggleHaptics() {
    const next = !hapticsEnabled;
    setHaptics(next);
    setHapticsEnabled(next);
    if (next) vibrate("tap");
  }

  return (
    <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="mb-3 text-sm font-medium">Preferences</p>
      <div className="flex flex-col gap-3">
        <button onClick={toggleSound} className="flex items-center justify-between text-sm text-slate-300">
          <span className="flex items-center gap-2">
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Sound effects
          </span>
          <span
            className={`h-5 w-9 rounded-full p-0.5 transition ${soundEnabled ? "bg-indigo-500" : "bg-white/10"}`}
          >
            <span className={`block h-4 w-4 rounded-full bg-white transition ${soundEnabled ? "translate-x-4" : ""}`} />
          </span>
        </button>
        <button onClick={toggleHaptics} className="flex items-center justify-between text-sm text-slate-300">
          <span className="flex items-center gap-2">
            <Vibrate className="h-4 w-4" />
            Haptic feedback
          </span>
          <span
            className={`h-5 w-9 rounded-full p-0.5 transition ${hapticsEnabled ? "bg-indigo-500" : "bg-white/10"}`}
          >
            <span className={`block h-4 w-4 rounded-full bg-white transition ${hapticsEnabled ? "translate-x-4" : ""}`} />
          </span>
        </button>
      </div>
    </div>
  );
}
