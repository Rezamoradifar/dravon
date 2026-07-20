import { cn } from "@/lib/utils";
import type { Player } from "@/lib/backgammon/types";

export function Checker({ owner, className }: { owner: Player; className?: string }) {
  return (
    <div
      className={cn(
        "h-[85%] w-[85%] max-h-7 max-w-7 shrink-0 rounded-full border-2 shadow-md",
        owner === "white" ? "border-slate-300 bg-slate-100" : "border-slate-700 bg-slate-900",
        className,
      )}
      aria-hidden="true"
    />
  );
}
