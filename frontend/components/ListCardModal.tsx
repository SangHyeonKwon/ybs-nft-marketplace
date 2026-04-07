"use client";

import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { useIsApprovedForAll } from "@/hooks/useMarketplace";
import { useListCard, useApproveMarketplace } from "@/hooks/useMarketplaceWrite";

interface ListCardModalProps {
  tokenId: bigint;
  rarity: number;
  onClose: () => void;
}

export default function ListCardModal({
  tokenId,
  rarity,
  onClose,
}: ListCardModalProps) {
  const [price, setPrice] = useState("");

  const { data: isApproved, refetch: refetchApproval } = useIsApprovedForAll();
  const {
    approve,
    isWritePending: isApprovePending,
    isConfirming: isApproveConfirming,
    isSuccess: isApproveSuccess,
  } = useApproveMarketplace();
  const {
    listCard,
    isWritePending: isListPending,
    isConfirming: isListConfirming,
    isSuccess: isListSuccess,
    errorMessage,
  } = useListCard();

  useEffect(() => {
    if (isApproveSuccess) refetchApproval();
  }, [isApproveSuccess, refetchApproval]);

  useEffect(() => {
    if (isListSuccess) {
      setTimeout(onClose, 1500);
    }
  }, [isListSuccess, onClose]);

  const handleList = () => {
    if (!price || parseFloat(price) <= 0) return;
    listCard(tokenId, parseEther(price));
  };

  const rarityLabels = ["Common", "Rare", "Epic", "Legendary"];
  const rarityColors = ["text-slate-400", "text-neon-cyan", "text-neon-purple", "text-neon-gold"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-sm rounded-xl border border-slate-700/50 p-6"
        style={{ background: "rgba(14, 14, 19, 0.95)" }}
      >
        <h3 className="font-[var(--font-headline)] font-bold text-xl text-white uppercase tracking-tight mb-1">
          List for Sale
        </h3>
        <p className={`text-sm mb-6 ${rarityColors[rarity]}`}>
          Card #{tokenId.toString()} &middot; {rarityLabels[rarity]}
        </p>

        {isListSuccess ? (
          <div className="text-center py-8">
            <div className="text-neon-cyan text-lg font-bold mb-2">Listed!</div>
            <p className="text-slate-400 text-sm">마켓플레이스에 등록되었습니다.</p>
          </div>
        ) : (
          <>
            {/* Price Input */}
            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2">
              Price (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder="0.05"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 mb-6"
            />

            {/* Step 1: Approve (if needed) */}
            {!isApproved && (
              <button
                onClick={() => approve()}
                disabled={isApprovePending || isApproveConfirming}
                className="w-full py-3 rounded-lg border border-neon-purple/50 text-neon-purple font-[var(--font-headline)] font-bold text-sm uppercase tracking-wider mb-3 hover:bg-neon-purple/10 transition-colors disabled:opacity-50"
              >
                {isApprovePending
                  ? "Confirm in wallet..."
                  : isApproveConfirming
                    ? "Approving..."
                    : "Step 1: Approve Marketplace"}
              </button>
            )}

            {/* Step 2: List */}
            <button
              onClick={handleList}
              disabled={
                !isApproved ||
                !price ||
                parseFloat(price) <= 0 ||
                isListPending ||
                isListConfirming
              }
              className="w-full py-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan font-[var(--font-headline)] font-bold text-sm uppercase tracking-wider hover:bg-neon-cyan/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isListPending
                ? "Confirm in wallet..."
                : isListConfirming
                  ? "Listing..."
                  : !isApproved
                    ? "Approve first"
                    : "List Card"}
            </button>

            {errorMessage && (
              <p className="mt-3 text-red-400 text-xs text-center">{errorMessage}</p>
            )}

            <button
              onClick={onClose}
              className="w-full mt-3 py-2 text-slate-500 text-sm hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
