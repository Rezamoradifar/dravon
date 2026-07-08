import { Badge } from "@/components/ui/badge";
import type { LearningTopic } from "@/lib/learning-content";

const RISK_VARIANT: Record<LearningTopic["riskLevel"], "success" | "secondary" | "destructive"> = {
  Low: "success",
  Medium: "secondary",
  High: "destructive",
  "Very High": "destructive",
};

export function RiskBadge({ level }: { level: LearningTopic["riskLevel"] }) {
  return <Badge variant={RISK_VARIANT[level]}>{level} risk</Badge>;
}
