# MiniPay Integration Guide

## Overview

CeloSense is built as a MiniPay Mini App — it detects the MiniPay wallet automatically, connects without user action, and hides the connect button inside the app. This document covers the full MiniPay integration implemented in CeloSense.

---

## Detection Hook

The core MiniPay integration lives in `src/hooks/useMiniPay.ts`:

```ts
"use client";

import { useState, useEffect } from "react";
import { injected } from "wagmi/connectors";
import { useConnect, useAccount } from "wagmi";

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const detect = () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const detected = Boolean((window as any).ethereum.isMiniPay);
        setIsMiniPay(detected);

        // Auto-connect inside MiniPay — wallet is implicit
        if (detected && !isConnected) {
          connect({ connector: injected({ target: "metaMask" }) });
        }
      }
      setIsDetecting(false);
    };

    // Small delay to allow injected provider to initialize
    const timer = setTimeout(detect, 100);
    return () => clearTimeout(timer);
  }, [connect, isConnected]);

  return { isMiniPay, isDetecting, address, isConnected };
}
```

**What it does:**
- Checks `window.ethereum.isMiniPay` to detect the MiniPay wallet
- Auto-connects the injected wallet when inside MiniPay
- Returns `isMiniPay` boolean so the UI can adapt

---

## Hiding the Connect Button

Inside MiniPay, the wallet is always connected — showing a connect button is confusing. CeloSense hides it:

```tsx
const { isMiniPay, isDetecting } = useMiniPay();

// Only show connect button outside MiniPay
{!isMiniPay && !isDetecting && <WalletConnect />}
```

---

## Avoiding Hydration Errors

Next.js renders pages on the server before the wallet is available. Rendering wallet-dependent UI without protection causes a hydration mismatch error:

```
Error: Text content did not match. Server: "Agent" Client: "Wallet"
```

**Fix — use a `mounted` state:**

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

// Gate all wallet-dependent renders
{mounted && isConnected && <Dashboard />}
{mounted && !isConnected && <ConnectPrompt />}
```

This ensures wallet-dependent UI only renders on the client after hydration.

---

## wagmi v2 Configuration

CeloSense uses wagmi v2 with Celo mainnet:

```ts
// src/app/providers.tsx
import { WagmiProvider, createConfig, http } from "wagmi";
import { celo } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [injected()],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
  },
});
```

**Key differences from wagmi v1:**

| v1 | v2 |
|----|-----|
| `useConnect({ connector: new InjectedConnector() })` | `useConnect()` + `injected()` from `wagmi/connectors` |
| `WagmiConfig` | `WagmiProvider` |
| `configureChains` | `createConfig` with `transports` |
| `chain` from `wagmi/chains` | `celo` from `viem/chains` |

---

## Fee Currency (USDC Gas)

Celo supports paying gas in USDC instead of CELO. CeloSense uses the fee adapter addresses for this:

```ts
export const FEE_ADAPTERS = {
  USDC: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
  USDT: "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72",
};
```

Pass the adapter address as `feeCurrency` in transactions to pay gas in USDC.

---

## Testing Inside MiniPay

To test your Mini App inside MiniPay:

1. Run your app locally: `npm run dev`
2. Expose it via ngrok: `ngrok http 3000`
3. Open MiniPay on your phone
4. Go to **Settings → Developer Mode → Load Test Page**
5. Paste your ngrok URL

MiniPay will load your app with `window.ethereum.isMiniPay = true` — the detection hook will fire and auto-connect.

---

## MiniPay Badge

CeloSense shows a MiniPay badge in the header when running inside MiniPay:

```tsx
{isMiniPay && (
  <span className="minipay-badge">
    <span className="badge-dot" />
    MiniPay
  </span>
)}
```

---

## Proof of Ship Eligibility

The single required hook for Celo Proof of Ship MiniPay eligibility is:

```ts
if (window.ethereum?.isMiniPay) {
  connect({ connector: injected({ target: "metaMask" }) });
}
```

This auto-connects the wallet inside MiniPay — that's the qualifying MiniPay integration.

---

*Built by [Abu Olumi](https://x.com/olumi441)