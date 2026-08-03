"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatisticsPanel } from "@/components/statistics/statistics-panel";
import { StageIndicator } from "@/components/shared/stage-indicator";
import { WeeklyWindowCard } from "@/components/shared/weekly-window-card";
import { useTranslation } from "@/contexts/language-context";

export default function StatisticsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("statisticsPage.title")}
        description={t("statisticsPage.description")}
      />
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StageIndicator />
        <WeeklyWindowCard />
      </div>
      <StatisticsPanel />
    </div>
  );
}
