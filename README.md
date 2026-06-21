# CeloSense

> Autonomous on-chain intelligence agent for the Celo ecosystem.
> Built for Celo Proof of Ship & Celo Onchain Agents Hackathon — June 2026.

CeloSense monitors Celo mainnet every 5 minutes, detects whale movements, scores wallet activity, and logs every decision permanently on-chain via the CeloSenseRegistry contract. Pay-per-query intelligence ($0.01 USDC) delivered inside MiniPay via x402 micropayments.

**Live:** [celosense.vercel.app](https://celosense.vercel.app)
**Contract:** [CeloSenseRegistry on Celoscan](https://celoscan.io/address/0x8a30F753942458897619A83D6467B0FF62DE7Abd#code)
**ERC-8004 Agent:** [8004scan.io/agents/celo/9228](https://8004scan.io/agents/celo/9228)
**Builder:** [@olumi441](https://x.com/olumi441)

---

## What it does

### Intelligence Tab
- Analyzes any Celo wallet — CELO/USDC/USDT balances with live CELO/USD price
- Scans last 1,000 blocks for USDC transfers, flags whale activity (>$10,000)
- Computes activity score 0–100 based on transfer volume and frequency
- **Premium Intelligence Summary Card** — natural language explanation of wallet behavior, status badge, 4 metric tiles, and signal pills
- Pay-per-query API gated by on-chain USDC payment — $0.01 via `recordQuery()`

### Registry Tab
- On-chain wallet registration — permanent, verifiable credential on Celo mainnet
- **Personal Stats Card** — days registered and total queries paid on-chain
- **Live Registration Feed** — recent `WalletRegistered` events with active/inactive status and Celoscan links
- Tracks total registered wallets across the ecosystem

### Agent Tab
- Autonomous agent runs every 5 minutes via cron, funded by a dedicated agent wallet
- Classifies each run: `HIGH_WHALE_ACTIVITY` / `WHALE_DETECTED` / `HIGH_VOLUME` / `NORMAL` / `QUIET_PERIOD`
- Logs every decision on-chain via `logDecision()` — $0.0001 USDC per decision
- Every entry links directly to the **largest** transfer transaction on Celoscan (not just the address)

### Leaderboard Tab
- **Premium Summary Card** — total unique whales, flag count, top flagged wallet, last detection time
- Rankings built entirely from on-chain `DecisionLogged` events — no database
- Medal ranking for top 3 flagged wallets with direct Celoscan transfer links
- Auto-refreshes every 5 minutes in sync with the agent cycle

---

## Architecture

```
cron-job.org (every 5 min)
        ↓
  /api/agent/run
        ↓
  Scan 500 blocks → classify → logDecision() → CeloSenseRegistry
        ↓
  DecisionLogged event emitted on Celo mainnet


MiniPay / Browser Wallet
        ↓
  CeloSense App (Next.js 14 · wagmi v2 · viem v2)
        ↓
  Approve USDC → recordQuery(target) → CeloSenseRegistry
        ↓
  Intelligence Agent (viem publicClient)
  Balances · Transfers · Whale flags · Activity score · NL Summary
```

---

## Contracts

### CeloSenseRegistry (v3 — current)

| | |
|---|---|
| **Address** | `0x8a30F753942458897619A83D6467B0FF62DE7Abd` |
| **Network** | Celo Mainnet (Chain ID 42220) |
| **Verification** | [Source Verified on Celoscan](https://celoscan.io/address/0x8a30F753942458897619A83D6467B0FF62DE7Abd#code) |
| **Query Price** | 10000 raw = $0.01 USDC |
| **Decision Price** | 100 raw = $0.0001 USDC |

### Key functions

```solidity
register()                                              // Opt wallet into monitoring
deregister()                                            // Opt out
recordQuery(address target)                             // Pay $0.01 USDC + emit QueryRecorded
logDecision(string type, address target, uint256 score) // Agent only — $0.0001 USDC
getStatus(address wallet)                               // Check registration + timestamp
totalRegistered                                         // Live registered wallet count
totalQueries                                            // All-time query count
totalDecisions                                          // All-time agent decision count
```

### ERC-8004 Identity

| | |
|---|---|
| **Agent ID** | 9228 |
| **Registry** | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| **Profile** | [8004scan.io/agents/celo/9228](https://8004scan.io/agents/celo/9228) |
| **Agent Wallet** | `0x10745fcCbCF1e12C215a81791af66da7f451E3EE` |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Wallet | wagmi v2, viem v2 |
| Payments | x402 protocol, on-chain USDC |
| Contract | Solidity 0.8.20, Hardhat |
| Chain | Celo Mainnet (Chain ID 42220) |
| RPC | forno.celo.org + rpc.ankr.com/celo (fallback) |
| Cron | cron-job.org (every 5 min) + Vercel daily backup |
| Deployment | Vercel |

---

## Tests

24 Hardhat tests covering all contract functions:

```bash
npx hardhat test
```

```
CeloSenseRegistry - register()      5 tests
CeloSenseRegistry - deregister()    5 tests
CeloSenseRegistry - recordQuery()   6 tests
CeloSenseRegistry - logDecision()   8 tests

24 passing
```

---

## Setup

```bash
git clone https://github.com/2TheMoon/celosense
cd celosense
npm install
cp .env.example .env.local
# Fill in your keys
npm run dev
# App at http://localhost:3000/landing
```

---

## Environment variables

```bash
DEPLOYER_PRIVATE_KEY=           # Deployer wallet private key
NEXT_PUBLIC_REGISTRY_ADDRESS=   # Deployed contract address
AGENT_PRIVATE_KEY=              # Agent wallet private key (NOT your personal wallet)
AGENT_WALLET=                   # Agent wallet public address
FEE_RECIPIENT=                  # Wallet that receives query and decision fees
CRON_SECRET=                    # Bearer token for /api/agent/run endpoint
CELOSCAN_API_KEY=               # For contract verification
```

> ⚠️ **AGENT_PRIVATE_KEY** must be the private key for the dedicated agent wallet, not your personal wallet. The `logDecision()` function uses an `onlyAgent` modifier — calls from any other wallet will revert.

---

## Deploy contract

```bash
npm run deploy:mainnet

npx hardhat verify --network celo <ADDRESS> \
  "<USDC>" "<FEE_RECIPIENT>" "<AGENT_WALLET>" "10000" "100"
```

---

## MiniPay integration

CeloSense detects MiniPay via `window.ethereum.isMiniPay` and auto-connects:

```ts
// src/hooks/useMiniPay.ts
if (window.ethereum?.isMiniPay) {
  connect({ connector: injected({ target: "metaMask" }) });
}
```

Inside MiniPay the connect button is hidden. See `docs/minipay.md` for the full guide.

---

## Docs

| File | Content |
|------|---------|
| `docs/architecture.md` | Full system architecture and component map |
| `docs/contract.md` | Contract ABI, functions, events, custom errors |
| `docs/minipay.md` | MiniPay integration guide with wagmi v2 patterns |
| `CHANGELOG.md` | Full version history |
| `CONTRIBUTING.md` | Contribution guide |
| `SECURITY.md` | Vulnerability reporting process |

---

## Proof of Ship checklist

- [x] MiniPay hook — `window.ethereum.isMiniPay` detection + auto-connect
- [x] Smart contract deployed and verified on Celo mainnet
- [x] On-chain query payments via `recordQuery()`
- [x] Autonomous agent logging decisions every 5 minutes via `logDecision()`
- [x] ERC-8004 identity registry — Agent ID 9228
- [x] Whale leaderboard with premium summary card built from on-chain events
- [x] Live registration feed from on-chain `WalletRegistered` events
- [x] Premium intelligence summary card with natural language analysis
- [x] Live CELO/USD price on every balance query
- [x] 24 passing Hardhat tests
- [x] GitHub issue templates, CONTRIBUTING.md, SECURITY.md
- [x] Submitted to Celo Onchain Agents Hackathon (Best Agent + Most Activity tracks)

---

## License

MIT — Built by [Abu Olumi](https://x.com/olumi441)