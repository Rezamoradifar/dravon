"use client";

import * as React from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { isAddress, parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BookOpenText, ChevronDown, ExternalLink, Loader2, PenSquare, ShieldAlert } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GAME_MANAGER_ADDRESS } from "@/contracts/onchainBackgammon/addresses";
import { shortenAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import gameManagerAbi from "@/contracts/onchainBackgammon/abi/GameManager.json";

interface AbiInput {
  name: string;
  type: string;
}

interface AbiFn {
  type: string;
  name: string;
  stateMutability?: string;
  inputs: AbiInput[];
  outputs: AbiInput[];
}

const ABI = gameManagerAbi as unknown as AbiFn[];

const READ_FNS = ABI.filter(
  (item) => item.type === "function" && (item.stateMutability === "view" || item.stateMutability === "pure"),
).sort((a, b) => a.name.localeCompare(b.name));

const WRITE_FNS = ABI.filter(
  (item) => item.type === "function" && (item.stateMutability === "nonpayable" || item.stateMutability === "payable"),
).sort((a, b) => a.name.localeCompare(b.name));

// Functions that revert unless the caller holds a specific role (or is a
// game participant at the right stage) - flagged so the console doesn't
// read as "broken" when a non-privileged wallet's call reverts.
const RESTRICTED_FUNCTIONS = new Set([
  "pause",
  "unpause",
  "grantRole",
  "revokeRole",
  "renounceRole",
  "setStakeTokenAllowed",
  "setMarketingFeeWallet",
  "setOwnerFeeWallet",
  "setPlatformFeeWallet",
  "setRandomnessProvider",
  "distributeWeeklyRewards",
  "fulfillRandomness",
  "resolveDispute",
]);

const EXPLORER_BASE = "https://testnet.bscscan.com";

function argKey(input: AbiInput, index: number): string {
  return input.name || `arg${index}`;
}

function parseArg(type: string, raw: string): unknown {
  const trimmed = raw.trim();
  if (type.endsWith("[]")) {
    const base = type.slice(0, -2);
    if (trimmed === "") return [];
    return trimmed.split(",").map((s) => parseArg(base, s));
  }
  if (type === "bool") return trimmed === "true";
  if (type.startsWith("uint") || type.startsWith("int")) return BigInt(trimmed === "" ? "0" : trimmed);
  return trimmed; // address, bytes32/bytes, string
}

function isArgValid(type: string, raw: string): boolean {
  const trimmed = raw.trim();
  if (type.endsWith("[]")) return true;
  if (type === "bool") return trimmed === "true" || trimmed === "false" || trimmed === "";
  if (trimmed === "") return false;
  if (type === "address") return isAddress(trimmed);
  if (type.startsWith("uint") || type.startsWith("int")) {
    try {
      BigInt(trimmed);
      return true;
    } catch {
      return false;
    }
  }
  if (type.startsWith("bytes")) return /^0x[0-9a-fA-F]*$/.test(trimmed);
  return true;
}

function fieldPlaceholder(type: string): string {
  if (type === "address") return "0x...";
  if (type.startsWith("bytes")) return "0x...";
  if (type === "bool") return "true / false";
  if (type.endsWith("[]")) return "comma-separated values";
  return "0";
}

function formatValue(value: unknown): string {
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length === 0 ? "[]" : `[${value.map(formatValue).join(", ")}]`;
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => Number.isNaN(Number(key)))
      .map(([key, val]) => `${key}: ${formatValue(val)}`)
      .join("\n");
  }
  return String(value);
}

