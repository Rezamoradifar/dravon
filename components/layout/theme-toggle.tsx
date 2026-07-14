"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/language-context";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button variant="outline" size="icon" aria-label={t("common.toggleTheme")} disabled />;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={t("common.toggleTheme")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden dark:block" />
      <Moon className="block dark:hidden" />
    </Button>
  );
}
