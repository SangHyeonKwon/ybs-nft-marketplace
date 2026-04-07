// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title CardPack NFT — 카드팩 구매 및 개봉
/// @notice ETH를 지불하고 랜덤 레어리티의 카드 NFT를 민팅합니다
contract CardPack is ERC721, ReentrancyGuard {
    using Strings for uint256;

    // ── Errors ──────────────────────────────────────────
    error NotOwner();
    error InsufficientETH();
    error WithdrawFailed();
    error ZeroPrice();

    // ── Events ──────────────────────────────────────────
    event PackOpened(address indexed buyer, uint256[] tokenIds, uint8[] rarities);
    event PackPriceUpdated(uint256 newPrice);
    event Withdrawn(address indexed owner, uint256 amount);
    event BaseURIUpdated(string newBaseURI);

    // ── State ───────────────────────────────────────────
    uint256 public packPrice;
    uint256 public cardsPerPack;
    uint256 public totalMinted;
    mapping(uint256 => uint8) public cardRarity;
    address public owner;
    string private _metadataBaseURI;

    // ── Modifiers ───────────────────────────────────────
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ── Constructor ─────────────────────────────────────
    /// @notice 컨트랙트 배포 시 팩 가격과 팩당 카드 수를 설정합니다
    /// @param _packPrice 팩 가격 (wei)
    /// @param _cardsPerPack 팩당 카드 수
    constructor(
        uint256 _packPrice,
        uint256 _cardsPerPack
    ) ERC721("CardPack", "CPACK") {
        packPrice = _packPrice;
        cardsPerPack = _cardsPerPack;
        owner = msg.sender;
    }

    // ── External Functions ──────────────────────────────

    /// @notice ETH를 지불하고 카드팩을 구매합니다
    function buyPack() external payable {
        // Check
        if (msg.value < packPrice) revert InsufficientETH();

        // Effect
        uint256[] memory tokenIds = new uint256[](cardsPerPack);
        uint8[] memory rarities = new uint8[](cardsPerPack);

        for (uint256 i = 0; i < cardsPerPack; i++) {
            uint256 tokenId = totalMinted;
            totalMinted++;

            uint8 rarity = _determineRarity(tokenId, i);
            cardRarity[tokenId] = rarity;
            tokenIds[i] = tokenId;
            rarities[i] = rarity;

            // Interact
            _mint(msg.sender, tokenId);
        }

        emit PackOpened(msg.sender, tokenIds, rarities);
    }

    /// @notice 팩 가격을 조회합니다
    /// @return 팩 가격 (wei)
    function getPackPrice() external view returns (uint256) {
        return packPrice;
    }

    /// @notice 특정 주소가 보유한 카드 목록을 조회합니다
    /// @param _owner 조회할 주소
    /// @return tokenIds 보유한 토큰 ID 배열
    function getCardsByOwner(address _owner) external view returns (uint256[] memory) {
        uint256 count = balanceOf(_owner);
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;

        for (uint256 i = 0; i < totalMinted && idx < count; i++) {
            if (_ownerOf(i) == _owner) {
                result[idx] = i;
                idx++;
            }
        }
        return result;
    }

    /// @notice owner가 컨트랙트의 ETH를 출금합니다
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;

        // Interact
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert WithdrawFailed();

        emit Withdrawn(owner, balance);
    }

    /// @notice owner가 팩 가격을 변경합니다
    /// @param _newPrice 새로운 팩 가격 (wei)
    function setPackPrice(uint256 _newPrice) external onlyOwner {
        if (_newPrice == 0) revert ZeroPrice();
        packPrice = _newPrice;
        emit PackPriceUpdated(_newPrice);
    }

    /// @notice owner가 메타데이터 base URI를 설정합니다
    /// @param baseURI_ 새로운 base URI (e.g. "ipfs://Qm.../")
    function setBaseURI(string calldata baseURI_) external onlyOwner {
        _metadataBaseURI = baseURI_;
        emit BaseURIUpdated(baseURI_);
    }

    /// @notice 토큰 메타데이터 URI를 반환합니다
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        string memory base = _baseURI();
        // tokenId 0 → 1.json, tokenId 1 → 2.json, ...
        return bytes(base).length > 0
            ? string.concat(base, (tokenId + 1).toString(), ".json")
            : "";
    }

    // ── Internal Functions ──────────────────────────────

    function _baseURI() internal view override returns (string memory) {
        return _metadataBaseURI;
    }

    /// @notice pseudo-random으로 레어리티를 결정합니다
    /// @param _tokenId 토큰 ID
    /// @param _index 팩 내 인덱스
    /// @return rarity 0=Common(70%), 1=Rare(20%), 2=Epic(8%), 3=Legendary(2%)
    function _determineRarity(uint256 _tokenId, uint256 _index) internal view returns (uint8) {
        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    _tokenId,
                    _index
                )
            )
        ) % 100;

        if (rand < 70) return 0;       // Common  70%
        if (rand < 90) return 1;       // Rare    20%
        if (rand < 98) return 2;       // Epic     8%
        return 3;                       // Legendary 2%
    }
}
