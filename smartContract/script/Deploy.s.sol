// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/AfterLifeProtocol.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
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

