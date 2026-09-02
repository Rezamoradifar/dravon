"use client";

import * as React from "react";
import { useAccount } from "wagmi";

import { useWalletSignature } from "@/hooks/useWalletSignature";
import type { VpnAccount } from "@/lib/vpn/types";

/**
 * Loads the caller's own NodeShield account (or null if they've never paid).
 * Shared by the purchase card (to know the current device count so "renew"
 * vs "add extra" can compute the right target count) and the "My VPN" panel
 * - lifted here so both use one signature prompt instead of two. Callers
 * that need to refresh after an action (e.g. a successful payment) call the
 * returned `reload()` directly rather than bumping an external token.
 */
export function useVpnAccount() {
  const { address, isConnected } = useAccount();
  const { signWalletAction } = useWalletSignature();
  const [account, setAccount] = React.useState<VpnAccount | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      const { timestamp, signature } = await signWalletAction();
      const res = await fetch("/api/vpn/my-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, timestamp, signature }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load account");
      setAccount(json.account ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load account");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  React.useEffect(() => {
    if (isConnected) reload();
    else setAccount(null);
  }, [isConnected, reload]);

  return { account, isLoading, error, reload };
}
