# Changelog

All notable changes to CeloSense are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] — 2026-06-20

### Added
- **Autonomous Agent** — runs every 5 minutes via cron-job.org, scans last 500 blocks of USDC transfers, classifies activity, and logs every decision on-chain via `logDecision()`
- **Agent Tab** — live decision feed showing all logged decisions with type, score, timestamp, and direct Celoscan tx links
- **Whale Leaderboard Tab** — ranks wallets most frequently flagged for whale activity, built entirely from on-chain `DecisionLogged` events, with medal ranking and transfer tx links
- **Live Registration Feed** — Registry tab now shows recent `WalletRegistered` events with wallet addresses, timestamps, active/inactive status, and Celoscan links
- **Personal Stats Card** — Registry tab shows days registered and total on-chain queries for connected wallet
- **Intelligence Summary Card** — premium redesigned card with natural language summary, status badge (Whale Detected / Normal Activity), 4 metric tiles (Activity Score, Transfers, Total Volume, CELO Balance), and signal pills
- **CELO/USD Price Fetch** — live CoinGecko price shown under CELO balance on every intelligence query
- **Natural Language Summary** — intelligence API generates plain English explanation of wallet behavior, score, and transfer activity
- **From→To Transfer Display** — Recent Transfers section now shows sender and recipient addresses with direct Celoscan tx links
- **ERC-8004 Registration** — CeloSense registered on ERC-8004 Identity Registry on Celo mainnet as Agent #9228
- **OG Image** — dynamic social preview image via Next.js edge runtime for link previews on X, Telegram, Discord
- **SEO Metadata** — full OpenGraph and Twitter card metadata on landing and app pages
- `logDecision(string decisionType, address target, uint256 score)` on CeloSenseRegistry — agent-only function, $0.0001 USDC per call
- `agentWallet` field and `onlyAgent` modifier on contract
- `decisionPrice` and `totalDecisions` on contract
- `setAgentWallet()` and `setDecisionPrice()` admin functions
- `DecisionLogged` event with indexed agent and target fields
- `/api/agent/run` — cron endpoint, verifies `CRON_SECRET`, runs whale detection and calls `logDecision()`
- `/api/agent/decisions` — reads `DecisionLogged` events with chunked `eth_getLogs` queries, in-memory cache for whale transfer lookups
- `/api/agent/leaderboard` — aggregates whale flag counts by target address from on-chain events
- `/api/registry/feed` — reads `WalletRegistered` and `WalletDeregistered` events with active/inactive status
- `vercel.json` — daily Vercel cron backup for agent run endpoint
- `contracts/mocks/MockUSDC.sol` — minimal ERC20 mock for Hardhat test suite
- 24 Hardhat tests across `register`, `deregister`, `recordQuery`, `logDecision` — all passing
- `CONTRIBUTING.md` — contribution guide with project structure, workflow, and PR guidelines
- `SECURITY.md` — vulnerability reporting process, scope, known considerations, and deprecated contract versions
- `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`
- `docs/architecture.md`, `docs/contract.md`, `docs/minipay.md`

### Changed
- **Redeployed CeloSenseRegistry to `0x8a30F753942458897619A83D6467B0FF62DE7Abd`** (v3) — added `logDecision`, `agentWallet`, `decisionPrice`, `onlyAgent` modifier
- Intelligence block range extended from 500 to 1,000 blocks for deeper transfer history
- Intelligence API returns `celoPrice`, `celoUsdValue`, `summary`, and `from` field on each transfer
- Landing page fully rewritten — mentions autonomous agent, whale leaderboard, ERC-8004, live stats (total registered + total decisions)
- README overhauled to reflect current product state including all 4 tabs, agent architecture, contract v3, 24 tests, ERC-8004
- RPC transport updated to forno.celo.org with Ankr fallback and retry config
- All `eth_getLogs` queries now use chunked pagination (800 blocks per chunk) to avoid provider range limits

### Fixed
- Whale target extraction now decodes address from raw log `topics[1]` if `args.from` is undefined (defensive fallback)
- Whale transfer link now points to the **largest** transfer in the window, not the most recent (avoids linking small DEX swaps)
- Decision log and leaderboard no longer error on RPC fallback providers with strict block range limits
- Query bar input flex shrink on mobile fixed with `min-width: 0` on `.query-bar input`
- Card-grid responsive overrides removed — no longer squeezes on desktop after mobile CSS additions
- Agent decisions and leaderboard routes now use `export const dynamic = "force-dynamic"` to prevent Next.js caching empty responses

### Deprecated
- CeloSenseRegistry v2 (`0xda0f76E12d9571f3fc62D3C65CFF1662E4235046`) — no `logDecision` support
- CeloSenseRegistry v1 (`0x66Aa97F3Aa2226543f1A570824f6a96404a8BC4D`) — initial deployment

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