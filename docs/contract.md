# CeloSense Contract Reference

## CeloSenseRegistry

Deployed on Celo Mainnet. Non-upgradeable, no admin keys except `setQueryPrice` and `setFeeRecipient`.

**Address:** `0xda0f76E12d9571f3fc62D3C65CFF1662E4235046`
**Network:** Celo Mainnet (Chain ID 42220)
**Verification:** [Celoscan — Source Code Verified](https://celoscan.io/address/0xda0f76E12d9571f3fc62D3C65CFF1662E4235046#code)
**Compiler:** Solidity 0.8.20 · Optimizer enabled · 200 runs

---

## State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `owner` | `address` | Contract deployer — can update price and fee recipient |
| `feeRecipient` | `address` | Wallet that receives $0.01 USDC per query |
| `usdcToken` | `address` | USDC contract address on Celo mainnet |
| `queryPrice` | `uint256` | Query price in raw USDC units (10000 = $0.01) |
| `registered` | `mapping(address => bool)` | Whether a wallet is registered |
| `registeredAt` | `mapping(address => uint256)` | Registration timestamp per wallet |
| `queryCount` | `mapping(address => uint256)` | Total queries per wallet |
| `totalRegistered` | `uint256` | Total currently registered wallets |
| `totalQueries` | `uint256` | All-time total queries recorded |

---

## Functions

### register()

```solidity
function register() external
```

Opts the caller's wallet into CeloSense monitoring. Creates a permanent on-chain credential with a timestamp.

**Reverts:**
- `AlreadyRegistered()` — if wallet is already registered
- `ZeroAddress()` — if caller is zero address

**Emits:** `WalletRegistered(address indexed wallet, uint256 timestamp)`

---

### deregister()

```solidity
function deregister() external
```

Opts the caller's wallet out of monitoring. Clears registration timestamp and decrements counter.

**Reverts:**
- `NotRegistered()` — if wallet is not registered

**Emits:** `WalletDeregistered(address indexed wallet, uint256 timestamp)`

---

### recordQuery(address target)

```solidity
function recordQuery(address target) external
```

Records an intelligence query on-chain. Collects $0.01 USDC from the caller via `transferFrom` and routes it to `feeRecipient`. Increments `queryCount` and `totalQueries`.

**Parameters:**
- `target` — the wallet address being queried

**Reverts:**
- `PaymentFailed()` — if USDC `transferFrom` returns false (insufficient balance or allowance)

**Emits:** `QueryRecorded(address indexed querier, address indexed target, uint256 timestamp)`

**Note:** Caller must approve at least `queryPrice` USDC to the registry contract before calling.

---

### getStatus(address wallet)

```solidity
function getStatus(address wallet) external view returns (bool isRegistered, uint256 timestamp)
```

Returns registration status and timestamp for any address.

**Parameters:**
- `wallet` — address to query

**Returns:**
- `isRegistered` — whether the wallet is registered
- `timestamp` — Unix timestamp of registration (0 if not registered)

---

### setQueryPrice(uint256 _price)

```solidity
function setQueryPrice(uint256 _price) external onlyOwner
```

Updates the query price in raw USDC units.

**Emits:** `QueryPriceUpdated(uint256 newPrice)`

---

### setFeeRecipient(address _recipient)

```solidity
function setFeeRecipient(address _recipient) external onlyOwner
```

Updates the wallet that receives query fees.

**Reverts:** `ZeroAddress()` — if recipient is zero address

**Emits:** `FeeRecipientUpdated(address newRecipient)`

---

## Events

### WalletRegistered

```solidity
event WalletRegistered(address indexed wallet, uint256 timestamp)
```

Emitted when a wallet successfully registers.

---

### WalletDeregistered

```solidity
event WalletDeregistered(address indexed wallet, uint256 timestamp)
```

Emitted when a wallet deregisters.

---

### QueryRecorded

```solidity
event QueryRecorded(address indexed querier, address indexed target, uint256 timestamp)
```

Emitted on every successful intelligence query. Both `querier` and `target` are indexed for efficient filtering.

---

### QueryPriceUpdated

```solidity
event QueryPriceUpdated(uint256 newPrice)
```

Emitted when the owner updates the query price.

---

### FeeRecipientUpdated

```solidity
event FeeRecipientUpdated(address newRecipient)
```

Emitted when the owner updates the fee recipient.

---

## Custom Errors

| Error | Thrown when |
|-------|------------|
| `AlreadyRegistered()` | Wallet calls `register()` but is already registered |
| `NotRegistered()` | Wallet calls `deregister()` but is not registered |
| `ZeroAddress()` | Zero address passed to `register()` or `setFeeRecipient()` |
| `Unauthorized()` | Non-owner calls `setQueryPrice()` or `setFeeRecipient()` |
| `PaymentFailed()` | USDC `transferFrom` returns false in `recordQuery()` |

---

## Constructor Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `_usdcToken` | `0xcebA9300f2b948710d2653dD7B07f33A8B32118C` | USDC on Celo mainnet |
| `_feeRecipient` | `0x701F6eab7854509A578143f51b2AEc5BcC308De7` | Fee recipient wallet |
| `_queryPrice` | `10000` | $0.01 USDC in raw units (6 decimals) |

---

## Integration Example

```ts
import { useWriteContract } from "wagmi";

const REGISTRY = "0xda0f76E12d9571f3fc62D3C65CFF1662E4235046";
const USDC = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
const QUERY_PRICE = 10000n; // $0.01

// Step 1: Approve USDC
await writeContractAsync({
  address: USDC,
  abi: [{ name: "approve", type: "function", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" }],
  functionName: "approve",
  args: [REGISTRY, QUERY_PRICE],
});

// Step 2: Record query
await writeContractAsync({
  address: REGISTRY,
  abi: [{ name: "recordQuery", type: "function", inputs: [{ name: "target", type: "address" }], outputs: [], stateMutability: "nonpayable" }],
  functionName: "recordQuery",
  args: ["0xTargetWalletAddress"],
});
```

---

## ERC-8004 Identity

CeloSense is registered on the ERC-8004 Identity Registry on Celo mainnet.

| Field | Value |
|-------|-------|
| Agent ID | 9228 |
| Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| Profile | [8004scan.io/agents/celo/9228](https://8004scan.io/agents/celo/9228) |

---

*Built by [Abu Olumi](https://x.com/olumi441)