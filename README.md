# CeloSense

> Autonomous on-chain intelligence agent for the Celo ecosystem.
> Built for Celo Proof of Ship — June 2026.

CeloSense monitors wallet activity on Celo mainnet, flags whale movements, and delivers pay-per-query intelligence inside MiniPay via x402 micropayments.

**Live:** [celosense.vercel.app](https://celosense.vercel.app)
**Contract:** [CeloSenseRegistry on Celoscan](https://celoscan.io/address/REGISTRY_ADDRESS)
**Builder:** [@olumi441](https://x.com/olumi441)

---

## What it does

- Detects MiniPay wallet and auto-connects (no connect button inside MiniPay)
- Analyzes any Celo wallet: balances, recent USDC transfers, whale flags, activity score
- Pay-per-query API gated by x402 — $0.01 USDC per query, settled on-chain
- On-chain registry contract (`CeloSenseRegistry.sol`) for wallet opt-in monitoring
- Agent backend polls Celo mainnet via viem, no centralized database

---

## Stack

- **Frontend**: Next.js 14, wagmi v2, viem v2, thirdweb v5
- **Contract**: Solidity 0.8.20, Hardhat
- **Payments**: x402 (thirdweb facilitator)
- **Chain**: Celo Mainnet (chainId 42220)

---

## Setup

```bash
git clone https://github.com/2TheMoom/celosense
cd celosense
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
```

---

## Deploy contract

```bash
# Testnet first
npm run deploy:testnet

# Mainnet
npm run deploy:mainnet

# Verify on Celoscan
npx hardhat verify --network celo <DEPLOYED_ADDRESS>
```

After deploy, copy the contract address into `.env.local`:
```
NEXT_PUBLIC_REGISTRY_ADDRESS=0xYourDeployedAddress
```

---

## Run locally

```bash
npm run dev
# App at http://localhost:3000

# Test inside MiniPay via ngrok:
ngrok http 3000
# Paste the ngrok URL into MiniPay Developer Settings → Load Test Page
```

---

## Deploy to Vercel

```bash
# Connect repo to Vercel, set env vars in dashboard
# or:
vercel --prod
```

---

## ⚠️ Fee routing

```
# In .env.local — set this to YOUR wallet address
# Query fees ($0.01 USDC per query) route on-chain to this address
# Default in .env.example is a placeholder — change it
FEE_RECIPIENT=0xYourWalletAddress
```

---

## MiniPay compatibility

The required MiniPay hook lives in `src/hooks/useMiniPay.ts`:

```ts
useEffect(() => {
  if (window.ethereum && window.ethereum.isMiniPay) {
    setHideConnectBtn(true);
    connect({ connector: injected({ target: "metaMask" }) });
  }
}, []);
```

This auto-connects the wallet inside MiniPay and hides the connect button.

---

## Contract ABI summary

```
register()       — opt wallet into monitoring (emits WalletRegistered)
deregister()     — opt out (emits WalletDeregistered)
getStatus(addr)  — returns (isRegistered, timestamp)
totalRegistered  — public counter
```

---

## Proof of Ship checklist

- [x] MiniPay hook (`window.ethereum.isMiniPay` detection + auto-connect)
- [x] Smart contract deployed on Celo mainnet
- [x] Project submitted on Talent App
- [x] AI agent track: x402-gated intelligence API, autonomous wallet analysis

---

## License

MIT
