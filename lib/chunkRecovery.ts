// Shared with the pre-hydration handler in app/layout.tsx.
const RELOAD_KEY = "dravon:chunk-recovery:v2";
const COOLDOWN_MS = 5 * 60 * 1000;

export function isChunkLoadError(error: Error): boolean {
  const detail = `${error.name || ""} ${error.message || ""} ${error.stack || ""}`;
  return /chunkloaderror|loading (?:css )?chunk [\w.-]+ failed/i.test(detail);
}

/** Fetch fresh HTML rather than retrying imports from the broken document. */
export function reloadFreshDocument(): void {
  const url = new URL(window.location.href);
  url.searchParams.set("_dravon_reload", String(Date.now()));
  window.location.replace(url.toString());
}

/** Automatic recovery is bounded; a missing server asset must still be repaired. */
export function tryRecoverFromChunkError(error: Error): boolean {
  if (!isChunkLoadError(error) || navigator.onLine === false) return false;
  try {
    const previous = Number(sessionStorage.getItem(RELOAD_KEY));
    const now = Date.now();
    if (previous && now - previous < COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(now));
  } catch {
    // Without persistent loop protection, leave recovery to the user's button.
    return false;
  }
  reloadFreshDocument();
  return true;
}

export function retryAfterError(error: Error, reset: () => void): void {
  if (!isChunkLoadError(error)) {
    reset();
    return;
  }
  // A manual attempt also consumes the automatic retry budget for the new page.
  try { sessionStorage.setItem(RELOAD_KEY, String(Date.now())); } catch { /* optional */ }
  reloadFreshDocument();
}
