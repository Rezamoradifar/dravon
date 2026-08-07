"use client";

import * as React from "react";
import { MessageCircleQuestion, X, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAssistantKnowledge } from "@/lib/assistant-knowledge";
import { searchAssistant, type AssistantMatch } from "@/lib/assistant-search";
import { useTranslation } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface Turn {
  question: string;
  matches: AssistantMatch[];
}

export function AskAssistant() {
  const { t, locale } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [turns, setTurns] = React.useState<Turn[]>([]);

  function handleAsk(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    const matches = searchAssistant(q, getAssistantKnowledge(locale));
    setTurns((prev) => [...prev, { question: q, matches }]);
    setQuery("");
  }

  return (
    <div className="fixed bottom-5 end-5 z-50">
      {open && (
        <Card className="card-glow mb-3 flex h-[28rem] w-[22rem] max-w-[90vw] flex-col overflow-hidden">
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div>
                <CardTitle className="text-sm">{t("assistant.title")}</CardTitle>
                <CardDescription className="text-xs">{t("assistant.subtitle")}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)} aria-label={t("assistant.close")}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 space-y-4 overflow-y-auto p-3 scrollbar-thin">
            {turns.length === 0 && (
              <p className="text-xs text-muted-foreground">{t("assistant.hint")}</p>
            )}
            {turns.map((turn, i) => (
              <div key={i} className="space-y-2">
                <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                  {turn.question}
                </p>
                {turn.matches.length === 0 ? (
                  <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    {t("assistant.noMatch")}
                  </p>
                ) : (
                  turn.matches.map((m, j) => (
                    <div key={j} className="rounded-lg border border-border/60 bg-card/60 px-3 py-2">
                      {j === 0 ? null : (
                        <p className="mb-1 text-[11px] font-medium text-muted-foreground">{m.question}</p>
                      )}
                      <p className="text-xs leading-relaxed">{m.answer}</p>
                    </div>
                  ))
                )}
              </div>
            ))}
          </CardContent>

          <form onSubmit={handleAsk} className="flex items-center gap-2 border-t border-border/60 p-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("assistant.placeholder")}
              className="h-9 text-sm"
            />
            <Button type="submit" size="icon" className="h-9 w-9 shrink-0" aria-label={t("assistant.send")}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}

      <Button
        type="button"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("assistant.title")}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg shadow-primary/30 transition-transform hover:scale-105",
          open && "rotate-90",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircleQuestion className="h-6 w-6" />}
      </Button>
    </div>
  );
}
