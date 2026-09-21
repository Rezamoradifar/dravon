"use client";
import { Layers } from "lucide-react";
import { useTranslation } from "@/contexts/language-context";

/** Descriptive navigation label, not a product or company name. */
export function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="brand-mark">
        <Layers className="h-5 w-5" aria-hidden="true" />
      </span>
      {!compact && <span className="hidden max-w-[170px] text-sm font-medium leading-6 min-[400px]:inline">{t("nav.brand")}</span>}
    </span>
  );
}
