// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title CeloSenseRegistry
 * @author @olumi441
 * @notice Registry for wallets opting into CeloSense monitoring.
 *         Also accepts on-chain query payments via recordQuery().
 */
contract CeloSenseRegistry {
    // ─── State ────────────────────────────────────────────────────────────────
    address public owner;
    address public feeRecipient;
    address public usdcToken;
    uint256 public queryPrice;

    mapping(address => bool) public registered;
    mapping(address => uint256) public registeredAt;
    mapping(address => uint256) public queryCount;
    uint256 public totalRegistered;
    uint256 public totalQueries;

    // ─── Events ───────────────────────────────────────────────────────────────
    event WalletRegistered(address indexed wallet, uint256 timestamp);
    event WalletDeregistered(address indexed wallet, uint256 timestamp);
    event QueryRecorded(address indexed querier, address indexed target, uint256 timestamp);
    event QueryPriceUpdated(uint256 newPrice);
    event FeeRecipientUpdated(address newRecipient);

    // ─── Errors ───────────────────────────────────────────────────────────────
    error AlreadyRegistered();
    error NotRegistered();
    error ZeroAddress();
    error Unauthorized();
    error PaymentFailed();

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address _usdcToken, address _feeRecipient, uint256 _queryPrice) {
        owner = msg.sender;
        usdcToken = _usdcToken;
        feeRecipient = _feeRecipient;
        queryPrice = _queryPrice;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    // ─── Registration ─────────────────────────────────────────────────────────
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

    // ─── Query payment ────────────────────────────────────────────────────────
    function recordQuery(address target) external {
        bool success = IERC20(usdcToken).transferFrom(msg.sender, feeRecipient, queryPrice);
        if (!success) revert PaymentFailed();
        queryCount[msg.sender]++;
        totalQueries++;
        emit QueryRecorded(msg.sender, target, block.timestamp);
    }

    // ─── Views ────────────────────────────────────────────────────────────────
    function getStatus(address wallet)
        external
        view
        returns (bool isRegistered, uint256 timestamp)
    {
        return (registered[wallet], registeredAt[wallet]);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────
    function setQueryPrice(uint256 _price) external onlyOwner {
        queryPrice = _price;
        emit QueryPriceUpdated(_price);
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        if (_recipient == address(0)) revert ZeroAddress();
        feeRecipient = _recipient;
        emit FeeRecipientUpdated(_recipient);
    }
}