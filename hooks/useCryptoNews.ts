"use client";

import * as React from "react";

import type { NewsItem } from "@/app/api/news/route";

const POLL_INTERVAL_MS = 5 * 60_000;

interface NewsResponse {
  ok: boolean;
  items: NewsItem[];
  source?: string;
  error?: string;
}

export function useCryptoNews() {
  const [items, setItems] = React.useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        const json: NewsResponse = await res.json();
        if (cancelled) return;
        if (json.ok) {
          setItems(json.items);
          setError(null);
        } else {
          setError(json.error ?? "Failed to load news");
        }
      } catch {
        if (!cancelled) setError("Failed to load news");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { items, isLoading, error };
}
