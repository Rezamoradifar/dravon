"use client";

import * as React from "react";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { AlertTriangle, Globe2, Wallet } from "lucide-react";
import { useAccount, useConnect } from "wagmi";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/contexts/language-context";
import { isWalletConnectConfigured } from "@/lib/wagmi";

type Props = React.ComponentProps<typeof ConnectButton>;

/**
 * A predictable wallet picker even on first-install VPS deployments:
 * - full RainbowKit/WalletConnect when a real Reown Project ID was built in;
 * - injected wallets in their own browser (MetaMask/Trust/etc.);
 * - explicit instructions instead of a Connect button that silently does nothing.
 * No wallet address, key, or Project ID is sent to our server by this component.
 */
export function WalletConnectControl(props: Props) {
  const { isConnected } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const { openConnectModal } = useConnectModal();
  const { locale } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [injectedAvailable, setInjectedAvailable] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    // Wallet discovery and injected provider availability can change after
    // hydration; never read window during server rendering.
    const update = () => {
      const provider = (window as Window & { ethereum?: unknown }).ethereum;
      setInjectedAvailable(Boolean(provider));
    };
    update();
    window.addEventListener("eip6963:announceProvider", update);
    return () => window.removeEventListener("eip6963:announceProvider", update);
  }, []);

  const injectedConnector = connectors.find((connector) => connector.type === "injected");
  const fa = locale === "fa";
  const msg = {
    title: fa ? "اتصال کیف پول" : "Connect a wallet",
    description: fa
      ? "برای اتصال در مرورگر معمولی از WalletConnect استفاده کن، یا سایت را داخل مرورگر کیف پولت باز کن."
      : "Use WalletConnect from a regular browser, or open this site inside your wallet's browser.",
    qr: fa ? "انتخاب کیف پول / QR" : "Choose wallet / Scan QR",
    browser: fa ? "اتصال کیف پول مرورگر" : "Connect browser wallet",
    missing: fa
      ? "شناسه Reown در نسخه نصب‌شده تنظیم نشده. مدیر باید Project ID را ثبت و برنامه را دوباره Build کند."
      : "This deployment has no Reown Project ID. The site administrator must configure it and rebuild the app.",
    noBrowser: fa
      ? "کیف پولی در این مرورگر شناسایی نشد. سایت را در مرورگر MetaMask یا Trust Wallet باز کن."
      : "No browser wallet was detected. Open this site in MetaMask or Trust Wallet's built-in browser.",
    modalUnavailable: fa
      ? "پنجره WalletConnect آماده نیست. تنظیم Project ID و نسخه نصب‌شده را بررسی کنید."
      : "WalletConnect is not ready. Check the Project ID and deployed build.",
    waiting: fa ? "در حال اتصال..." : "Connecting...",
  };

  if (isConnected) {
    return <ConnectButton {...props} />;
  }

  const connectBrowserWallet = async () => {
    if (!injectedConnector || !injectedAvailable) {
      setError(msg.noBrowser);
      return;
    }
    try {
      setError("");
      await connectAsync({ connector: injectedConnector });
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Wallet connection failed");
    }
  };

  const connectViaRainbowKit = () => {
    if (!isWalletConnectConfigured || !openConnectModal) {
      setError(isWalletConnectConfigured ? msg.modalUnavailable : msg.missing);
      return;
    }
    setError("");
    setOpen(false);
    // Let RainbowKit render its own supported wallet list and QR/deep link.
    openConnectModal();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      setOpen(value);
      if (value) setError("");
    }}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="whitespace-nowrap gap-2" data-testid="wallet-connect-open">
          <Wallet className="h-4 w-4" />
          {fa ? "اتصال کیف پول" : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent className="z-[100] max-w-[calc(100vw-1.5rem)] rounded-2xl border-primary/20 bg-background p-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{msg.title}</DialogTitle>
          <DialogDescription>{msg.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {isWalletConnectConfigured ? (
            <Button className="w-full justify-center gap-2" type="button" onClick={connectViaRainbowKit} data-testid="wallet-connect-qr">
              <Globe2 className="h-4 w-4" />
              {msg.qr}
            </Button>
          ) : (
            <p role="status" className="flex gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-200" data-testid="wallet-connect-missing-id">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {msg.missing}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            className="w-full justify-center gap-2"
            onClick={connectBrowserWallet}
            data-testid="wallet-connect-injected"
          >
            <Wallet className="h-4 w-4" />
            {isPending ? msg.waiting : msg.browser}
          </Button>
          {!injectedAvailable && (
            <p className="text-xs leading-5 text-muted-foreground">{msg.noBrowser}</p>
          )}
          {error && (
            <p role="alert" className="rounded-lg border border-destructive/35 bg-destructive/10 p-3 text-sm text-foreground">
              {error}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
