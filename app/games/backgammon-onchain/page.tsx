import Link from "next/link";

export default function OnchainBackgammonHome() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">On-Chain Backgammon</h1>
      <p className="max-w-xl text-lg text-slate-300">
        Play 1v1 against another wallet on BNB Smart Chain (testnet). A match&apos;s stake is
        optional and set by its creator - 0 for a free/friendly game, or any amount of BNB, escrowed
        on-chain and paid to the winner minus a platform fee and referral commissions when it settles.
        The game itself is played move-by-move over a live connection, validated by the server so
        nobody can cheat.
      </p>
      <Link
        href="/games/backgammon-onchain/lobby"
        className="rounded-full bg-indigo-500 px-8 py-3 text-base font-medium text-white transition hover:bg-indigo-400"
      >
        Play now
      </Link>
      <p className="text-sm text-slate-500">
        Currently deployed on BSC Testnet only - stakes are test BNB, not real funds.
      </p>
    </div>
  );
}
