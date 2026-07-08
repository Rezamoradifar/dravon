"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";
import { useRoundsHistory } from "@/hooks/useRoundsHistory";

export function ExportCsvButton() {
  const { points, isLoading } = useRoundsHistory(20);

  function handleExport() {
    downloadCsv(
      `round-history-${Date.now()}.csv`,
      points.map((p) => ({
        roundsAgo: p.roundsAgo,
        userCount: p.userCount,
        roundPoints: p.roundPoints,
        roundEnteredUSD: p.roundEnteredUSD,
        allEnteredUSD: p.allEnteredUSD,
      })),
    );
  }

  return (
    <Button type="button" variant="outline" className="gap-1.5" disabled={isLoading || points.length === 0} onClick={handleExport}>
      <Download className="h-4 w-4" /> Export round history CSV
    </Button>
  );
}
