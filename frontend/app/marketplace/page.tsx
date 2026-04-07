"use client";

import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useActiveListings } from "@/hooks/useMarketplace";
import { useCardRarity } from "@/hooks/useCardPack";
import { useBuyCard } from "@/hooks/useMarketplaceWrite";
import { RARITY_CONFIG, getImageUrl } from "@/lib/contract";

function ListingCard({
  tokenId,
  seller,
  price,
}: {
  tokenId: bigint;
  seller: string;
  price: bigint;
}) {
  const { address } = useAccount();
  const { data: rarity } = useCardRarity(tokenId);
  const { buyCard, isWritePending, isConfirming, isSuccess, errorMessage } =
    useBuyCard();

  const r = typeof rarity === "number" ? rarity : 0;
  const config = RARITY_CONFIG[r] ?? RARITY_CONFIG[0];
  const isOwn = address?.toLowerCase() === seller.toLowerCase();
  const imageUrl = getImageUrl(tokenId);

  return (
    <div
      className={`rounded-xl border ${config.border} ${config.glow} overflow-hidden transition-all duration-300 hover:translate-y-[-4px]`}
      style={{ background: "rgba(25, 25, 31, 0.6)", backdropFilter: "blur(12px)" }}
    >
      {/* Image */}
      <div className="aspect-square bg-slate-900/50 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`YBS #${tokenId.toString()}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`text-4xl font-bold ${config.color} opacity-30`}>
            #{tokenId.toString()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-[var(--font-headline)] font-bold text-white text-sm">
            YBS #{tokenId.toString()}
          </span>
          <span
            className={`px-2 py-0.5 ${config.bg} ${config.color} text-[10px] font-bold uppercase rounded`}
          >
            {config.label}
          </span>
        </div>

        <div className="text-slate-500 text-xs mb-3 truncate">
          {seller.slice(0, 6)}...{seller.slice(-4)}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-white font-[var(--font-headline)] font-bold">
            {formatEther(price)} ETH
          </div>

          {isSuccess ? (
            <span className="text-neon-cyan text-xs font-bold">Purchased!</span>
          ) : (
            <button
              onClick={() => buyCard(tokenId, price)}
              disabled={isOwn || isWritePending || isConfirming || !address}
              className="px-4 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan text-xs font-bold uppercase tracking-wider hover:bg-neon-cyan/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isWritePending
                ? "Confirm..."
                : isConfirming
                  ? "Buying..."
                  : isOwn
                    ? "Your Card"
                    : "Buy"}
            </button>
          )}
        </div>

        {errorMessage && (
          <p className="mt-2 text-red-400 text-[10px]">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { isConnected } = useAccount();
  const { data, isLoading } = useActiveListings();

  const tokenIds = data?.[0] ?? [];
  const sellers = data?.[1] ?? [];
  const prices = data?.[2] ?? [];

  return (
    <main className="min-h-screen pt-28 pb-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black font-[var(--font-headline)] text-white uppercase tracking-tight">
            Marketplace
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-neon-cyan to-transparent mt-3" />
          <p className="text-slate-500 mt-3 text-sm">
            Trade your NFT cards with other collectors
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center py-24">
            <p className="text-slate-500 font-[var(--font-headline)] uppercase tracking-widest text-sm">
              Connect wallet to browse marketplace
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-24">
            <div className="inline-block w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
            <p className="text-slate-500 mt-4 text-sm">Loading listings...</p>
          </div>
        ) : tokenIds.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-500 font-[var(--font-headline)] uppercase tracking-widest text-sm mb-6">
              No listings yet
            </p>
            <a
              href="/collection"
              className="inline-block px-8 py-3 border border-neon-cyan/30 text-neon-cyan font-[var(--font-headline)] font-bold text-sm uppercase tracking-wider hover:bg-neon-cyan/10 transition-colors"
            >
              List Your Cards
            </a>
          </div>
        ) : (
          <>
            <div className="text-slate-500 text-sm font-[var(--font-headline)] mb-6">
              {tokenIds.length} LISTED
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tokenIds.map((id: bigint, i: number) => (
                <ListingCard
                  key={id.toString()}
                  tokenId={id}
                  seller={sellers[i]}
                  price={prices[i]}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
