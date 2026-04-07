"use client";

import { useAccount } from "wagmi";
import { formatEther } from "viem";
import {
  usePackPrice,
  useCardsPerPack,
  useTotalMinted,
} from "@/hooks/useCardPack";
import { useBuyPack } from "@/hooks/useBuyPack";
import CardReveal from "./CardReveal";

export default function HeroSection() {
  const { isConnected } = useAccount();
  const { data: packPrice } = usePackPrice();
  const { data: cardsPerPack } = useCardsPerPack();
  const { data: totalMinted } = useTotalMinted();

  const {
    buyPack,
    isWritePending,
    isConfirming,
    isSuccess,
    tokenIds,
    rarities,
    errorMessage,
    reset,
  } = useBuyPack();

  const isPending = isWritePending || isConfirming;

  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6">
      {/* Giant background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <h1 className="font-[var(--font-headline)] font-black text-[12vw] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent tracking-tighter uppercase whitespace-nowrap">
          CARD PACK
        </h1>
      </div>

      {/* Pack visual */}
      <div className="relative group mt-[-5vh]">
        {/* Floating particles */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-neon-cyan/20 blur-2xl rounded-full animate-pulse" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-neon-purple/20 blur-3xl rounded-full animate-pulse" style={{ animationDelay: "700ms" }} />
        <div className="absolute top-1/2 -right-20 w-16 h-16 bg-neon-gold/15 blur-2xl rounded-full animate-float" />

        {/* 3D Pack card */}
        <div className="relative z-10 w-64 h-96 sm:w-80 sm:h-[480px] [perspective:1000px] [transform:rotateY(-5deg)_rotateX(5deg)] group-hover:[transform:rotateY(0)_rotateX(0)] transition-transform duration-700 ease-out">
          <div className="w-full h-full glass-card rounded-lg overflow-hidden shadow-2xl flex flex-col relative border border-white/20 group-hover:border-neon-cyan/40 transition-colors duration-500">
            {/* Animated gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/15 via-neon-purple/10 to-neon-gold/5 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

            {/* Decorative grid lines */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }} />

            {/* Center icon */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="w-24 h-24 rounded-full border border-neon-cyan/20 flex items-center justify-center animate-glow-pulse">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-neon-cyan">
                  <path d="M12 2L9 9H2l5.5 4.5L5 22l7-5 7 5-2.5-8.5L22 9h-7L12 2z" fill="currentColor" opacity="0.8"/>
                  <path d="M12 2L9 9H2l5.5 4.5L5 22l7-5 7 5-2.5-8.5L22 9h-7L12 2z" stroke="currentColor" strokeWidth="0.5"/>
                </svg>
              </div>
              {/* Orbiting dots */}
              <div className="absolute w-40 h-40 animate-[spin_8s_linear_infinite]">
                <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-neon-cyan rounded-full" />
                <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-neon-purple rounded-full" />
              </div>
            </div>

            {/* Pack info */}
            <div className="relative z-10 p-6 space-y-4">
              <div className="inline-block px-3 py-1 bg-black/60 text-neon-cyan text-[10px] font-[var(--font-headline)] font-bold tracking-[0.2em] uppercase rounded-sm border border-neon-cyan/30">
                LEGENDARY DROP
              </div>
              <h2 className="font-[var(--font-headline)] font-bold text-2xl text-white tracking-tight">
                CYBER VOID PACK
              </h2>
              <div className="flex justify-between items-center text-slate-400 text-xs font-[var(--font-headline)]">
                <span>{cardsPerPack?.toString() ?? "5"} CARDS PER PACK</span>
                <span className="text-neon-purple">
                  #{totalMinted?.toString() ?? "0"} / 300
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Number(totalMinted ?? 0) / 3, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Glow behind pack */}
          <div className="absolute inset-0 bg-gradient-to-tr from-neon-cyan/20 to-neon-purple/20 blur-xl scale-95 opacity-50 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500 -z-10" />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 flex flex-col items-center gap-6 relative z-20">
        {isConnected ? (
          <>
            <button
              onClick={() => {
                if (packPrice) {
                  reset();
                  buyPack(packPrice);
                }
              }}
              disabled={isPending || !packPrice}
              className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-sm blur opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200" />
              <div className="relative px-12 py-5 bg-background border border-neon-cyan/20 leading-none flex items-center gap-4 transition-all group-hover:bg-neon-cyan group-hover:text-on-primary active:scale-95">
                <span className="font-[var(--font-headline)] font-black text-xl tracking-widest uppercase">
                  {isWritePending
                    ? "CONFIRMING..."
                    : isConfirming
                      ? "PENDING..."
                      : "BUY PACK"}
                </span>
                <div className="h-6 w-[1px] bg-neon-cyan/30 group-hover:bg-on-primary/30" />
                <span className="font-[var(--font-headline)] font-bold text-lg text-neon-cyan group-hover:text-on-primary">
                  {packPrice ? formatEther(packPrice) : "—"} ETH
                </span>
              </div>
            </button>

            {/* Rarity odds */}
            <div className="flex gap-4 text-[10px] font-[var(--font-headline)] uppercase tracking-widest">
              <span className="text-slate-500">Common 70%</span>
              <span className="text-neon-cyan/60">Rare 20%</span>
              <span className="text-neon-purple/60">Epic 8%</span>
              <span className="text-neon-gold/60">Legend 2%</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
            <p className="font-[var(--font-headline)] text-slate-500 text-sm uppercase tracking-[0.2em]">
              CONNECT WALLET TO BEGIN
            </p>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
          </div>
        )}

        {!isPending && !isSuccess && isConnected && (
          <p className="font-[var(--font-headline)] text-slate-500 text-[10px] uppercase tracking-[0.3em]">
            REVEAL THE RELIC WITHIN
          </p>
        )}

        {errorMessage && (
          <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 px-4 py-2 rounded">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Reveal animation */}
      {isSuccess && tokenIds && rarities && (
        <div className="mt-16 w-full max-w-4xl animate-fade-in-up">
          <div className="text-center mb-8">
            <h2 className="font-[var(--font-headline)] font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple uppercase tracking-wide">
              Pack Opened!
            </h2>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-neon-cyan to-neon-purple mt-3 rounded-full" />
          </div>
          <CardReveal tokenIds={tokenIds} rarities={rarities} />
        </div>
      )}
    </section>
  );
}
