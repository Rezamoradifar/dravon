"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatisticsPanel } from "@/components/statistics/statistics-panel";
import { useTranslation } from "@/contexts/language-context";

export default function StatisticsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("statisticsPage.title")}
        description={t("statisticsPage.description")}
      />
      <StatisticsPanel />
    </div>
  );
}
