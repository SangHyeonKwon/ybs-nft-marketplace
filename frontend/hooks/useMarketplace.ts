"use client";

import { useReadContract, useAccount } from "wagmi";
import {
  MARKETPLACE_ADDRESS,
  MARKETPLACE_ABI,
  CARD_PACK_ADDRESS,
  CARD_PACK_ABI,
} from "@/lib/contract";

export function useActiveListings() {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "getActiveListings",
  });
}

export function useListingCount() {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "getListingCount",
  });
}

export function useListing(tokenId: bigint) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "listings",
    args: [tokenId],
  });
}

export function useIsApprovedForAll() {
  const { address } = useAccount();
  return useReadContract({
    address: CARD_PACK_ADDRESS,
    abi: CARD_PACK_ABI,
    functionName: "isApprovedForAll",
    args: address ? [address, MARKETPLACE_ADDRESS] : undefined,
    query: { enabled: !!address },
  });
}
