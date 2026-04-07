"use client";

import { useReadContract } from "wagmi";
import { CARD_PACK_ABI, CARD_PACK_ADDRESS } from "@/lib/contract";

export function usePackPrice() {
  return useReadContract({
    address: CARD_PACK_ADDRESS,
    abi: CARD_PACK_ABI,
    functionName: "getPackPrice",
  });
}

export function useCardsPerPack() {
  return useReadContract({
    address: CARD_PACK_ADDRESS,
    abi: CARD_PACK_ABI,
    functionName: "cardsPerPack",
  });
}

export function useTotalMinted() {
  return useReadContract({
    address: CARD_PACK_ADDRESS,
    abi: CARD_PACK_ABI,
    functionName: "totalMinted",
  });
}

export function useCardsByOwner(owner: `0x${string}` | undefined) {
  return useReadContract({
    address: CARD_PACK_ADDRESS,
    abi: CARD_PACK_ABI,
    functionName: "getCardsByOwner",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner },
  });
}

export function useCardRarity(tokenId: bigint) {
  return useReadContract({
    address: CARD_PACK_ADDRESS,
    abi: CARD_PACK_ABI,
    functionName: "cardRarity",
    args: [tokenId],
  });
}
