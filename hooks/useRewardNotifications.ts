"use client";

import * as React from "react";
import { zeroAddress, type Address } from "viem";

import { useUserBulkInfo } from "@/hooks/useUserBulkInfo";
import { pushNotification } from "@/lib/notifications";
import { vibrate } from "@/lib/haptics";

function storageKey(address: string) {
  return `round-dashboard:last-seen-earned:${address.toLowerCase()}`;
}

function readLastSeen(address: string): { dirEarned: number; binaryEarned: number } | null {
  try {
    const raw = window.localStorage.getItem(storageKey(address));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLastSeen(address: string, dirEarned: number, binaryEarned: number) {
  try {
    window.localStorage.setItem(storageKey(address), JSON.stringify({ dirEarned, binaryEarned }));
  } catch {
    // ignore quota / private-mode errors
  }
}

/**
 * Watches the connected wallet's own getUserBulkInfo() for real increases in
 * dirEarned/binaryEarned and pushes a private notification when they grow.
 * Mounted once (globally) for the connected address; no data is fabricated -
 * this only reacts to values the contract itself already returns.
 */
export function useRewardNotifications(address?: Address) {
  const { info } = useUserBulkInfo(address && address !== zeroAddress ? address : undefined);
  const initialized = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!address || !info) return;

    const dirEarned = Number(info.dirEarned) || 0;
    const binaryEarned = Number(info.binaryEarned) || 0;
    const last = readLastSeen(address);

    if (initialized.current !== address) {
      initialized.current = address;
      if (!last) {
        writeLastSeen(address, dirEarned, binaryEarned);
        return;
      }
    }

    if (!last) {
      writeLastSeen(address, dirEarned, binaryEarned);
      return;
    }

    const dirDelta = dirEarned - last.dirEarned;
    const binaryDelta = binaryEarned - last.binaryEarned;

    if (dirDelta > 0 || binaryDelta > 0) {
      pushNotification({
        kind: "reward",
        owner: address,
        titleKey: "notifications.rewardReceived",
        bodyKey: "notifications.rewardReceivedBody",
        bodyParams: { amount: (dirDelta + binaryDelta).toFixed(2) },
      });
      vibrate("success");
    }

    if (dirDelta !== 0 || binaryDelta !== 0) {
      writeLastSeen(address, dirEarned, binaryEarned);
    }
  }, [address, info]);
}
