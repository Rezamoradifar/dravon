"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Same hydration-mismatch class already found and fixed in RainbowKitWithTheme
 * (app/providers.tsx): `theme` is `undefined` on the server, so the `= "system"`
 * fallback applies there - but next-themes resolves it synchronously on the
 * client before mount, so the client's very first paint can already report
 * "dark" (our configured defaultTheme), never hitting that same fallback.
 * Server renders Sonner with theme="system", client's first paint renders it
 * with theme="dark" - a real mismatch on a component mounted on every page.
 * Gate on mounted so both agree until the real value is safe to use.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const resolvedTheme = mounted ? (theme ?? "system") : "system";

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
