// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CeloSenseRegistry
 * @author @olumi441
 * @notice Registry for wallets opting into CeloSense on-chain intelligence monitoring.
 * @dev Minimal, non-upgradeable, no proxies. Deploy once, own forever.
 */
contract CeloSenseRegistry {
    mapping(address => bool) public registered;
    mapping(address => uint256) public registeredAt;
    uint256 public totalRegistered;

    event WalletRegistered(address indexed wallet, uint256 timestamp);
    event WalletDeregistered(address indexed wallet, uint256 timestamp);

    error AlreadyRegistered();
    error NotRegistered();
    error ZeroAddress();

    function register() external {
        if (msg.sender == address(0)) revert ZeroAddress();
        if (registered[msg.sender]) revert AlreadyRegistered();
        registered[msg.sender] = true;
        registeredAt[msg.sender] = block.timestamp;
        totalRegistered++;
        emit WalletRegistered(msg.sender, block.timestamp);
    }

    function deregister() external {
        if (!registered[msg.sender]) revert NotRegistered();
        registered[msg.sender] = false;
        registeredAt[msg.sender] = 0;
        totalRegistered--;
        emit WalletDeregistered(msg.sender, block.timestamp);
    }

    function getStatus(address wallet)
        external
        view
        returns (bool isRegistered, uint256 timestamp)
    {
        return (registered[wallet], registeredAt[wallet]);
    }
}