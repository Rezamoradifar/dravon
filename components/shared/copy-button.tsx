"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  const { t } = useTranslation();

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6 shrink-0", className)}
      aria-label={t("sharedComponents.copyToClipboard")}
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}
