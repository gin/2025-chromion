// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test, console} from "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";

contract VaultTest is Test {
    Vault public vault;

    function setUp() public {
        vault = new Vault();
        vm.deal(address(this), 1 ether); // Give the test contract some ether
    }

    function test_Deposit() public {
        vm.startPrank(address(this));
        vault.deposit{value: 0.5 ether}();
        assertEq(vault.getBalance(), 0.5 ether);
        vm.stopPrank();
    }

    function test_Withdraw() public {
        vm.startPrank(address(this));
        vault.deposit{value: 0.5 ether}();
        vault.allowWithdrawal(address(this));
        console.log(vault.canWithdraw(address(this)));
        vault.withdraw(0.5 ether);
        assertEq(vault.getBalance(), 0);
        vm.stopPrank();
    }

    function test_Burn() public {
        vm.startPrank(address(this));
        vault.deposit{value: 0.5 ether}();
        vault.allowWithdrawal(address(this));
        vault.burn(address(this));
        assertEq(vault.getBalance(), 0);
        vm.stopPrank();
    }

    receive() external payable {}

    fallback() external payable {}
}
