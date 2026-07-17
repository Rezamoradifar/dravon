"use client";

import * as React from "react";
import { useAccount } from "wagmi";

import { useRewardNotifications } from "@/hooks/useRewardNotifications";
import { useTeamNotifications } from "@/hooks/useTeamNotifications";
import { vibrate } from "@/lib/haptics";

/** Mounted once globally - watches the connected wallet's own real on-chain data for reward/referral events. Renders nothing. */
export function NotificationWatchers() {
  const { address, isConnected } = useAccount();
  useRewardNotifications(address);
  useTeamNotifications(address);

  const wasConnected = React.useRef(false);
  React.useEffect(() => {
    if (isConnected && !wasConnected.current) {
      vibrate("success");
    }
    wasConnected.current = isConnected;
  }, [isConnected]);

  return null;
}
