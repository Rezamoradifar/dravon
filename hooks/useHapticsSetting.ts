"use client";

import * as React from "react";
import { isHapticsEnabled, setHapticsEnabled } from "@/lib/haptics";

export function useHapticsSetting() {
  const [enabled, setEnabled] = React.useState(true);

  React.useEffect(() => {
    function refresh() {
      setEnabled(isHapticsEnabled());
    }
    refresh();
    window.addEventListener("round-dashboard:haptics-changed", refresh);
    return () => window.removeEventListener("round-dashboard:haptics-changed", refresh);
  }, []);

  const toggle = React.useCallback((value: boolean) => {
    setHapticsEnabled(value);
    setEnabled(value);
  }, []);

  return { enabled, setEnabled: toggle };
}
