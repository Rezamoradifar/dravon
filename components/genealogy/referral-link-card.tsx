"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { Link2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/shared/copy-button";
import { useTranslation } from "@/contexts/language-context";

export function ReferralLinkCard() {
  const { address } = useAccount();
  const { t } = useTranslation();
  const [origin, setOrigin] = React.useState("");

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!address) {
    return (
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-4 w-4" /> {t("referralLink.title")}
          </CardTitle>
          <CardDescription>{t("referralLink.connectPrompt")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const link = `${origin}/register?ref=${address}`;

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4" /> {t("referralLink.title")}
        </CardTitle>
        <CardDescription>{t("referralLink.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-lg border bg-white p-3">
          {origin && <QRCodeSVG value={link} size={120} />}
        </div>
        <div className="flex w-full items-center gap-2">
          <Input readOnly value={link} className="font-mono text-xs" />
          <CopyButton value={link} />
        </div>
      </CardContent>
    </Card>
  );
}
