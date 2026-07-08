"use client";

import * as React from "react";

export interface ActivityEntry {
  hash: string;
  functionName: string;
  from: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
}

const STORAGE_KEY = "round-dashboard:activity-log:v1";
const MAX_ENTRIES = 50;
const EVENT_NAME = "round-dashboard:activity-log-updated";

function readAll(): ActivityEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: ActivityEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // ignore quota / private-mode errors
  }
}

/** Records transactions this browser has submitted, for the dashboard's Activity panel. */
export function logActivity(entry: Omit<ActivityEntry, "timestamp" | "status"> & { status?: ActivityEntry["status"] }) {
  const entries = readAll();
  writeAll([{ timestamp: Date.now(), status: "pending", ...entry }, ...entries]);
}

export function updateActivityStatus(hash: string, status: ActivityEntry["status"]) {
  const entries = readAll();
  writeAll(entries.map((e) => (e.hash === hash ? { ...e, status } : e)));
}

export function useActivityLog(address?: string) {
  const [entries, setEntries] = React.useState<ActivityEntry[]>([]);

  React.useEffect(() => {
    function refresh() {
      setEntries(readAll());
    }
    refresh();
    window.addEventListener(EVENT_NAME, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT_NAME, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = address
    ? entries.filter((e) => e.from.toLowerCase() === address.toLowerCase())
    : entries;

  return filtered;
}
