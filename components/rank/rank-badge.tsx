import type { RankTier } from "@/lib/ranks";
import { useTranslation } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

export function RankBadge({ tier, size = "md" }: { tier: RankTier; size?: "sm" | "md" | "lg" }) {
  const { t } = useTranslation();
  const Icon = tier.icon;

  const sizeClasses = {
    sm: "h-6 w-6 p-1",
    md: "h-9 w-9 p-1.5",
    lg: "h-14 w-14 p-2.5",
  }[size];

  const iconSizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  }[size];

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full", sizeClasses)}
      style={{
        backgroundColor: `color-mix(in srgb, ${tier.colorToken} 18%, transparent)`,
        color: tier.colorToken,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tier.colorToken} 35%, transparent)`,
      }}
      title={t(tier.labelKey)}
    >
      <Icon className={iconSizeClasses} />
    </span>
  );
}
