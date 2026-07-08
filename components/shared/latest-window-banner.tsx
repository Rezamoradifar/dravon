"use client";

import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddressPill } from "@/components/shared/address-pill";
import { useDashboardData } from "@/hooks/useDashboardData";
import { WINDOW_ADDRESS } from "@/contracts/addresses";

export function LatestWindowBanner() {
  const { latestWindow, isLoading } = useDashboardData();

  if (isLoading || !latestWindow) return null;
  if (latestWindow.toLowerCase() === WINDOW_ADDRESS.toLowerCase()) return null;

  return (
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>A newer round window is available</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center gap-2">
        <span>This app is configured for an older window. The latest window is</span>
        <AddressPill address={latestWindow} />
      </AlertDescription>
    </Alert>
  );
}
