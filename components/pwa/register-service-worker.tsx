"use client";

import * as React from "react";

/** Registers public/sw.js - required (along with the manifest) for Chrome/
 * Android to consider the site installable and fire `beforeinstallprompt`. */
export function RegisterServiceWorker() {
  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
