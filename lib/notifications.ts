export type NotificationKind = "reward" | "referral" | "tx-confirmed" | "tx-failed";

export interface NotificationEntry {
  id: string;
  kind: NotificationKind;
  titleKey: string;
  bodyKey: string;
  bodyParams?: Record<string, string | number>;
  timestamp: number;
  read: boolean;
  /** Wallet this notification belongs to - notifications are always scoped to one address. */
  owner: string;
}

const STORAGE_KEY = "round-dashboard:notifications:v1";
const MAX_ENTRIES = 50;
const EVENT_NAME = "round-dashboard:notifications-updated";

function readAll(): NotificationEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: NotificationEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // ignore quota / private-mode errors
  }
}

export function pushNotification(entry: Omit<NotificationEntry, "id" | "timestamp" | "read">) {
  const entries = readAll();
  const id = `${entry.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  writeAll([{ id, timestamp: Date.now(), read: false, ...entry }, ...entries]);
}

export function markAllRead(owner: string) {
  const entries = readAll();
  writeAll(entries.map((e) => (e.owner.toLowerCase() === owner.toLowerCase() ? { ...e, read: true } : e)));
}

export function markRead(id: string) {
  const entries = readAll();
  writeAll(entries.map((e) => (e.id === id ? { ...e, read: true } : e)));
}

export { readAll as readAllNotifications, EVENT_NAME as NOTIFICATIONS_EVENT_NAME };
