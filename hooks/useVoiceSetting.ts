"use client";

import * as React from "react";
import { isVoiceEnabled, setVoiceEnabled } from "@/lib/voice";

export function useVoiceSetting() {
  const [enabled, setEnabled] = React.useState(true);

  React.useEffect(() => {
    function refresh() {
      setEnabled(isVoiceEnabled());
    }
    refresh();
    window.addEventListener("round-dashboard:voice-changed", refresh);
    return () => window.removeEventListener("round-dashboard:voice-changed", refresh);
  }, []);

  const toggle = React.useCallback((value: boolean) => {
    setVoiceEnabled(value);
    setEnabled(value);
  }, []);

  return { enabled, setEnabled: toggle };
}
