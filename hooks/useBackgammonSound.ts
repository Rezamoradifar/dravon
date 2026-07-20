"use client";

import * as React from "react";

import { isSoundEnabled, setSoundEnabled } from "@/lib/backgammon/sound";

export function useBackgammonSound() {
  const [enabled, setEnabled] = React.useState(true);

  React.useEffect(() => {
    setEnabled(isSoundEnabled());
  }, []);

  const toggle = React.useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      return next;
    });
  }, []);

  return { enabled, toggle };
}
