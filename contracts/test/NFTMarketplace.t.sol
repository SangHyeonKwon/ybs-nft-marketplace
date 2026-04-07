// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/CardPack.sol";
import "../src/NFTMarketplace.sol";

contract NFTMarketplaceTest is Test {
    CardPack public cardPack;
    NFTMarketplace public marketplace;

    address public deployer = address(1);
    address public seller = address(2);
    address public buyer = address(3);
    address public other = address(4);

    uint256 constant PACK_PRICE = 0.01 ether;
    uint256 constant CARDS_PER_PACK = 5;
    uint256 constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 constant LISTING_PRICE = 0.05 ether;

    function setUp() public {
        vm.prank(deployer);
        cardPack = new CardPack(PACK_PRICE, CARDS_PER_PACK);

        vm.prank(deployer);
        marketplace = new NFTMarketplace(address(cardPack), PLATFORM_FEE_BPS);

        // seller가 팩 구매 → 5장 보유
        vm.deal(seller, 10 ether);
        vm.prank(seller);
        cardPack.buyPack{value: PACK_PRICE}();

        // seller가 마켓플레이스에 approval 부여
        vm.prank(seller);
        cardPack.setApprovalForAll(address(marketplace), true);

        vm.deal(buyer, 10 ether);
    }

    // ── listCard ──────────────────────────────────────

    function test_listCard_success() public {
        vm.prank(seller);
        marketplace.listCard(0, LISTING_PRICE);

        (address listedSeller, uint256 listedPrice) = marketplace.listings(0);
        assertEq(listedSeller, seller);
        assertEq(listedPrice, LISTING_PRICE);
        assertEq(marketplace.getListingCount(), 1);
    }

    function test_listCard_emitsEvent() public {
        vm.prank(seller);
        vm.expectEmit(true, true, false, true);
        emit NFTMarketplace.CardListed(0, seller, LISTING_PRICE);
        marketplace.listCard(0, LISTING_PRICE);
    }

    function test_listCard_notOwner() public {
        vm.prank(buyer);
        vm.expectRevert(NFTMarketplace.NotTokenOwner.selector);
        marketplace.listCard(0, LISTING_PRICE);
    }

    function test_listCard_notApproved() public {
        // other가 팩 구매하지만 approval 안 줌
        vm.deal(other, 10 ether);
        vm.prank(other);
        cardPack.buyPack{value: PACK_PRICE}();

        vm.prank(other);
        vm.expectRevert(NFTMarketplace.NotApproved.selector);
        marketplace.listCard(5, LISTING_PRICE);
    }

    function test_listCard_alreadyListed() public {
        vm.prank(seller);
        marketplace.listCard(0, LISTING_PRICE);

        vm.prank(seller);
        vm.expectRevert(NFTMarketplace.AlreadyListed.selector);
        marketplace.listCard(0, LISTING_PRICE);
    }

    function test_listCard_zeroPrice() public {
        vm.prank(seller);
        vm.expectRevert(NFTMarketplace.ZeroPrice.selector);
        marketplace.listCard(0, 0);
    }

    // ── buyCard ───────────────────────────────────────

    function test_buyCard_success() public {
        vm.prank(seller);
        marketplace.listCard(0, LISTING_PRICE);

        uint256 sellerBalBefore = seller.balance;

        vm.prank(buyer);
        marketplace.buyCard{value: LISTING_PRICE}(0);

        // NFT가 buyer에게 이전됨
        assertEq(cardPack.ownerOf(0), buyer);
        // 리스팅 제거됨
        assertEq(marketplace.getListingCount(), 0);
        // seller가 ETH 받음 (수수료 차감)
        uint256 fee = (LISTING_PRICE * PLATFORM_FEE_BPS) / 10000;
        assertEq(seller.balance - sellerBalBefore, LISTING_PRICE - fee);
    }

    function test_buyCard_insufficientPayment() public {
        vm.prank(seller);
        marketplace.listCard(0, LISTING_PRICE);

        vm.prank(buyer);
        vm.expectRevert(NFTMarketplace.InsufficientPayment.selector);
        marketplace.buyCard{value: 0.01 ether}(0);
    }

    function test_buyCard_ownListing() public {
        vm.prank(seller);
        marketplace.listCard(0, LISTING_PRICE);

        vm.prank(seller);
        vm.expectRevert(NFTMarketplace.CannotBuyOwnListing.selector);
        marketplace.buyCard{value: LISTING_PRICE}(0);
    }

    function test_buyCard_notListed() public {
        vm.prank(buyer);
        vm.expectRevert(NFTMarketplace.NotListed.selector);
        marketplace.buyCard{value: LISTING_PRICE}(99);
    }

    function test_buyCard_emitsEvent() public {
        vm.prank(seller);
        marketplace.listCard(0, LISTING_PRICE);

        vm.prank(buyer);
        vm.expectEmit(true, true, true, true);
        emit NFTMarketplace.CardSold(0, seller, buyer, LISTING_PRICE);
        marketplace.buyCard{value: LISTING_PRICE}(0);
    }

    // ── cancelListing ─────────────────────────────────

    function test_cancelListing_success() public {
        vm.prank(seller);
        marketplace.listCard(0, LISTING_PRICE);

        vm.prank(seller);
        marketplace.cancelListing(0);

        assertEq(marketplace.getListingCount(), 0);
        (address s, ) = marketplace.listings(0);
        assertEq(s, address(0));
    }

    function test_cancelListing_notSeller() public {
        vm.prank(seller);
        marketplace.listCard(0, LISTING_PRICE);

        vm.prank(buyer);
        vm.expectRevert(NFTMarketplace.NotTokenOwner.selector);
        marketplace.cancelListing(0);
    }

    function test_cancelListing_notListed() public {
        vm.prank(seller);
        vm.expectRevert(NFTMarketplace.NotListed.selector);
        marketplace.cancelListing(99);
    }

    // ── getActiveListings ─────────────────────────────

    function test_getActiveListings() public {
        vm.startPrank(seller);
        marketplace.listCard(0, 0.01 ether);
        marketplace.listCard(1, 0.02 ether);
        marketplace.listCard(2, 0.03 ether);
        vm.stopPrank();

        (uint256[] memory ids, address[] memory sellers, uint256[] memory prices) =
            marketplace.getActiveListings();

        assertEq(ids.length, 3);
        assertEq(sellers[0], seller);
        assertEq(prices[1], 0.02 ether);
    }

    // ── Platform fee ──────────────────────────────────

    function test_platformFee_distribution() public {
        vm.prank(seller);
        marketplace.listCard(0, 1 ether);

        uint256 marketBalBefore = address(marketplace).balance;

        vm.prank(buyer);
        marketplace.buyCard{value: 1 ether}(0);

        // 2.5% fee = 0.025 ether stays in contract
        uint256 expectedFee = (1 ether * 250) / 10000;
        assertEq(address(marketplace).balance - marketBalBefore, expectedFee);
    }

    function test_setPlatformFee_tooHigh() public {
        vm.prank(deployer);
        vm.expectRevert(NFTMarketplace.FeeTooHigh.selector);
        marketplace.setPlatformFee(1001);
    }

    // ── withdraw ──────────────────────────────────────

    function test_withdraw() public {
        // 거래로 수수료 축적
        vm.prank(seller);
        marketplace.listCard(0, 1 ether);
        vm.prank(buyer);
        marketplace.buyCard{value: 1 ether}(0);

        uint256 fee = (1 ether * 250) / 10000;
        uint256 deployerBalBefore = deployer.balance;

        vm.prank(deployer);
        marketplace.withdraw();

        assertEq(deployer.balance - deployerBalBefore, fee);
    }

    function test_withdraw_notOwner() public {
        vm.prank(buyer);
        vm.expectRevert(NFTMarketplace.NotContractOwner.selector);
        marketplace.withdraw();
    }
}
