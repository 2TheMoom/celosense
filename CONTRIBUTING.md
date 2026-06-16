# Contributing to CeloSense

Thanks for your interest in contributing to CeloSense — an autonomous on-chain intelligence agent for the Celo ecosystem.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/celosense.git
   cd celosense
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the environment template and fill in your own values:
   ```bash
   cp .env.example .env.local
   ```

## Project Structure

| Path | Purpose |
|------|---------|
| `contracts/` | Solidity contracts (CeloSenseRegistry) |
| `scripts/` | Hardhat deployment scripts |
| `test/` | Hardhat test suite |
| `src/app/` | Next.js 14 app router pages |
| `src/components/` | React components |
| `src/lib/` | viem clients, ABIs, token addresses |
| `src/app/api/` | API routes including the autonomous agent |
| `docs/` | Architecture, contract reference, MiniPay guide |

## Development Workflow

Run the app locally:
```bash
npm run dev
```

Run the contract test suite:
```bash
npx hardhat test
```

Compile contracts:
```bash
npx hardhat compile
```

## Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes, following the existing code style (TypeScript, functional React components, viem for chain interaction)
3. If you touch the contract, add or update tests in `test/` and confirm `npx hardhat test` passes
4. If you touch the agent logic (`src/app/api/agent/`), test against a local fork or testnet before submitting — never submit untested changes that interact with the agent wallet
5. Commit with a clear, conventional message:
   ```bash
   git commit -m "feat: add new whale detection threshold"
   ```
6. Push and open a pull request against `main`

## Pull Request Guidelines

- Keep PRs focused on a single change or feature
- Describe what the change does and why
- Reference any related issues
- Include screenshots for UI changes
- Do not include `.env` files, private keys, or any secrets in your PR

## Reporting Bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) when opening an issue. Include steps to reproduce, your environment (browser, wallet, network), and any relevant console errors or transaction hashes.

## Suggesting Features

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md). Explain the problem the feature solves, not just the feature itself.

## Code of Conduct

Be respectful and constructive. This is a small open-source project built in public — assume good faith from contributors and maintain a welcoming environment for newcomers to Celo and Web3 development.

## Security

If you discover a security vulnerability, please follow the process described in [SECURITY.md](SECURITY.md) rather than opening a public issue.

## Questions

Open a discussion or reach out to [Abu Olumi](https://x.com/olumi441) on X.