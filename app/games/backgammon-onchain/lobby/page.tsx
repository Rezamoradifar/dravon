"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { decodeEventLog, parseEther, formatEther, formatUnits, parseUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Coins, DollarSign, Loader2, Plus, Users } from "lucide-react";

import { useAuth } from "@/lib/onchainBackgammon/auth";
import { apiFetch, type OpenTable, type ActiveTable } from "@/lib/onchainBackgammon/api";
import { useBnbUsdPrice } from "@/lib/onchainBackgammon/useBnbPrice";
import { GAME_MANAGER_ADDRESS, MOCK_USDT_ADDRESS } from "@/contracts/onchainBackgammon/addresses";
import { shortenAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import gameManagerAbi from "@/contracts/onchainBackgammon/abi/GameManager.json";
import erc20Abi from "@/contracts/onchainBackgammon/abi/MockUSDT.json";

type Asset = "BNB" | "USDT";
const USD_PRESETS = [1, 10, 100, 500, 1000];
const USDT_DECIMALS = 6;
const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";

export default function LobbyPage() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, isSigningIn, login } = useAuth();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const router = useRouter();
  const bnbUsdPrice = useBnbUsdPrice();

  const [asset, setAsset] = React.useState<Asset>("BNB");
  const [amountInput, setAmountInput] = React.useState("0");
  const [isCreating, setIsCreating] = React.useState(false);
  const [joiningGameId, setJoiningGameId] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [openTables, setOpenTables] = React.useState<OpenTable[] | null>(null);
  const [activeTables, setActiveTables] = React.useState<ActiveTable[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const [open, active] = await Promise.all([
          apiFetch<OpenTable[]>("/games/open"),
          apiFetch<ActiveTable[]>("/games/active"),
        ]);
        if (!cancelled) {
          setOpenTables(open);
          setActiveTables(active);
        }
      } catch {
        // Keep whatever we last had - a transient fetch failure shouldn't blank the list.
      }
    }
    void poll();
    const interval = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function presetLabel(usd: number): string {
    if (asset === "USDT") return `$${usd}`;
    if (!bnbUsdPrice) return `~$${usd}`;
    return `$${usd}`;
  }

  function presetAmount(usd: number): string {
    if (asset === "USDT") return String(usd);
    if (!bnbUsdPrice) return String(usd * 0.002); // rough fallback so presets still do something without a live price
    return (usd / bnbUsdPrice).toFixed(6);
  }

  async function ensureUsdtAllowance(amountBaseUnits: bigint) {
    if (!address || !publicClient) return;
    const current = (await publicClient.readContract({
      address: MOCK_USDT_ADDRESS,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address, GAME_MANAGER_ADDRESS],
    })) as bigint;
    if (current >= amountBaseUnits) return;

    const hash = await writeContractAsync({
      address: MOCK_USDT_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [GAME_MANAGER_ADDRESS, amountBaseUnits],
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async function createTable() {
    if (!publicClient) return;
    setErrorMessage(null);
    setIsCreating(true);
    try {
      if (asset === "BNB") {
        let stakeWei: bigint;
        try {
          stakeWei = parseEther(amountInput || "0");
        } catch {
          throw new Error("Enter a valid BNB amount (or 0 for a free match)");
        }
        const hash = await writeContractAsync({
          address: GAME_MANAGER_ADDRESS,
          abi: gameManagerAbi,
          functionName: "createGame",
          value: stakeWei,
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const gameId = decodeGameId(receipt.logs);
        router.push(`/games/backgammon-onchain/game/${gameId}`);
      } else {
        let amountBaseUnits: bigint;
        try {
          amountBaseUnits = parseUnits(amountInput || "0", USDT_DECIMALS);
        } catch {
          throw new Error("Enter a valid USDT amount (or 0 for a free match)");
        }
        await ensureUsdtAllowance(amountBaseUnits);
        const hash = await writeContractAsync({
          address: GAME_MANAGER_ADDRESS,
          abi: gameManagerAbi,
          functionName: "createGameERC20",
          args: [MOCK_USDT_ADDRESS, amountBaseUnits],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const gameId = decodeGameId(receipt.logs);
        router.push(`/games/backgammon-onchain/game/${gameId}`);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to create the table");
    } finally {
      setIsCreating(false);
    }
  }

  function decodeGameId(logs: readonly { data: `0x${string}`; topics: `0x${string}`[] }[]): string {
    const createdLog = logs
      .map((log) => {
        try {
          return decodeEventLog({ abi: gameManagerAbi, data: log.data, topics: [...log.topics] as [`0x${string}`, ...`0x${string}`[]] });
        } catch {
          return null;
        }
      })
      .find((decoded) => decoded?.eventName === "GameCreated");
    const gameId = (createdLog?.args as { gameId: bigint } | undefined)?.gameId;
    if (!gameId) throw new Error("Could not read the created table's id from the transaction");
    return gameId.toString();
  }

  async function joinTable(table: OpenTable) {
    if (!publicClient) return;
    setErrorMessage(null);
    setJoiningGameId(table.gameId);
    try {
      const isNative = table.stakeToken === NATIVE_TOKEN;
      if (isNative) {
        const hash = await writeContractAsync({
          address: GAME_MANAGER_ADDRESS,
          abi: gameManagerAbi,
          functionName: "joinGame",
          args: [BigInt(table.gameId)],
          value: BigInt(table.stake),
        });
        await publicClient.waitForTransactionReceipt({ hash });
      } else {
        await ensureUsdtAllowance(BigInt(table.stake));
        const hash = await writeContractAsync({
          address: GAME_MANAGER_ADDRESS,
          abi: gameManagerAbi,
          functionName: "joinGame",
          args: [BigInt(table.gameId)],
        });
        await publicClient.waitForTransactionReceipt({ hash });
      }
      router.push(`/games/backgammon-onchain/game/${table.gameId}`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to join the table");
    } finally {
      setJoiningGameId(null);
    }
  }

  function formatStake(stake: string, stakeToken: string): string {
    if (stake === "0") return "Free";
    if (stakeToken === NATIVE_TOKEN) return `${formatEther(BigInt(stake))} BNB`;
    return `${formatUnits(BigInt(stake), USDT_DECIMALS)} USDT`;
  }

  const readyToPlay = isConnected && isAuthenticated;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <section className="card-glow rounded-2xl p-5">
        <h2 className="font-gaming mb-4 flex items-center gap-2 text-lg font-semibold">
          <Plus className="h-5 w-5 text-indigo-400" /> Create a table
        </h2>

        {!isConnected && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-slate-300">Connect a wallet to create or join a table.</p>
            <ConnectButton />
          </div>
        )}

        {isConnected && !isAuthenticated && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <button
              onClick={() => void login()}
              disabled={isSigningIn}
              className="rounded-full bg-indigo-500 px-6 py-2.5 font-medium text-white disabled:opacity-50"
            >
              {isSigningIn ? "Check your wallet..." : "Sign in to play"}
            </button>
          </div>
        )}

        {readyToPlay && (
          <>
            <div className="mb-4 flex gap-2">
              {(["BNB", "USDT"] as Asset[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAsset(a)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition",
                    asset === a ? "border-indigo-400 bg-indigo-500/20 text-white" : "border-white/10 text-slate-400 hover:bg-white/5",
                  )}
                >
                  {a === "BNB" ? <Coins className="h-3.5 w-3.5" /> : <DollarSign className="h-3.5 w-3.5" />}
                  {a}
                </button>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {USD_PRESETS.map((usd) => (
                <button
                  key={usd}
                  onClick={() => setAmountInput(presetAmount(usd))}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5"
                >
                  {presetLabel(usd)}
                </button>
              ))}
              <button
                onClick={() => setAmountInput("0")}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5"
              >
                Free
              </button>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <input
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="w-40 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-center text-sm"
              />
              <span className="text-sm text-slate-400">{asset} per player - 0 for a free table</span>
            </div>

            <button
              onClick={() => void createTable()}
              disabled={isCreating}
              className="flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-2.5 font-medium text-white disabled:opacity-50 hover:enabled:bg-indigo-400"
            >
              {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCreating ? "Creating - confirm in your wallet..." : "Create table"}
            </button>

            {asset === "USDT" && (
              <p className="mt-3 text-xs text-slate-500">
                Test USDT only, on BSC Testnet - mint some to your wallet for free from MockUSDT&apos;s <code>faucet()</code>{" "}
                function via the contract console.
              </p>
            )}
            {errorMessage && <p className="mt-3 text-sm text-red-400">{errorMessage}</p>}
          </>
        )}
      </section>

      <section className="card-glow rounded-2xl p-5">
        <h2 className="font-gaming mb-4 flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5 text-emerald-400" /> Open tables
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-normal text-emerald-300">
            {openTables?.length ?? 0} waiting
          </span>
        </h2>

        {!openTables && <p className="text-sm text-slate-400">Loading...</p>}
        {openTables && openTables.length === 0 && <p className="text-sm text-slate-400">No open tables right now - create one above.</p>}
        <ul className="flex flex-col gap-2">
          {openTables?.map((table) => {
            const isOwn = table.creator?.toLowerCase() === address?.toLowerCase();
            return (
              <li
                key={table.gameId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="font-mono text-slate-300">{table.creator ? shortenAddress(table.creator) : "?"}</span>
                <span className="font-medium">{formatStake(table.stake, table.stakeToken)}</span>
                {isOwn ? (
                  <Link
                    href={`/games/backgammon-onchain/game/${table.gameId}`}
                    className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                  >
                    Your table - open
                  </Link>
                ) : (
                  <button
                    onClick={() => void joinTable(table)}
                    disabled={joiningGameId === table.gameId}
                    className="rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                  >
                    {joiningGameId === table.gameId ? "Joining..." : "Join"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card-glow rounded-2xl p-5">
        <h2 className="font-gaming mb-4 flex items-center gap-2 text-lg font-semibold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          Live games
        </h2>

        {!activeTables && <p className="text-sm text-slate-400">Loading...</p>}
        {activeTables && activeTables.length === 0 && <p className="text-sm text-slate-400">No matches in progress right now.</p>}
        <ul className="flex flex-col gap-2">
          {activeTables?.map((table) => {
            const isMine = address ? table.players.some((p) => p.address.toLowerCase() === address.toLowerCase()) : false;
            return (
              <li key={table.gameId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <span className="text-slate-400">
                  {table.players.map((p) => shortenAddress(p.address)).join(" vs ")}
                </span>
                <span className="font-medium">{formatStake(table.stake, table.stakeToken)}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">{table.state}</span>
                {isMine && (
                  <Link
                    href={`/games/backgammon-onchain/game/${table.gameId}`}
                    className="rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-400"
                  >
                    Resume
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
