"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/language-context";
export function AccountReadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return <Card><CardContent className="space-y-3 py-6" role="alert">
    <p className="text-sm text-destructive">{t("improvements.readFailed")}</p>
    <Button variant="outline" onClick={onRetry}>{t("improvements.retry")}</Button>
  </CardContent></Card>;
}
