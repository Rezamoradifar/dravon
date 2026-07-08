import { PageHeader } from "@/components/shared/page-header";
import { StatisticsPanel } from "@/components/statistics/statistics-panel";

export default function StatisticsPage() {
  return (
    <div>
      <PageHeader
        title="Statistics"
        description="Round-level statistics via getMainBulkInfo(roundsAgo)."
      />
      <StatisticsPanel />
    </div>
  );
}
