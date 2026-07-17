"use client";

import * as React from "react";
import { zeroAddress, type Address } from "viem";

import { useUserTree } from "@/hooks/useUserTree";
import { pushNotification } from "@/lib/notifications";
import { vibrate } from "@/lib/haptics";
import { shortenAddress } from "@/lib/format";

const TREE_LEN = 3; // root (self) + direct child (index 1) + referral child (index 2)

function storageKey(address: string) {
  return `round-dashboard:last-seen-direct-team:${address.toLowerCase()}`;
}

function readLastSeen(address: string): string[] | null {
  try {
    const raw = window.localStorage.getItem(storageKey(address));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLastSeen(address: string, addresses: string[]) {
  try {
    window.localStorage.setItem(storageKey(address), JSON.stringify(addresses));
  } catch {
    // ignore quota / private-mode errors
  }
}

/**
 * Watches the connected wallet's own direct binary slots (getUserTree(addr, 3) -
 * just the root plus its two immediate children) for a slot filling in, and
 * pushes a private "new referral joined your team" notification. Only ever
 * reads the user's own two direct slots - never a full subtree - so this stays
 * cheap regardless of team size, and never surfaces anyone else's data.
 */
export function useTeamNotifications(address?: Address) {
  const { addresses } = useUserTree(address && address !== zeroAddress ? address : undefined, TREE_LEN);
  const initialized = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!address || !addresses || addresses.length < 3) return;

    const current = addresses.slice(1, 3);
    const last = readLastSeen(address);

    if (initialized.current !== address) {
      initialized.current = address;
      if (!last) {
        writeLastSeen(address, current);
        return;
      }
    }

    if (!last) {
      writeLastSeen(address, current);
      return;
    }

    current.forEach((addr, i) => {
      const wasEmpty = !last[i] || last[i].toLowerCase() === zeroAddress;
      const isFilled = addr && addr.toLowerCase() !== zeroAddress;
      if (wasEmpty && isFilled) {
        pushNotification({
          kind: "referral",
          owner: address,
          titleKey: "notifications.newReferral",
          bodyKey: "notifications.newReferralBody",
          bodyParams: { address: shortenAddress(addr, 4) },
        });
        vibrate("success");
      }
    });

    if (JSON.stringify(current) !== JSON.stringify(last)) {
      writeLastSeen(address, current);
    }
  }, [address, addresses]);
}
