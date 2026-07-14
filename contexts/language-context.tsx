"use client";

import * as React from "react";

import { en, type Dictionary } from "@/lib/i18n/en";
import { fa } from "@/lib/i18n/fa";

export type Locale = "en" | "fa";

const dictionaries: Record<Locale, Dictionary> = { en, fa };

const STORAGE_KEY = "round-dashboard:locale:v1";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
  t: (path: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

function getNested(source: unknown, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
  return typeof value === "string" ? value : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in params ? String(params[key]) : match,
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "fa") setLocaleState(stored);
    } catch {
      // ignore private-mode / quota errors
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore private-mode / quota errors
    }
  }, []);

  const t = React.useCallback(
    (path: string, params?: Record<string, string | number>) =>
      interpolate(getNested(dictionaries[locale], path) ?? getNested(dictionaries.en, path) ?? path, params),
    [locale],
  );

  const value = React.useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, dir: locale === "fa" ? "rtl" : "ltr", t }),
    [locale, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useTranslation() {
  const { t, locale } = useLanguage();
  return { t, locale };
}
