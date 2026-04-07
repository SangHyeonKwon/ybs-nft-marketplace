// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/NFTMarketplace.sol";

contract DeployMarketplace is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address cardPackAddress = vm.envAddress("CARD_PACK_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        NFTMarketplace marketplace = new NFTMarketplace(
            cardPackAddress,
            250 // 2.5% platform fee
        );

        console.log("NFTMarketplace deployed at:", address(marketplace));

        vm.stopBroadcast();
    }
}
