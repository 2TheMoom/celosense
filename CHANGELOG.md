# Changelog

All notable changes to CeloSense are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.3.0] — 2026-06-08

### Added
- `recordQuery()` function on CeloSenseRegistry contract — every intelligence query is now recorded on-chain
- `QueryRecorded` event emitted on every query with querier address, target address, and timestamp
- `totalQueries` public counter on contract — tracks all-time query volume
- `queryCount` mapping — tracks per-wallet query history
- USDC `approve` + `recordQuery` two-step payment flow in IntelligencePanel
- Step-by-step button states — "Approving USDC → Recording query → Confirming → Fetching data"
- `setQueryPrice()` and `setFeeRecipient()` admin functions on contract
- `NEXT_PUBLIC_FEE_RECIPIENT` environment variable

### Changed
- Redeployed CeloSenseRegistry to `0xda0f76E12d9571f3fc62D3C65CFF1662E4235046`
- Query payments now route through the contract instead of direct USDC transfer
- API verification checks `recordQuery` transaction receipt on-chain

### Fixed
- All contract links updated to new registry address across landing page, README, and Talent App

---

## [1.2.0] — 2026-06-07

### Added
- Real x402 on-chain payment gate — queries now charge $0.01 USDC from connected wallet
- API route verifies USDC transfer receipt on Celo mainnet before returning data
- `src/lib/usdc.ts` — USDC contract address, ABI, and query price constants
- USDC `approve` function added to USDC ABI
- Error handling for user rejection and insufficient USDC balance

### Changed
- Removed demo `return true` stub from `verifyX402Payment`
- IntelligencePanel now triggers real USDC transfer before API call
- Button label shows payment step in progress

---

## [1.1.0] — 2026-06-07

### Added
- Landing page at `/landing` — hero, how it works, features, CTA banner, footer
- Home button — clicking the logo in the app header navigates back to landing
- Architecture diagram for Paragraph post
- "Built by Abu Olumi" credit with X profile link
- `src/app/app/page.tsx` — app moved to `/app` route, root redirects to `/landing`

### Changed
- Root `/` now redirects to `/landing`
- Logo updated to Mix 2 diamond eye SVG component with circuit nodes
- Brand palette applied to all CSS — parchment, navy, crimson, green, JetBrains Mono
- `globals.css` fully rewritten with brand token system

### Fixed
- React hydration error on statusbar — wrapped wallet-dependent renders in `mounted` state
- MiniPay hook only auto-connects inside MiniPay, not on desktop

---

## [1.0.1] — 2026-06-06

### Changed
- Switched RPC from QuickNode (401 Unauthorized) to `forno.celo.org` public endpoint
- Added `getAddress()` checksum normalization to `analyzeWallet()` in API route
- Updated `next.config.js` to silence `@react-native-async-storage` warning

### Fixed
- Intelligence queries failing with `InvalidAddressError` on non-checksummed addresses
- MetaMask auto-connect error on desktop — `useMiniPay` hook now gates auto-connect to MiniPay only

---

## [1.0.0] — 2026-06-06

### Added
- Initial project scaffold — Next.js 14, wagmi v2, viem v2, thirdweb v5
- `CeloSenseRegistry.sol` deployed and verified on Celo mainnet
- `register()` and `deregister()` functions with `WalletRegistered` / `WalletDeregistered` events
- `useMiniPay` hook — detects `window.ethereum.isMiniPay`, auto-connects inside MiniPay
- Intelligence API route — fetches CELO/USDC/USDT balances, scans 500 blocks for transfers
- Whale detection — flags transfers over 10,000 USDC, activity score 0–100
- Registry panel — on-chain registration with Celoscan transaction link
- WalletConnect component — hidden inside MiniPay, visible on desktop
- Hardhat config for Celo mainnet and Alfajores testnet
- Deployed to Vercel at `celosense.vercel.app`
- Submitted to Celo Proof of Ship on Talent App

---

Built by [Abu Olumi](https://x.com/olumi441)