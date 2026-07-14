"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Announcement } from "@/lib/news-content";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

export function AnnouncementSlider({ items }: { items: Announcement[] }) {
  const [index, setIndex] = React.useState(0);
  const { t } = useTranslation();

  React.useEffect(() => {
    const interval = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(interval);
  }, [items.length]);

  const current = items[index];

  return (
    <div className="card-glow relative overflow-hidden rounded-2xl border p-8 sm:p-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.35), transparent 55%)",
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={current.slug}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 max-w-2xl"
        >
          <Badge variant={current.tag === "Feature" ? "success" : "secondary"} className="mb-4">
            {current.tag}
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{current.title}</h2>
          <p className="mt-3 text-muted-foreground">{current.summary}</p>
          <Button asChild className="mt-6 gap-1.5">
            <Link href={current.href}>
              {t("announcementSlider.explore")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mt-8 flex gap-2">
        {items.map((item, i) => (
          <button
            key={item.slug}
            aria-label={t("announcementSlider.showSlide", { n: i + 1 })}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-8 bg-primary" : "w-4 bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
