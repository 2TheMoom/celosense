# CeloSense Architecture

## Overview

CeloSense is an autonomous on-chain intelligence agent for the Celo ecosystem. It follows a three-layer architecture: a MiniPay-native frontend, an on-chain payment and registry contract, and a viem-powered backend agent that reads directly from Celo mainnet.

---

## System Flow

```
MiniPay / Browser Wallet
        │
        ▼
CeloSense App (Next.js 14 · wagmi v2 · viem v2)
        │
        ▼
Step 1: Approve $0.01 USDC spend on CeloSenseRegistry
        │
        ▼
Step 2: recordQuery(target) → CeloSenseRegistry.sol
        │ emits QueryRecorded event
        │ transfers $0.01 USDC to fee recipient
        │
        ▼
Step 3: API route verifies tx receipt on Celo mainnet
        │
        ▼
Intelligence Agent (viem publicClient)
        │
        ├── getBalance(address) → CELO balance
        ├── readContract(USDC.balanceOf) → USDC balance
        ├── readContract(USDT.balanceOf) → USDT balance
        ├── getLogs(USDC Transfer events, last 500 blocks)
        └── compute activityScore + whaleFlag
        │
        ▼
Response: balances · transfers · whaleActivity · activityScore
```

---

## Components

### Frontend — `src/app/`

| File | Purpose |
|------|---------|
| `app/landing/page.tsx` | Public landing page — hero, features, stats, CTA |
| `app/app/page.tsx` | Main app — wallet connection, tabs, status bar |
| `app/providers.tsx` | wagmi + thirdweb + react-query providers |
| `app/layout.tsx` | Root layout with metadata |
| `app/globals.css` | Brand design system — parchment, navy, crimson, green |

### Components — `src/components/`

| File | Purpose |
|------|---------|
| `IntelligencePanel.tsx` | Query bar, USDC payment flow, results display |
| `RegistryPanel.tsx` | On-chain register/deregister with tx confirmation |
| `WalletConnect.tsx` | Connect button — hidden inside MiniPay |
| `Logo.tsx` | Mix 2 diamond eye SVG with circuit nodes |

### Hooks — `src/hooks/`

| File | Purpose |
|------|---------|
| `useMiniPay.ts` | Detects `window.ethereum.isMiniPay`, auto-connects |

### Library — `src/lib/`

| File | Purpose |
|------|---------|
| `celo.ts` | viem clients, token addresses, registry ABI |
| `usdc.ts` | USDC contract address, ABI, query price constant |

### API Routes — `src/app/api/`

| Route | Purpose |
|-------|---------|
| `GET /api/intelligence` | Verify payment, fetch wallet intelligence |
| `GET /api/register` | Read registration status from contract |

### Contract — `contracts/`

| File | Purpose |
|------|---------|
| `CeloSenseRegistry.sol` | Registration, query payment, event emission |

---

## Contract Architecture

```
CeloSenseRegistry
├── State
│   ├── mapping(address => bool) registered
│   ├── mapping(address => uint256) registeredAt
│   ├── mapping(address => uint256) queryCount
│   ├── uint256 totalRegistered
│   └── uint256 totalQueries
├── Functions
│   ├── register() — opt in to monitoring
│   ├── deregister() — opt out
│   ├── recordQuery(target) — pay $0.01 USDC + emit event
│   ├── getStatus(wallet) — check registration
│   ├── setQueryPrice(price) — admin
│   └── setFeeRecipient(addr) — admin
└── Events
    ├── WalletRegistered(wallet, timestamp)
    ├── WalletDeregistered(wallet, timestamp)
    └── QueryRecorded(querier, target, timestamp)
```

---

## Payment Flow

Every intelligence query follows a two-step on-chain payment:

1. **Approve** — user approves $0.01 USDC spend on the registry contract address
2. **Record** — `recordQuery(target)` collects USDC via `transferFrom`, emits `QueryRecorded`, increments counters

The API route receives the transaction hash as `X-PAYMENT` header, reads the receipt on-chain, verifies a `QueryRecorded` event was emitted, and only then returns intelligence data.

---

## MiniPay Integration

CeloSense detects MiniPay via the `window.ethereum.isMiniPay` flag:

```ts
if (window.ethereum?.isMiniPay) {
  // Auto-connect — no button needed
  connect({ connector: injected({ target: "metaMask" }) });
}
```

Inside MiniPay the connect button is hidden. Outside MiniPay (desktop browser) the standard connect button is shown.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Wallet | wagmi v2, viem v2 |
| Payments | thirdweb v5, x402 protocol |
| Contract | Solidity 0.8.20, Hardhat |
| Chain | Celo Mainnet (Chain ID 42220) |
| RPC | forno.celo.org (public) |
| Deployment | Vercel |

---

## Deployed Addresses

| Contract | Address | Network |
|----------|---------|---------|
| CeloSenseRegistry | `0xda0f76E12d9571f3fc62D3C65CFF1662E4235046` | Celo Mainnet |
| USDC | `0xcebA9300f2b948710d2653dD7B07f33A8B32118C` | Celo Mainnet |
| USDT | `0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e` | Celo Mainnet |
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | Celo Mainnet |

---

*Built by [Abu Olumi](https://x.com/olumi441)