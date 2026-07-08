"use client";

import * as React from "react";

export interface RegisterPreset {
  name: string;
  startBox: string;
  valueBnb: string;
  direct: string;
  referral: string;
}

const STORAGE_KEY = "round-dashboard:register-presets:v1";

const DEFAULT_PRESETS: RegisterPreset[] = [
  { name: "Starter", startBox: "", valueBnb: "", direct: "", referral: "" },
  { name: "Professional", startBox: "", valueBnb: "", direct: "", referral: "" },
  { name: "Enterprise", startBox: "", valueBnb: "", direct: "", referral: "" },
];

/**
 * The contract ABI has no package/price registry, so there is nothing on-chain
 * to read "packages" from. This stores the user's OWN previously-used
 * startBox/value/sponsor combinations locally (per-browser) under editable
 * labels, so they can be reused with one click. Nothing here is fetched from
 * or asserted to be sourced from the blockchain.
 */
export function useSavedPresets() {
  const [presets, setPresets] = React.useState<RegisterPreset[]>(DEFAULT_PRESETS);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPresets(JSON.parse(raw));
    } catch {
      // ignore malformed local storage
    }
    setHydrated(true);
  }, []);

  const save = React.useCallback((index: number, preset: RegisterPreset) => {
    setPresets((prev) => {
      const next = [...prev];
      next[index] = preset;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota / private-mode errors
      }
      return next;
    });
  }, []);

  return { presets, save, hydrated };
}
