// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/AfterLifeProtocol.sol";

contract DeployLocalScript is Script {
    function run() external {
        // Use the first account from Anvil (has 1000 ETH)
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with the account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy AfterLifeProtocol
        AfterLifeProtocol afterLifeProtocol = new AfterLifeProtocol();

        console.log(
            "AfterLifeProtocol deployed to:",
            address(afterLifeProtocol)
        );

        vm.stopBroadcast();
    }
}

