// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title NFTMarketplace — CardPack NFT 마켓플레이스
/// @notice CardPack NFT를 리스팅하고 구매할 수 있는 마켓플레이스
contract NFTMarketplace is ReentrancyGuard {
    // ── Errors ──────────────────────────────────────────
    error NotTokenOwner();
    error NotApproved();
    error NotListed();
    error AlreadyListed();
    error InsufficientPayment();
    error CannotBuyOwnListing();
    error ZeroPrice();
    error TransferFailed();
    error NotContractOwner();
    error FeeTooHigh();

    // ── Events ──────────────────────────────────────────
    event CardListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event CardSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event FeeUpdated(uint256 newFeeBps);
    event Withdrawn(address indexed owner, uint256 amount);

    // ── Structs ─────────────────────────────────────────
    struct Listing {
        address seller;
        uint256 price;
    }

    // ── State ───────────────────────────────────────────
    IERC721 public immutable nftContract;
    address public owner;
    uint256 public platformFeeBps; // 250 = 2.5%

    mapping(uint256 => Listing) public listings;
    uint256[] public listedTokenIds;
    mapping(uint256 => uint256) private _tokenIdIndex;

    // ── Modifiers ───────────────────────────────────────
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotContractOwner();
        _;
    }

    // ── Constructor ─────────────────────────────────────
    /// @notice 마켓플레이스 배포
    /// @param _nftContract CardPack NFT 컨트랙트 주소
    /// @param _platformFeeBps 플랫폼 수수료 (basis points, max 1000 = 10%)
    constructor(address _nftContract, uint256 _platformFeeBps) {
        if (_platformFeeBps > 1000) revert FeeTooHigh();
        nftContract = IERC721(_nftContract);
        platformFeeBps = _platformFeeBps;
        owner = msg.sender;
    }

    // ── External Functions ──────────────────────────────

    /// @notice NFT를 마켓플레이스에 리스팅합니다
    /// @param tokenId 판매할 토큰 ID
    /// @param price 판매 가격 (wei)
    function listCard(uint256 tokenId, uint256 price) external {
        // Check
        if (nftContract.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (price == 0) revert ZeroPrice();
        if (listings[tokenId].seller != address(0)) revert AlreadyListed();
        if (!nftContract.isApprovedForAll(msg.sender, address(this))) revert NotApproved();

        // Effect
        listings[tokenId] = Listing(msg.sender, price);
        _tokenIdIndex[tokenId] = listedTokenIds.length;
        listedTokenIds.push(tokenId);

        emit CardListed(tokenId, msg.sender, price);
    }

    /// @notice 리스팅된 NFT를 구매합니다
    /// @param tokenId 구매할 토큰 ID
    function buyCard(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];

        // Check
        if (listing.seller == address(0)) revert NotListed();
        if (msg.value < listing.price) revert InsufficientPayment();
        if (msg.sender == listing.seller) revert CannotBuyOwnListing();

        // Effect
        _removeListing(tokenId);

        // Interact
        nftContract.transferFrom(listing.seller, msg.sender, tokenId);

        uint256 fee = (listing.price * platformFeeBps) / 10000;
        uint256 sellerAmount = listing.price - fee;

        (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
        if (!success) revert TransferFailed();

        // Refund excess payment
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            if (!refundSuccess) revert TransferFailed();
        }

        emit CardSold(tokenId, listing.seller, msg.sender, listing.price);
    }

    /// @notice 리스팅을 취소합니다
    /// @param tokenId 취소할 토큰 ID
    function cancelListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];

        // Check
        if (listing.seller == address(0)) revert NotListed();
        if (listing.seller != msg.sender) revert NotTokenOwner();

        // Effect
        _removeListing(tokenId);

        emit ListingCancelled(tokenId, msg.sender);
    }

    /// @notice 모든 활성 리스팅을 조회합니다
    /// @return tokenIds 리스팅된 토큰 ID 배열
    /// @return sellers 판매자 주소 배열
    /// @return prices 가격 배열
    function getActiveListings()
        external
        view
        returns (
            uint256[] memory tokenIds,
            address[] memory sellers,
            uint256[] memory prices
        )
    {
        uint256 len = listedTokenIds.length;
        tokenIds = new uint256[](len);
        sellers = new address[](len);
        prices = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            uint256 id = listedTokenIds[i];
            tokenIds[i] = id;
            sellers[i] = listings[id].seller;
            prices[i] = listings[id].price;
        }
    }

    /// @notice 활성 리스팅 수를 조회합니다
    function getListingCount() external view returns (uint256) {
        return listedTokenIds.length;
    }

    /// @notice 플랫폼 수수료를 변경합니다
    /// @param _feeBps 새로운 수수료 (basis points, max 1000)
    function setPlatformFee(uint256 _feeBps) external onlyOwner {
        if (_feeBps > 1000) revert FeeTooHigh();
        platformFeeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }

    /// @notice 축적된 플랫폼 수수료를 출금합니다
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert TransferFailed();
        emit Withdrawn(owner, balance);
    }

    // ── Internal Functions ──────────────────────────────

    /// @notice 리스팅을 제거합니다 (swap-and-pop)
    function _removeListing(uint256 tokenId) internal {
        uint256 index = _tokenIdIndex[tokenId];
        uint256 lastIndex = listedTokenIds.length - 1;

        if (index != lastIndex) {
            uint256 lastTokenId = listedTokenIds[lastIndex];
            listedTokenIds[index] = lastTokenId;
            _tokenIdIndex[lastTokenId] = index;
        }

        listedTokenIds.pop();
        delete _tokenIdIndex[tokenId];
        delete listings[tokenId];
    }
}
