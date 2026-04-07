// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/CardPack.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        CardPack cardPack = new CardPack(
            0.01 ether, // packPrice
            5            // cardsPerPack
        );

        console.log("CardPack deployed at:", address(cardPack));

        vm.stopBroadcast();
    }
}
