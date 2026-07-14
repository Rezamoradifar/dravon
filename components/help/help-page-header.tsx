"use client";

import { PageHeader } from "@/components/shared/page-header";
import { useTranslation } from "@/contexts/language-context";

export function HelpPageHeader() {
  const { t } = useTranslation();
  return <PageHeader title={t("helpPage.title")} description={t("helpPage.description")} />;
}
