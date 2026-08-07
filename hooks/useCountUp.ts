"use client";

import * as React from "react";

/** Animates smoothly from the previous value to `target` whenever it changes. */
export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = React.useState(target);
  const fromRef = React.useRef(target);

  React.useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    let raf: number;
    let start: number | null = null;

    function tick(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}
