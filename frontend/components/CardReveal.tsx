"use client";

import { RARITY_CONFIG, getImageUrl } from "@/lib/contract";

interface CardRevealProps {
  tokenIds: readonly bigint[];
  rarities: readonly number[];
}

export default function CardReveal({ tokenIds, rarities }: CardRevealProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
      {tokenIds.map((tokenId, i) => {
        const rarity = rarities[i];
        const config = RARITY_CONFIG[rarity] ?? RARITY_CONFIG[0];
        const imageUrl = getImageUrl(tokenId);

        return (
          <div
            key={tokenId.toString()}
            className={`
              rounded-lg flex flex-col relative overflow-hidden
              border ${config.border} ${config.glow}
              animate-card-flip cursor-pointer
              hover:translate-y-[-8px] transition-transform duration-300
              group
            `}
            style={{
              animationDelay: `${i * 150}ms`,
              background: "rgba(25, 25, 31, 0.8)",
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
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
                  rarity === 3 ? "from-neon-gold/20 to-transparent"
                    : rarity === 2 ? "from-neon-purple/20 to-transparent"
                    : rarity === 1 ? "from-neon-cyan/20 to-transparent"
                    : "from-white/5 to-transparent"
                }`}>
                  <span className={`text-3xl font-bold ${config.color} opacity-30`}>?</span>
                </div>
              )}
              {/* Rarity badge overlay */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-0.5 ${config.bg} ${config.color} font-[var(--font-headline)] text-[9px] rounded uppercase font-black tracking-wider backdrop-blur-sm`}>
                  {config.label}
                </span>
              </div>
              {/* Legendary glow */}
              {rarity === 3 && (
                <div className="absolute inset-0 bg-neon-gold/10 animate-glow-pulse pointer-events-none" />
              )}
            </div>

            {/* Card info */}
            <div className="p-3 space-y-1">
              <div className={`font-[var(--font-headline)] font-bold text-sm ${config.color}`}>
                RELIC #{tokenId.toString()}
              </div>
              <div className="font-[var(--font-headline)] text-[10px] text-slate-500 tracking-widest uppercase">
                SERIAL #{tokenId.toString().padStart(4, "0")}
              </div>
            </div>

            {/* Bottom glow line */}
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${
              rarity === 3 ? "bg-gradient-to-r from-transparent via-neon-gold to-transparent"
                : rarity === 2 ? "bg-gradient-to-r from-transparent via-neon-purple to-transparent"
                : rarity === 1 ? "bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
                : "bg-gradient-to-r from-transparent via-slate-600 to-transparent"
            }`} />
          </div>
        );
      })}
    </div>
  );
}
