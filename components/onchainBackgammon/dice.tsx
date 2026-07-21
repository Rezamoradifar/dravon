"use client";

import { cn } from "@/lib/utils";

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [25, 75], [75, 25], [75, 75]],
  5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
  6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]],
};

/** White is the only skin dark enough on top to need dark pips - every
 * other color theme gets white pips for contrast instead of hand-tuning
 * per-color. */
const DEFAULT_DICE_COLOR = "#ffffff";

function Die({ value, used, colorHex }: { value: number; used: boolean; colorHex: string }) {
  const pipColor = colorHex.toLowerCase() === DEFAULT_DICE_COLOR ? "bg-slate-900" : "bg-white";
  return (
    <div
      className={cn(
        "relative h-9 w-9 shrink-0 rounded-md border shadow-sm transition-opacity",
        used && "opacity-30",
      )}
      style={{ backgroundColor: colorHex }}
    >
      {PIP_LAYOUTS[value]?.map(([x, y], i) => (
        <span
          key={i}
          className={cn("absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full", pipColor)}
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </div>
  );
}

export function DiceTray({
  lastRoll,
  remaining,
  colorHex = DEFAULT_DICE_COLOR,
}: {
  lastRoll: number[];
  remaining: number[];
  colorHex?: string;
}) {
  if (lastRoll.length === 0) return <div className="h-9" />;

  const usedCount = lastRoll.length - remaining.length;
  return (
    <div className="flex items-center gap-1.5">
      {lastRoll.map((value, i) => (
        <Die key={i} value={value} used={i < usedCount} colorHex={colorHex} />
      ))}
    </div>
  );
}
