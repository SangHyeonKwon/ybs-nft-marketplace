export const CARD_PACK_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x") as `0x${string}`;

export const MARKETPLACE_ADDRESS = (process.env
  .NEXT_PUBLIC_MARKETPLACE_ADDRESS ?? "0x") as `0x${string}`;

export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
export const IPFS_IMAGES_CID = process.env.NEXT_PUBLIC_IPFS_IMAGES_CID ?? "";
export const IPFS_METADATA_CID =
  process.env.NEXT_PUBLIC_IPFS_METADATA_CID ?? "";

/** tokenId (0-based) → IPFS image URL */
export function getImageUrl(tokenId: number | bigint): string {
  const imageNum = Number(tokenId) + 1;
  if (!IPFS_IMAGES_CID) return "";
  return `${IPFS_GATEWAY}${IPFS_IMAGES_CID}/ybs-images/${imageNum}.png`;
}

export const CARD_PACK_ABI = [
  {
    type: "function",
    name: "buyPack",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getPackPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCardsByOwner",
    inputs: [{ name: "_owner", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "cardRarity",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalMinted",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "cardsPerPack",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "packPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPackPrice",
    inputs: [
      { name: "_newPrice", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "PackOpened",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenIds",
        type: "uint256[]",
        indexed: false,
        internalType: "uint256[]",
      },
      {
        name: "rarities",
        type: "uint8[]",
        indexed: false,
        internalType: "uint8[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PackPriceUpdated",
    inputs: [
      {
        name: "newPrice",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  // ── ERC-721 Approval (for marketplace) ──
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "approved", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "operator", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
] as const;

export const MARKETPLACE_ABI = [
  {
    type: "function",
    name: "listCard",
    inputs: [
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "price", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "buyCard",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "cancelListing",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getActiveListings",
    inputs: [],
    outputs: [
      { name: "tokenIds", type: "uint256[]", internalType: "uint256[]" },
      { name: "sellers", type: "address[]", internalType: "address[]" },
      { name: "prices", type: "uint256[]", internalType: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getListingCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "listings",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "seller", type: "address", internalType: "address" },
      { name: "price", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "platformFeeBps",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "CardListed",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "seller", type: "address", indexed: true, internalType: "address" },
      { name: "price", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CardSold",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "seller", type: "address", indexed: true, internalType: "address" },
      { name: "buyer", type: "address", indexed: true, internalType: "address" },
      { name: "price", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ListingCancelled",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "seller", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
] as const;

export const RARITY_LABELS = ["Common", "Rare", "Epic", "Legendary"] as const;

export const RARITY_CONFIG: Record<
  number,
  { label: string; color: string; border: string; glow: string; bg: string }
> = {
  0: {
    label: "Common",
    color: "text-slate-400",
    border: "border-slate-500/30",
    glow: "",
    bg: "bg-slate-500/20",
  },
  1: {
    label: "Rare",
    color: "text-neon-cyan",
    border: "border-neon-cyan/30",
    glow: "neon-glow-cyan",
    bg: "bg-neon-cyan/20",
  },
  2: {
    label: "Epic",
    color: "text-neon-purple",
    border: "border-neon-purple/30",
    glow: "neon-glow-purple",
    bg: "bg-neon-purple/20",
  },
  3: {
    label: "Legendary",
    color: "text-neon-gold",
    border: "border-neon-gold/30",
    glow: "neon-glow-gold",
    bg: "bg-neon-gold/20",
  },
};
