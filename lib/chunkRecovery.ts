const RELOAD_KEY = "round-dashboard:chunk-reload-attempted";

/**
 * Webpack's own ChunkLoadError sets `error.name` to "ChunkLoadError" but often
 * leaves `error.message` EMPTY (confirmed in production: the caught error's
 * printed text was the bare string "ChunkLoadError" with no message at all) -
 * checking only `.message` missed exactly the shape this is meant to catch.
 * Check name, message, and stack so any of the three forms is recognized.
 */
function isChunkLoadError(error: Error): boolean {
  const haystack = `${error.name || ""} ${error.message || ""} ${error.stack || ""}`;
  return /chunkloaderror|loading chunk [\w.-]+ failed/i.test(haystack);
}

/**
 * A stale tab still holding an old build's HTML references a _next/static
 * chunk hash that a newer deploy has since replaced and deleted - that 404s
 * as a ChunkLoadError (a React error boundary catches this when it comes
 * from a next/dynamic import). One reload fetches the current HTML with
 * correct hashes and silently fixes it. Guarded by sessionStorage so a
 * genuinely broken deploy still surfaces the error instead of loop-reloading.
 */
export function tryRecoverFromChunkError(error: Error): boolean {
  if (!isChunkLoadError(error)) return false;
  try {
    if (sessionStorage.getItem(RELOAD_KEY)) return false;
    sessionStorage.setItem(RELOAD_KEY, "1");
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}
