const RELOAD_KEY = "round-dashboard:chunk-reload-attempted";

function isChunkLoadError(message: string): boolean {
  return /loading chunk [\w.-]+ failed|chunkloaderror/i.test(message);
}

/**
 * A stale tab still holding an old build's HTML references a _next/static
 * chunk hash that a newer deploy has since replaced and deleted - that 404s
 * as "Loading chunk X failed" (a React error boundary catches this when it
 * comes from a next/dynamic import). One reload fetches the current HTML
 * with correct hashes and silently fixes it. Guarded by sessionStorage so a
 * genuinely broken deploy still surfaces the error instead of loop-reloading.
 */
export function tryRecoverFromChunkError(error: Error): boolean {
  if (!isChunkLoadError(error.message || "")) return false;
  try {
    if (sessionStorage.getItem(RELOAD_KEY)) return false;
    sessionStorage.setItem(RELOAD_KEY, "1");
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}
