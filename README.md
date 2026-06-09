# CeloSense

> Autonomous on-chain intelligence agent for the Celo ecosystem.
> Built for Celo Proof of Ship — June 2026.

CeloSense monitors wallet activity on Celo mainnet, flags whale movements, and delivers pay-per-query insights inside MiniPay via x402 micropayments. Every query is recorded on-chain through the CeloSenseRegistry contract.

**Live:** [celosense.vercel.app](https://celosense.vercel.app)
**Contract:** [CeloSenseRegistry on Celoscan](https://celoscan.io/address/0xda0f76E12d9571f3fc62D3C65CFF1662E4235046#code)
**Builder:** [@olumi441](https://x.com/olumi441)

---

## What it does

- Detects MiniPay wallet and auto-connects — no connect button inside MiniPay
- Analyzes any Celo wallet: balances, recent USDC transfers, whale flags, activity score
- Pay-per-query API gated by on-chain payment — $0.01 USDC per query via `recordQuery()`
- Every query is recorded on-chain to the CeloSenseRegistry contract
- On-chain registry for wallet opt-in monitoring — permanent, verifiable credential
- Agent backend polls Celo mainnet via viem, no centralized database

---

## How it works

```
MiniPay / Browser Wallet
        ↓
  CeloSense App (Next.js · wagmi · viem)
        ↓
  Approve USDC → recordQuery() on CeloSenseRegistry
        ↓
  Intelligence Agent          CeloSenseRegistry
  Balances · whale flags      Solidity · verified
        ↓                            ↓
         Celo Mainnet · Chain ID 42220
```

1. **Connect** — wallet connects via MiniPay (auto) or browser (MetaMask)
2. **Approve** — user approves $0.01 USDC spend on the registry contract
3. **Record** — `recordQuery()` collects payment, emits `QueryRecorded` event on-chain
4. **Analyze** — backend fetches balances, scans 500 blocks for USDC transfers, flags whales
5. **Register** — users can call `register()` to create a permanent on-chain monitoring credential

---

## Stack

- **Frontend**: Next.js 14, wagmi v2, viem v2, thirdweb v5
- **Contract**: Solidity 0.8.20, Hardhat
- **Chain**: Celo Mainnet (chainId 42220)
- **RPC**: forno.celo.org (public, no API key)
- **Payments**: on-chain USDC via CeloSenseRegistry.recordQuery()

---

## Contract

| | |
|---|---|
| **Address** | `0xda0f76E12d9571f3fc62D3C65CFF1662E4235046` |
| **Network** | Celo Mainnet (42220) |
| **Verification** | Source Code Verified — Exact Match |
| **Query Price** | 10000 (raw) = $0.01 USDC |
| **Fee Recipient** | Configurable via `setFeeRecipient()` |

### Key functions

```solidity
register()                    // Opt wallet into monitoring
deregister()                  // Opt out
recordQuery(address target)   // Pay $0.01 USDC + emit QueryRecorded event
getStatus(address wallet)     // Check registration status
totalRegistered               // Total registered wallets
totalQueries                  // Total queries recorded on-chain
```

---

## Setup

```bash
git clone https://github.com/2TheMoom/celosense
cd celosense
npm install
cp .env.example .env.local
# Fill in your keys
```

---

## Deploy contract

```bash
# Mainnet
npm run deploy:mainnet

# Verify on Celoscan
npx hardhat verify --network celo <ADDRESS> "<USDC>" "<FEE_RECIPIENT>" "10000"
```

---

## Run locally

```bash
npm run dev
# App at http://localhost:3000/landing
# Test inside MiniPay via ngrok
```

---

## Environment variables

```
DEPLOYER_PRIVATE_KEY=         # Deployer wallet private key
NEXT_PUBLIC_REGISTRY_ADDRESS= # Deployed contract address
AGENT_PRIVATE_KEY=            # Agent wallet private key
FEE_RECIPIENT=                # Wallet that receives query fees
NEXT_PUBLIC_FEE_RECIPIENT=    # Same as above (client-side)
CELOSCAN_API_KEY=             # Etherscan V2 API key
```

---

## MiniPay compatibility

The required MiniPay hook lives in `src/hooks/useMiniPay.ts`:

```ts
useEffect(() => {
  if (window.ethereum && window.ethereum.isMiniPay) {
    connect({ connector: injected({ target: "metaMask" }) });
  }
}, []);
```

Auto-connects wallet inside MiniPay, hides the connect button.

---

## Proof of Ship checklist

- [x] MiniPay hook — `window.ethereum.isMiniPay` detection + auto-connect
- [x] Smart contract deployed and verified on Celo mainnet
- [x] On-chain query payments via `recordQuery()`
- [x] Project submitted on Talent App
- [x] AI agent track — autonomous wallet analysis, on-chain payment gate

---

## ⚠️ Fee routing

```
# In .env.local — set this to YOUR wallet address
# Query fees ($0.01 USDC per query) route on-chain to this address
FEE_RECIPIENT=0xYourWalletAddress
NEXT_PUBLIC_FEE_RECIPIENT=0xYourWalletAddress
```

---

## License

MIT — Built by [Abu Olumi](https://x.com/olumi441)