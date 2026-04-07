# CardPack NFT DApp

Generative art NFT 카드팩 뽑기 + 마켓플레이스 DApp.

Flow field 알고리즘 기반 제너러티브 아트 300장을 NFT로 민팅하고, 마켓플레이스에서 거래할 수 있습니다.

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Smart Contract | Solidity ^0.8.28, Foundry, OpenZeppelin ERC-721 |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | Next.js API Routes |
| Web3 | wagmi, RainbowKit, viem |
| Storage | IPFS (Pinata) |
| Network | Sepolia Testnet |
| Art Generation | Python (Pillow, numpy) - Flow field + Fractal noise |

## 주요 기능

- **카드팩 구매** - 0.01 ETH로 5장의 랜덤 레어리티 NFT 카드 획득
- **카드 리빌** - 팩 오픈 시 플립 애니메이션과 함께 카드 공개
- **마이 컬렉션** - 보유 카드 조회 및 관리
- **마켓플레이스** - NFT 판매 등록, 구매, 취소 (2.5% 플랫폼 수수료)
- **IPFS 저장** - 이미지 및 메타데이터 탈중앙 저장

### 레어리티 시스템

| 등급 | 확률 | 시각적 특징 |
|------|------|-------------|
| Common | 70% | 얇은 선, 뮤트 팔레트 |
| Rare | 20% | 중간 선, 비비드 팔레트 |
| Epic | 8% | 두꺼운 선, 네온 팔레트 + 글로우 |
| Legendary | 2% | 멀티레이어, 골드/오로라 + 파티클 |

## 배포 정보

| 항목 | 값 |
|------|-----|
| Network | Sepolia Testnet (chainId: 11155111) |
| CardPack | `0x3f3cC28FAAcFC304aaBE737DA2c487Af1EF6A95b` |
| NFTMarketplace | `0x580A7e629806eee0025801876aF2b483B5135c5E` |
| Pack Price | 0.01 ETH |
| Cards Per Pack | 5 |
| Total Supply | 300 |

## 설치 및 실행

### 컨트랙트

```bash
cd contracts
forge install
forge build
forge test -vv
```

### 프론트엔드

```bash
cd frontend
npm install
cp .env.local.example .env.local  # 환경변수 설정
npm run dev
```

### 환경변수

```bash
# frontend/.env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x3f3cC28FAAcFC304aaBE737DA2c487Af1EF6A95b
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x580A7e629806eee0025801876aF2b483B5135c5E
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_IPFS_IMAGES_CID=<pinata-images-cid>
NEXT_PUBLIC_IPFS_METADATA_CID=<pinata-metadata-cid>
```

## 프로젝트 구조

```
my-dapp/
├── contracts/
│   ├── src/
│   │   ├── CardPack.sol           # ERC-721 NFT 컨트랙트
│   │   └── NFTMarketplace.sol     # 마켓플레이스 컨트랙트
│   ├── test/
│   │   ├── CardPack.t.sol         # CardPack 테스트 (11개)
│   │   └── NFTMarketplace.t.sol   # Marketplace 테스트 (19개)
│   └── script/
│       ├── Deploy.s.sol
│       └── DeployMarketplace.s.sol
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Pack Drop (메인)
│   │   ├── collection/page.tsx    # My Collection
│   │   ├── marketplace/page.tsx   # Marketplace
│   │   └── api/                   # API Routes
│   ├── components/
│   ├── hooks/
│   └── lib/
├── scripts/
│   └── upload-to-pinata.mjs       # IPFS 업로드
└── generate_flow.py               # 제너러티브 아트 생성기
```

## 마켓플레이스 플로우

```
1. Collection 페이지에서 "Sell" 클릭
2. setApprovalForAll(marketplace) 승인
3. 가격 입력 후 listCard(tokenId, price) 호출
4. Marketplace 페이지에서 리스팅 확인
5. 다른 유저가 "Buy" 클릭 → buyCard(tokenId) + ETH 전송
6. NFT 전송 + 판매자에게 ETH 지급 (2.5% 수수료 차감)
```
