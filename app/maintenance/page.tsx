"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

import { useTranslation } from "@/contexts/language-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();

  const [message, setMessage] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "submitted">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim() || status === "submitting") return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          contact: contact || undefined,
          walletAddress: isConnected ? address : undefined,
        }),
      });
      if (!response.ok) throw new Error("request failed");
      setStatus("submitted");
    } catch {
      setStatus("idle");
      toast.error(t("maintenance.error"));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("maintenance.title")}</h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            {t("maintenance.description")}
          </p>
        </div>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">{t("maintenance.formTitle")}</CardTitle>
            {isConnected && address && (
              <CardDescription>
                {t("maintenance.walletDetected", {
                  address: `${address.slice(0, 6)}...${address.slice(-4)}`,
                })}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {status === "submitted" ? (
              <div className="space-y-4 py-4 text-center">
                <p className="text-sm font-medium text-success">{t("maintenance.submitted")}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMessage("");
                    setContact("");
                    setStatus("idle");
                  }}
                >
                  {t("maintenance.submitAnother")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback-message">{t("maintenance.messageLabel")}</Label>
                  <Textarea
                    id="feedback-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={t("maintenance.messagePlaceholder")}
                    maxLength={4000}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-contact">{t("maintenance.contactLabel")}</Label>
                  <Input
                    id="feedback-contact"
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder={t("maintenance.contactPlaceholder")}
                    maxLength={200}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={status === "submitting" || !message.trim()}>
                  {status === "submitting" ? t("maintenance.submitting") : t("maintenance.submit")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
