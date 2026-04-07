// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/CardPack.sol";

contract CardPackTest is Test {
    CardPack public cardPack;
    address public deployer = address(1);
    address public buyer = address(2);

    uint256 constant PACK_PRICE = 0.01 ether;
    uint256 constant CARDS_PER_PACK = 5;

    function setUp() public {
        vm.prank(deployer);
        cardPack = new CardPack(PACK_PRICE, CARDS_PER_PACK);
        vm.deal(buyer, 10 ether);
    }

    // ── buyPack ─────────────────────────────────────────

    function test_buyPack_success() public {
        vm.prank(buyer);
        cardPack.buyPack{value: PACK_PRICE}();

        assertEq(cardPack.totalMinted(), CARDS_PER_PACK);
        assertEq(cardPack.balanceOf(buyer), CARDS_PER_PACK);
    }

    function test_buyPack_emitsPackOpened() public {
        vm.prank(buyer);
        vm.recordLogs();
        cardPack.buyPack{value: PACK_PRICE}();

        Vm.Log[] memory entries = vm.getRecordedLogs();
        // PackOpened event should be the last one (after Transfer events)
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == keccak256("PackOpened(address,uint256[],uint8[])")) {
                found = true;
                break;
            }
        }
        assertTrue(found, "PackOpened event not emitted");
    }

    function test_buyPack_insufficientETH() public {
        vm.prank(buyer);
        vm.expectRevert(CardPack.InsufficientETH.selector);
        cardPack.buyPack{value: 0.001 ether}();
    }

    function test_buyPack_rarityRange() public {
        vm.prank(buyer);
        cardPack.buyPack{value: PACK_PRICE}();

        for (uint256 i = 0; i < CARDS_PER_PACK; i++) {
            uint8 rarity = cardPack.cardRarity(i);
            assertTrue(rarity <= 3, "Rarity out of range");
        }
    }

    // ── getCardsByOwner ─────────────────────────────────

    function test_getCardsByOwner() public {
        vm.prank(buyer);
        cardPack.buyPack{value: PACK_PRICE}();

        uint256[] memory cards = cardPack.getCardsByOwner(buyer);
        assertEq(cards.length, CARDS_PER_PACK);
    }

    // ── withdraw ────────────────────────────────────────

    function test_withdraw_success() public {
        vm.prank(buyer);
        cardPack.buyPack{value: PACK_PRICE}();

        uint256 balanceBefore = deployer.balance;
        vm.prank(deployer);
        cardPack.withdraw();
        uint256 balanceAfter = deployer.balance;

        assertEq(balanceAfter - balanceBefore, PACK_PRICE);
    }

    function test_withdraw_notOwner() public {
        vm.prank(buyer);
        vm.expectRevert(CardPack.NotOwner.selector);
        cardPack.withdraw();
    }

    // ── setPackPrice ────────────────────────────────────

    function test_setPackPrice_success() public {
        vm.prank(deployer);
        cardPack.setPackPrice(0.02 ether);
        assertEq(cardPack.getPackPrice(), 0.02 ether);
    }

    function test_setPackPrice_notOwner() public {
        vm.prank(buyer);
        vm.expectRevert(CardPack.NotOwner.selector);
        cardPack.setPackPrice(0.02 ether);
    }

    function test_setPackPrice_zero() public {
        vm.prank(deployer);
        vm.expectRevert(CardPack.ZeroPrice.selector);
        cardPack.setPackPrice(0);
    }

    function test_setPackPrice_emitsEvent() public {
        vm.prank(deployer);
        vm.expectEmit(false, false, false, true);
        emit CardPack.PackPriceUpdated(0.05 ether);
        cardPack.setPackPrice(0.05 ether);
    }
}
