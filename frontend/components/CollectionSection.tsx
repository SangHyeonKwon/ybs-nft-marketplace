"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useCardsByOwner } from "@/hooks/useCardPack";
import { CARD_PACK_ABI, CARD_PACK_ADDRESS, RARITY_CONFIG, getImageUrl } from "@/lib/contract";
import ListCardModal from "./ListCardModal";

function RarityIcon({ rarity, size = 28 }: { rarity: number; size?: number }) {
  const config = RARITY_CONFIG[rarity] ?? RARITY_CONFIG[0];
  if (rarity === 3) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={config.color}>
        <path d="M12 2L9 9H2l5.5 4.5L5 22l7-5 7 5-2.5-8.5L22 9h-7L12 2z" fill="currentColor"/>
      </svg>
    );
  }
  if (rarity === 2) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={config.color}>
        <path d="M12 2L6 12l6 10 6-10L12 2z" fill="currentColor" opacity="0.8"/>
      </svg>
    );
  }
  if (rarity === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={config.color}>
        <path d="M12 1l3 7h7l-5.5 4.5L19 22l-7-5-7 5 2.5-9.5L2 8h7l3-7z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={config.color}>
      <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}

function CollectionCard({ tokenId }: { tokenId: bigint }) {
  const [showListModal, setShowListModal] = useState(false);
  const { data: rarity } = useReadContract({
    address: CARD_PACK_ADDRESS,
    abi: CARD_PACK_ABI,
    functionName: "cardRarity",
    args: [tokenId],
  });

  const r = typeof rarity === "number" ? rarity : 0;
  const config = RARITY_CONFIG[r] ?? RARITY_CONFIG[0];
  const imageUrl = getImageUrl(tokenId);

  return (
    <>
      <div
        className={`
          rounded-lg flex flex-col group
          border ${config.border} ${config.glow}
          hover:translate-y-[-4px] transition-all duration-300 cursor-pointer
          relative overflow-hidden
        `}
        style={{
          background: "rgba(25, 25, 31, 0.6)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* NFT Image */}
        <div className="aspect-square overflow-hidden relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`YBS #${tokenId.toString()}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900/50">
              <RarityIcon rarity={r} size={40} />
            </div>
          )}
          {/* Rarity badge overlay */}
          <div className="absolute top-2 right-2">
            <span className={`px-1.5 py-0.5 ${config.bg} ${config.color} font-[var(--font-headline)] text-[8px] rounded uppercase font-bold backdrop-blur-sm`}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Card info */}
        <div className="p-2.5 flex items-center justify-between">
          <div className={`font-[var(--font-headline)] font-bold text-xs ${config.color}`}>
            #{tokenId.toString()}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowListModal(true);
            }}
            className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-slate-600/50 text-slate-400 rounded hover:border-neon-cyan/50 hover:text-neon-cyan transition-colors"
          >
            Sell
          </button>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${
          r === 3 ? "bg-gradient-to-r from-transparent via-neon-gold to-transparent"
            : r === 2 ? "bg-gradient-to-r from-transparent via-neon-purple to-transparent"
            : r === 1 ? "bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
            : "bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"
        }`} />
      </div>

      {showListModal && (
        <ListCardModal
          tokenId={tokenId}
          rarity={r}
          onClose={() => setShowListModal(false)}
        />
      )}
    </>
  );
}

export default function CollectionSection() {
  const { address, isConnected } = useAccount();
  const { data: cardIds } = useCardsByOwner(address);

  if (!isConnected) {
    return (
      <section className="px-6 lg:px-12 py-24 relative">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="font-[var(--font-headline)] font-bold text-3xl text-white uppercase tracking-tight mb-4">
            My Collection
          </h3>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-neon-cyan to-transparent mb-8" />
          <p className="text-slate-500 font-[var(--font-headline)] uppercase tracking-widest text-sm">
            Connect wallet to view your relics
          </p>
        </div>
      </section>
    );
  }

  if (!cardIds || cardIds.length === 0) {
    return (
      <section className="px-6 lg:px-12 py-24 relative">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="font-[var(--font-headline)] font-bold text-3xl text-white uppercase tracking-tight mb-4">
            My Collection
          </h3>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-neon-cyan to-transparent mb-8" />
          <p className="text-slate-500 font-[var(--font-headline)] uppercase tracking-widest text-sm mb-6">
            No relics yet
          </p>
          <a href="/" className="inline-block px-8 py-3 border border-neon-cyan/30 text-neon-cyan font-[var(--font-headline)] font-bold text-sm uppercase tracking-wider hover:bg-neon-cyan/10 transition-colors">
            Open Your First Pack
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 lg:px-12 py-24 bg-surface-container-low/30 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <h3 className="font-[var(--font-headline)] font-bold text-3xl text-white uppercase tracking-tight">
              My Collection
            </h3>
            <div className="h-1 w-24 bg-gradient-to-r from-neon-cyan to-transparent mt-2" />
          </div>
          <div className="text-slate-500 text-sm font-[var(--font-headline)]">
            {cardIds.length} RELICS OWNED
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {cardIds.map((id) => (
            <CollectionCard key={id.toString()} tokenId={id} />
          ))}
        </div>
      </div>
    </section>
  );
}
