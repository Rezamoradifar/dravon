"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RoundOverviewCards } from "@/components/dashboard/round-overview-cards";

export function StatisticsPanel() {
  const [roundsAgoInput, setRoundsAgoInput] = React.useState("0");
  const [roundsAgo, setRoundsAgo] = React.useState(0);

  function handleApply() {
    const parsed = Number(roundsAgoInput);
    if (Number.isInteger(parsed) && parsed >= 0) setRoundsAgo(parsed);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="roundsAgo">Rounds ago</Label>
          <Input
            id="roundsAgo"
            className="w-32"
            inputMode="numeric"
            value={roundsAgoInput}
            onChange={(e) => setRoundsAgoInput(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handleApply}>
          Load round
        </Button>
      </div>

      <RoundOverviewCards roundsAgo={roundsAgo} />
    </div>
  );
}
