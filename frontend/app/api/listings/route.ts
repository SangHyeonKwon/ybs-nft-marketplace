import { publicClient } from "@/lib/viem";
import {
  MARKETPLACE_ADDRESS,
  MARKETPLACE_ABI,
  CARD_PACK_ADDRESS,
  CARD_PACK_ABI,
} from "@/lib/contract";

export const revalidate = 30; // refresh every 30 seconds

export async function GET() {
  try {
    const [tokenIds, sellers, prices] = await publicClient.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "getActiveListings",
    });

    const listings = await Promise.all(
      tokenIds.map(async (tokenId: bigint, i: number) => {
        const rarity = await publicClient.readContract({
          address: CARD_PACK_ADDRESS,
          abi: CARD_PACK_ABI,
          functionName: "cardRarity",
          args: [tokenId],
        });

        return {
          tokenId: tokenId.toString(),
          seller: sellers[i],
          price: prices[i].toString(),
          rarity: Number(rarity),
        };
      })
    );

    return Response.json({ listings });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch listings", listings: [] },
      { status: 500 }
    );
  }
}
