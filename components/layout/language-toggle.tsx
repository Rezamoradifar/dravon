"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 px-2.5"
      aria-label={t("common.toggleLanguage")}
      onClick={() => setLocale(locale === "fa" ? "en" : "fa")}
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs font-medium">{locale === "fa" ? "EN" : "فا"}</span>
    </Button>
  );
}
