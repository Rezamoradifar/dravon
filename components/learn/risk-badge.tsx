"use client";

import { Badge } from "@/components/ui/badge";
import type { LearningTopic } from "@/lib/learning-content";
import { useTranslation } from "@/contexts/language-context";

const RISK_VARIANT: Record<LearningTopic["riskLevel"], "success" | "secondary" | "destructive"> = {
  Low: "success",
  Medium: "secondary",
  High: "destructive",
  "Very High": "destructive",
};

export function RiskBadge({ level }: { level: LearningTopic["riskLevel"] }) {
  const { t } = useTranslation();
  return <Badge variant={RISK_VARIANT[level]}>{level}{t("riskBadge.suffix")}</Badge>;
}
