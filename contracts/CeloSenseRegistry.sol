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
 *         Accepts on-chain query payments via recordQuery().
 *         Accepts autonomous agent decision logs via logDecision().
 */
contract CeloSenseRegistry {
    address public owner;
    address public feeRecipient;
    address public agentWallet;
    address public usdcToken;
    uint256 public queryPrice;
    uint256 public decisionPrice;

    mapping(address => bool) public registered;
    mapping(address => uint256) public registeredAt;
    mapping(address => uint256) public queryCount;
    uint256 public totalRegistered;
    uint256 public totalQueries;
    uint256 public totalDecisions;

    event WalletRegistered(address indexed wallet, uint256 timestamp);
    event WalletDeregistered(address indexed wallet, uint256 timestamp);
    event QueryRecorded(address indexed querier, address indexed target, uint256 timestamp);
    event DecisionLogged(address indexed agent, string decisionType, address indexed target, uint256 score, uint256 timestamp);
    event QueryPriceUpdated(uint256 newPrice);
    event DecisionPriceUpdated(uint256 newPrice);
    event FeeRecipientUpdated(address newRecipient);
    event AgentWalletUpdated(address newAgent);

    error AlreadyRegistered();
    error NotRegistered();
    error ZeroAddress();
    error Unauthorized();
    error PaymentFailed();

    constructor(
        address _usdcToken,
        address _feeRecipient,
        address _agentWallet,
        uint256 _queryPrice,
        uint256 _decisionPrice
    ) {
        owner = msg.sender;
        usdcToken = _usdcToken;
        feeRecipient = _feeRecipient;
        agentWallet = _agentWallet;
        queryPrice = _queryPrice;
        decisionPrice = _decisionPrice;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAgent() {
        if (msg.sender != agentWallet) revert Unauthorized();
        _;
    }

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

    function recordQuery(address target) external {
        bool success = IERC20(usdcToken).transferFrom(msg.sender, feeRecipient, queryPrice);
        if (!success) revert PaymentFailed();
        queryCount[msg.sender]++;
        totalQueries++;
        emit QueryRecorded(msg.sender, target, block.timestamp);
    }

    function logDecision(
        string calldata decisionType,
        address target,
        uint256 score
    ) external onlyAgent {
        bool success = IERC20(usdcToken).transferFrom(msg.sender, feeRecipient, decisionPrice);
        if (!success) revert PaymentFailed();
        totalDecisions++;
        emit DecisionLogged(msg.sender, decisionType, target, score, block.timestamp);
    }

    function getStatus(address wallet)
        external
        view
        returns (bool isRegistered, uint256 timestamp)
    {
        return (registered[wallet], registeredAt[wallet]);
    }

    function setQueryPrice(uint256 _price) external onlyOwner {
        queryPrice = _price;
        emit QueryPriceUpdated(_price);
    }

    function setDecisionPrice(uint256 _price) external onlyOwner {
        decisionPrice = _price;
        emit DecisionPriceUpdated(_price);
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        if (_recipient == address(0)) revert ZeroAddress();
        feeRecipient = _recipient;
        emit FeeRecipientUpdated(_recipient);
    }

    function setAgentWallet(address _agent) external onlyOwner {
        if (_agent == address(0)) revert ZeroAddress();
        agentWallet = _agent;
        emit AgentWalletUpdated(_agent);
    }
}