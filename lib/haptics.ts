const STORAGE_KEY = "round-dashboard:haptics-enabled:v1";

export function isHapticsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

export function setHapticsEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
    window.dispatchEvent(new Event("round-dashboard:haptics-changed"));
  } catch {
    // ignore quota / private-mode errors
  }
}

type HapticPattern = "success" | "warning" | "error" | "tap";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  success: [20, 40, 20],
  warning: [15, 30, 15, 30, 15],
  error: [40],
  tap: [10],
};

/** Fires a short vibration if the browser supports it and the user hasn't disabled it. Never throws. */
export function vibrate(pattern: HapticPattern) {
  if (typeof window === "undefined") return;
  if (!isHapticsEnabled()) return;
  try {
    window.navigator.vibrate?.(PATTERNS[pattern]);
  } catch {
    // Vibration API unsupported or blocked - silently no-op
  }
}
