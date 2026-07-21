import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function LevelBadge({ level, className }: { level: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300",
        className,
      )}
    >
      <Star className="h-3 w-3" />
      Lv {level}
    </span>
  );
}
