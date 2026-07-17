"use client";

import * as React from "react";

import {
  readAllNotifications,
  NOTIFICATIONS_EVENT_NAME,
  markAllRead,
  markRead,
  type NotificationEntry,
} from "@/lib/notifications";

export function useNotifications(address?: string) {
  const [entries, setEntries] = React.useState<NotificationEntry[]>([]);

  React.useEffect(() => {
    function refresh() {
      setEntries(readAllNotifications());
    }
    refresh();
    window.addEventListener(NOTIFICATIONS_EVENT_NAME, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(NOTIFICATIONS_EVENT_NAME, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = address
    ? entries.filter((e) => e.owner.toLowerCase() === address.toLowerCase())
    : [];

  const unreadCount = filtered.filter((e) => !e.read).length;

  return {
    entries: filtered,
    unreadCount,
    markAllRead: () => address && markAllRead(address),
    markRead,
  };
}
