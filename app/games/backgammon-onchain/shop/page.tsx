"use client";

import * as React from "react";
import { useAccount, usePublicClient, useSendTransaction, useWriteContract } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Check, Dices, LayoutGrid, Loader2 } from "lucide-react";

import { useAuth } from "@/lib/onchainBackgammon/auth";
import { apiFetch, type ShopCatalogItem, type ShopMe } from "@/lib/onchainBackgammon/api";
import { SHOP_TREASURY_ADDRESS, MOCK_USDT_ADDRESS } from "@/contracts/onchainBackgammon/addresses";
import { cn } from "@/lib/utils";
import erc20Abi from "@/contracts/onchainBackgammon/abi/MockUSDT.json";

const USDT_DECIMALS = 6;

export default function ShopPage() {
  const { isConnected } = useAccount();
  const { isAuthenticated, isSigningIn, login, token } = useAuth();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const [items, setItems] = React.useState<ShopCatalogItem[] | null>(null);
  const [me, setMe] = React.useState<ShopMe | null>(null);
  const [busyItemId, setBusyItemId] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiFetch<ShopCatalogItem[]>("/shop/items").then(setItems).catch(() => setItems([]));
  }, []);

  const refreshMe = React.useCallback(() => {
    if (!token) return;
    apiFetch<ShopMe>("/shop/me", { token }).then(setMe).catch(() => {});
  }, [token]);

  React.useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  async function buy(item: ShopCatalogItem, asset: "BNB" | "USDT") {
    if (!token || !publicClient) return;
    setErrorMessage(null);
    setBusyItemId(item.id);
    try {
      let hash: `0x${string}`;
      if (asset === "BNB") {
        hash = await sendTransactionAsync({ to: SHOP_TREASURY_ADDRESS, value: parseEther(item.priceBnb) });
      } else {
        hash = await writeContractAsync({
          address: MOCK_USDT_ADDRESS,
          abi: erc20Abi,
          functionName: "transfer",
          args: [SHOP_TREASURY_ADDRESS, parseUnits(item.priceUsdt, USDT_DECIMALS)],
        });
      }
      await publicClient.waitForTransactionReceipt({ hash });
      await apiFetch("/shop/purchase", {
        method: "POST",
        token,
        body: JSON.stringify({ itemId: item.id, txHash: hash, token: asset }),
      });
      refreshMe();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setBusyItemId(null);
    }
  }

  async function equip(item: ShopCatalogItem) {
    if (!token) return;
    setErrorMessage(null);
    setBusyItemId(item.id);
    try {
      await apiFetch("/shop/equip", { method: "POST", token, body: JSON.stringify({ itemId: item.id }) });
      refreshMe();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to equip");
    } finally {
      setBusyItemId(null);
    }
  }

  const diceItems = items?.filter((i) => i.slot === "DICE") ?? [];
  const boardItems = items?.filter((i) => i.slot === "BOARD") ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold">Cosmetics Shop</h1>
      <p className="mb-6 text-sm text-slate-400">
        Purely visual dice and board skins, paid for with a real on-chain BNB or USDT transaction. No gameplay
        advantage - just a different look at the table.
      </p>

      {!isConnected ? (
        <ConnectButton />
      ) : !isAuthenticated ? (
        <button
          onClick={() => void login()}
          disabled={isSigningIn}
          className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSigningIn ? "Signing in..." : "Sign in to buy or equip skins"}
        </button>
      ) : (
        <>
          {errorMessage && <p className="mb-4 text-sm text-red-400">{errorMessage}</p>}

          <Section title="Dice skins" icon={Dices} items={diceItems} me={me} busyItemId={busyItemId} onBuy={buy} onEquip={equip} />
          <Section title="Board skins" icon={LayoutGrid} items={boardItems} me={me} busyItemId={busyItemId} onBuy={buy} onEquip={equip} />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  items,
  me,
  busyItemId,
  onBuy,
  onEquip,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ShopCatalogItem[];
  me: ShopMe | null;
  busyItemId: string | null;
  onBuy: (item: ShopCatalogItem, asset: "BNB" | "USDT") => void;
  onEquip: (item: ShopCatalogItem) => void;
}) {
  return (
    <div className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
        <Icon className="h-4 w-4" />
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => {
          const owned = me?.owned.includes(item.id) ?? false;
          const equipped = item.slot === "DICE" ? me?.equipped.dice === item.id : me?.equipped.board === item.id;
          const isFree = item.priceBnb === "0";
          const isBusy = busyItemId === item.id;

          return (
            <div
              key={item.id}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-4",
                equipped ? "border-indigo-400/50 bg-indigo-500/10" : "border-white/10 bg-white/5",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 shrink-0 rounded-full border border-white/20" style={{ backgroundColor: item.colorHex }} />
                <p className="text-sm font-medium">{item.name}</p>
                {equipped && <Check className="ml-auto h-4 w-4 text-indigo-400" />}
              </div>

              {!isFree && <p className="text-xs text-slate-400">{item.priceBnb} BNB / {item.priceUsdt} USDT</p>}

              {owned ? (
                <button
                  onClick={() => onEquip(item)}
                  disabled={equipped || isBusy}
                  className="mt-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                >
                  {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : equipped ? "Equipped" : "Equip"}
                </button>
              ) : (
                <div className="mt-1 flex gap-2">
                  <button
                    onClick={() => onBuy(item, "BNB")}
                    disabled={isBusy}
                    className="flex-1 rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {isBusy ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : "Buy with BNB"}
                  </button>
                  <button
                    onClick={() => onBuy(item, "USDT")}
                    disabled={isBusy}
                    className="flex-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {isBusy ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : "Buy with USDT"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
