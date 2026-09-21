import { Layers } from "lucide-react";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5" dir="ltr">
      <span className="brand-mark">
        <Layers className="h-5 w-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-[0.18em]">
          DRAVON<span className="text-primary">.</span>
        </span>
      )}
    </span>
  );
}
