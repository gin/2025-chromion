// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract Vault {
    address public owner;
    mapping(address => uint256) public balances;
    mapping(address => bool) public canWithdraw;

    event Deposited(address indexed user, uint256 indexed amount);
    event Withdrawn(address indexed user, uint256 indexed amount);
    event Burned(address indexed user, uint256 indexed amount);

    error Vault__NotOwner();
    error Vault__InvalidDeposit();
    error Vault__InsufficientBalance();
    error Vault__TransferFailed();
    error Vault__WithdrawalNotAllowed();

    modifier onlyOwner() {
        require(msg.sender == owner, Vault__NotOwner());
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        require(msg.value > 0, Vault__InvalidDeposit());
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(canWithdraw[msg.sender], Vault__WithdrawalNotAllowed());
        require(balances[msg.sender] >= amount, Vault__InsufficientBalance());

        balances[msg.sender] -= amount;

        (bool success,) = msg.sender.call{value: amount}("");
        require(success, Vault__TransferFailed());
        emit Withdrawn(msg.sender, amount);
    }

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    // Gets called if user's score is below or equal their goal
    function allowWithdrawal(address user) external onlyOwner {
        canWithdraw[user] = true;
    }

    // Gets called if user's score is above their goal
    function burn(address user) external onlyOwner {
        require(balances[user] > 0, Vault__InsufficientBalance());
        uint256 amount = balances[user];
        balances[user] = 0;

        (bool success,) = address(0xdead).call{value: amount}("");
        require(success, Vault__TransferFailed());
        emit Burned(user, amount);
    }

    receive() external payable {}
    fallback() external payable {}
}
