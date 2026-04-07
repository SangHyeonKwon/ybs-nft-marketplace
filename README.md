# YBS NFT Marketplace

A generative art NFT DApp built for the Yonsei Blockchain Society. Mint unique flow-field artwork as NFT card packs, browse your collection, and trade on the built-in marketplace.

## Features

- **Generative Art NFTs** — 300 unique flow-field artworks with rarity tiers (Common / Rare / Epic / Legendary)
- **Card Pack Minting** — Mint randomized NFT card packs on-chain
- **NFT Marketplace** — List, buy, and cancel NFT listings with a 2.5% platform fee
- **IPFS Storage** — All artwork and metadata stored on IPFS via Pinata
- **Sepolia Testnet** — Fully deployed and functional on Ethereum Sepolia

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity ^0.8.28, Foundry, OpenZeppelin ERC-721 |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Web3 | wagmi, RainbowKit, viem |
| Storage | IPFS (Pinata) |
| Art Generation | Python (Pillow, NumPy) — fractal noise flow fields |

## Contracts (Sepolia)

| Contract | Address |
|----------|---------|
| CardPack (ERC-721) | `0x3f3cC28FAAcFC304aaBE737DA2c487Af1EF6A95b` |
| NFTMarketplace | `0x580A7e629806eee0025801876aF2b483B5135c5E` |

## Project Structure

```
├── contracts/          # Foundry project
│   ├── src/            # Solidity contracts
│   ├── test/           # Contract tests (30 tests)
│   └── script/         # Deployment scripts
├── frontend/           # Next.js application
│   ├── app/            # Pages & API routes
│   ├── components/     # UI components
│   ├── hooks/          # wagmi hooks
│   └── lib/            # Config & utilities
├── scripts/            # IPFS upload tooling
├── generate_flow.py    # Flow field art generator
└── generate_art.py     # Art generation utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- Foundry
- Python 3.11+ (for art generation only)

### Contracts

```bash
cd contracts
forge install
forge build
forge test
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x3f3cC28FAAcFC304aaBE737DA2c487Af1EF6A95b
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x580A7e629806eee0025801876aF2b483B5135c5E
NEXT_PUBLIC_IPFS_IMAGES_CID=<your-images-cid>
NEXT_PUBLIC_IPFS_METADATA_CID=<your-metadata-cid>
```

```bash
npm run dev
```

## Rarity Distribution

| Tier | Probability | Count | Visual Style |
|------|------------|-------|-------------|
| Common | ~70% | 208 | Thin lines, muted palettes |
| Rare | ~20% | 58 | Medium lines, vibrant palettes |
| Epic | ~8% | 25 | Thick lines, neon glow effect |
| Legendary | ~2% | 9 | Multi-layer, gold/aurora + particles |

## License

MIT
