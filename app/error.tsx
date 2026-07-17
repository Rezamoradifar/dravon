"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/contexts/language-context";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  React.useEffect(() => {
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="card-glow w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <p className="text-lg font-semibold">{t("errorBoundary.title")}</p>
          <p className="max-w-md text-sm text-muted-foreground">{t("errorBoundary.body")}</p>
          <div className="mt-1 w-full overflow-x-auto rounded-lg bg-muted/40 p-3 text-start font-mono text-xs text-muted-foreground">
            {error.message || t("errorBoundary.unknown")}
            {error.digest && <div className="mt-1 opacity-60">digest: {error.digest}</div>}
          </div>
          <Button onClick={() => reset()} className="mt-2 gap-1.5">
            <RotateCcw className="h-4 w-4" />
            {t("errorBoundary.retry")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
