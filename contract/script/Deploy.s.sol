// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";
import {Vault} from "../src/Vault.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Counter counter = new Counter();
        console2.log("Counter deployed at:", address(counter));

        Vault vault = new Vault();
        console2.log("Vault deployed at:", address(vault));

        vm.stopBroadcast();
    }
}
