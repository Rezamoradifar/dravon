import { RANK_TIERS } from "@/lib/ranks";
import { RankBadge } from "@/components/rank/rank-badge";
import { useTranslation } from "@/contexts/language-context";
import type { RankHistoryEntry } from "@/lib/rank-history";

export function RankHistoryList({ history }: { history: RankHistoryEntry[] }) {
  const { t, locale } = useTranslation();

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("rank.upgradeHistory")}
      </p>
      <ul className="space-y-2">
        {history.slice(0, 5).map((entry) => {
          const tier = RANK_TIERS.find((r) => r.id === entry.tierId);
          if (!tier) return null;
          return (
            <li key={entry.timestamp} className="flex items-center gap-2 text-sm">
              <RankBadge tier={tier} size="sm" />
              <span className="flex-1 truncate">{t(tier.labelKey)}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(entry.timestamp).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
