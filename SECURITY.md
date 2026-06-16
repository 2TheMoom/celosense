# Security Policy

## Overview

CeloSense is an autonomous on-chain intelligence agent operating on Celo mainnet. It handles real funds through smart contract interactions (USDC payments for queries and agent decision logging), so security issues are taken seriously even though this is a hackathon-stage project.

## Scope

The following are in scope for security reports:

- `contracts/CeloSenseRegistry.sol` — the deployed registry contract
- `src/app/api/` — API routes, particularly the autonomous agent (`src/app/api/agent/`)
- Wallet connection and transaction-signing flows in `src/components/`
- Environment variable handling and any place private keys or secrets are referenced

## Out of Scope

- Third-party dependencies (report these upstream to the relevant package maintainers)
- Issues requiring physical access to a user's device or browser
- Social engineering attacks against the project maintainer

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not open a public GitHub issue**.

Instead, report it privately by:

1. Sending a direct message to [Abu Olumi](https://x.com/olumi441) on X, or
2. Opening a [GitHub Security Advisory](https://github.com/2TheMoon/celosense/security/advisories/new) (private to maintainers until resolved)

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce, or a proof of concept if applicable
- Any relevant transaction hashes, contract addresses, or logs

## Response Process

- Reports will be acknowledged as soon as possible
- The vulnerability will be assessed and a fix timeline communicated
- Once resolved, credit will be given to the reporter (unless anonymity is requested)

## Known Considerations

- The contract owner address has limited admin functions: `setQueryPrice`, `setDecisionPrice`, `setFeeRecipient`, and `setAgentWallet`. These are intentionally restricted via `onlyOwner`.
- The `logDecision` function is restricted to the configured `agentWallet` via `onlyAgent` — if the agent's private key is ever compromised, call `setAgentWallet` immediately to rotate it.
- The agent wallet's private key is stored as an environment variable (`AGENT_PRIVATE_KEY`) on Vercel and is never exposed client-side. It should be treated as sensitive at all times.
- Contract addresses, the registry ABI, and all transaction history are public on Celoscan by design — this is an intentional transparency feature of the project, not a vulnerability.

## Supported Versions

Only the current deployed contract on Celo mainnet is supported. Previous contract versions have been deprecated and should not be interacted with:

| Version | Address | Status |
|---------|---------|--------|
| v3 (current) | `0x8a30F753942458897619A83D6467B0FF62DE7Abd` | Active |
| v2 | `0xda0f76E12d9571f3fc62D3C65CFF1662E4235046` | Deprecated |
| v1 | `0x66Aa97F3Aa2226543f1A570824f6a96404a8BC4D` | Deprecated |