function ArgFields({
  inputs,
  values,
  onChange,
}: {
  inputs: AbiInput[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  if (inputs.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {inputs.map((input, i) => {
        const key = argKey(input, i);
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">
              {key} <span className="text-slate-600">({input.type})</span>
            </label>
            {input.type === "bool" ? (
              <select
                value={values[key] ?? "false"}
                onChange={(e) => onChange(key, e.target.value)}
                className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-sm"
              >
                <option value="false">false</option>
                <option value="true">true</option>
              </select>
            ) : (
              <input
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={fieldPlaceholder(input.type)}
                className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-sm"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReadFunctionCard({ fn }: { fn: AbiFn }) {
  const publicClient = usePublicClient();
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const allValid = fn.inputs.every((input, i) => isArgValid(input.type, values[argKey(input, i)] ?? ""));

  async function query() {
    if (!publicClient) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const args = fn.inputs.map((input, i) => parseArg(input.type, values[argKey(input, i)] ?? ""));
      const res = await publicClient.readContract({
        address: GAME_MANAGER_ADDRESS,
        abi: gameManagerAbi,
        functionName: fn.name,
        args,
      });
      setResult(formatValue(res));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm"
      >
        <span className="font-mono text-slate-200">{fn.name}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3">
          <ArgFields inputs={fn.inputs} values={values} onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))} />
          <button
            onClick={() => void query()}
            disabled={!allValid || loading}
            className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40 hover:enabled:bg-white/20"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Query
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
          {result !== null && (
            <pre className="whitespace-pre-wrap rounded-lg bg-black/30 p-3 font-mono text-xs text-emerald-300">{result}</pre>
          )}
        </div>
      )}
    </div>
  );
}

function WriteFunctionCard({ fn }: { fn: AbiFn }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [nativeValue, setNativeValue] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "signing" | "confirming" | "confirmed" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [hash, setHash] = React.useState<string | null>(null);

  const isPayable = fn.stateMutability === "payable";
  const allValid = fn.inputs.every((input, i) => isArgValid(input.type, values[argKey(input, i)] ?? ""));
  const isRestricted = RESTRICTED_FUNCTIONS.has(fn.name);
  const isBusy = status === "signing" || status === "confirming";

  async function run() {
    if (!publicClient) return;
    setError(null);
    setHash(null);
    setStatus("signing");
    try {
      const args = fn.inputs.map((input, i) => parseArg(input.type, values[argKey(input, i)] ?? ""));
      const txHash = await writeContractAsync({
        address: GAME_MANAGER_ADDRESS,
        abi: gameManagerAbi,
        functionName: fn.name,
        args,
        value: isPayable ? parseEther(nativeValue || "0") : undefined,
      });
      setHash(txHash);
      setStatus("confirming");
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      setStatus("confirmed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm"
      >
        <span className="flex items-center gap-2 font-mono text-slate-200">
          {fn.name}
          {isRestricted && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-sans text-[10px] font-medium text-amber-300">
              <ShieldAlert className="h-3 w-3" /> Restricted
            </span>
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3">
          <ArgFields inputs={fn.inputs} values={values} onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))} />
          {isPayable && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">value (BNB)</label>
              <input
                value={nativeValue}
                onChange={(e) => setNativeValue(e.target.value)}
                placeholder="0.0"
                inputMode="decimal"
                className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-sm"
              />
            </div>
          )}
          <button
            onClick={() => void run()}
            disabled={!allValid || !address || isBusy}
            className="flex w-fit items-center gap-2 rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40 hover:enabled:bg-indigo-400"
          >
            {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {status === "signing" ? "Confirm in wallet..." : status === "confirming" ? "Confirming..." : "Write"}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
          {status === "confirmed" && <p className="text-xs text-emerald-400">Confirmed</p>}
          {hash && (
            <a
              href={`${EXPLORER_BASE}/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
              className="flex w-fit items-center gap-1 text-xs text-indigo-300 hover:underline"
            >
              View on BscScan <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function ContractConsolePage() {
  const { isConnected } = useAccount();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="card-glow rounded-2xl p-5">
        <h1 className="font-gaming mb-1 flex items-center gap-2 text-xl font-semibold">
          <BookOpenText className="h-5 w-5 text-indigo-400" /> GameManager contract
        </h1>
        <p className="mb-3 text-sm text-slate-400">
          Every read and write function on the deployed GameManager contract, generated straight from its ABI - the
          same functions this app calls, exposed directly like BscScan&apos;s Read/Write Contract tabs.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="font-mono">{shortenAddress(GAME_MANAGER_ADDRESS, 6)}</span>
          <a
            href={`${EXPLORER_BASE}/address/${GAME_MANAGER_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-indigo-300 hover:underline"
          >
            View on BscScan <ExternalLink className="h-3 w-3" />
          </a>
          <span className="rounded-full bg-white/10 px-2 py-0.5">BSC Testnet</span>
        </div>
        {!isConnected && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-xs text-slate-500">Connect a wallet to send write transactions - reads work without connecting.</p>
            <ConnectButton />
          </div>
        )}
      </div>

      <Tabs defaultValue="read" className="w-full">
        <TabsList>
          <TabsTrigger value="read" className="flex items-center gap-1.5">
            <BookOpenText className="h-3.5 w-3.5" /> Read Contract
          </TabsTrigger>
          <TabsTrigger value="write" className="flex items-center gap-1.5">
            <PenSquare className="h-3.5 w-3.5" /> Write Contract
          </TabsTrigger>
        </TabsList>
        <TabsContent value="read" className="flex flex-col gap-2">
          {READ_FNS.map((fn) => (
            <ReadFunctionCard key={fn.name} fn={fn} />
          ))}
        </TabsContent>
        <TabsContent value="write" className="flex flex-col gap-2">
          {WRITE_FNS.map((fn) => (
            <WriteFunctionCard key={fn.name} fn={fn} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
