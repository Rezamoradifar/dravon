"use client";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useExperienceCopy } from "@/lib/experience-copy";
import { WalletButton } from "./wallet-button";
export function WorkspaceHero({
  kind = "dashboard",
}: {
  kind?: "dashboard" | "user" | "account" | "learn";
}) {
  const c = useExperienceCopy();
  const { isConnected } = useAccount();
  const title =
    kind === "user"
      ? c.userTitle
      : kind === "account"
        ? c.accountTitle
        : kind === "learn"
          ? c.educationTitle
          : c.welcomeTitle;
  const body =
    kind === "user"
      ? c.userBody
      : kind === "account"
        ? c.accountSettings
        : kind === "learn"
          ? c.educationBody
          : c.welcomeBody;
  return (
    <section className="workspace-hero">
      <div className="relative z-10 max-w-xl p-6 sm:p-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-200">
          {kind === "learn" ? c.learn : c.welcome}
        </p>
        <h1 className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">{body}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <WalletButton />
          <span className="flex items-center gap-2 text-xs text-slate-300">
            <span
              className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-400" : "bg-slate-400"}`}
            />
            {isConnected ? c.connected : c.disconnected}
          </span>
        </div>
      </div>
      <div className="workspace-art" aria-hidden="true">
        <Image
          src={`/images/experience/${kind === "learn" ? "collection" : "network"}.webp`}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 500px"
          className="object-cover"
        />
      </div>
    </section>
  );
}
