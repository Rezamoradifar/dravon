"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/language-context";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">{t("notFoundPage.title")}</h1>
      <p className="text-muted-foreground">{t("notFoundPage.description")}</p>
      <Button asChild>
        <Link href="/">{t("notFoundPage.backToDashboard")}</Link>
      </Button>
    </div>
  );
}
