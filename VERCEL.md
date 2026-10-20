# Vercel deployment

1. Open https://vercel.com/new and sign in.
2. Import `carynyx80/revex`, branch `main`, root directory `./`.
3. Keep the repository settings: Vite; install `pnpm install --frozen-lockfile`; build `pnpm build:web`; output `dist-web`; Node 24.x.
4. Deploy. Vercel supplies a web address; a purchased domain is unnecessary. No paid resources are configured by this repository.

The repository's Vercel configuration serves the frontend and serverless read-only blockchain API. No environment variables are required. Optional `ROBINHOOD_MAINNET_RPC_URL` and `ROBINHOOD_TESTNET_RPC_URL` must be HTTPS endpoints for their respective Robinhood networks; chain identity is checked.

## What works in this deployment

- Real pinned-block bytecode analysis, function selector extraction, disassembly and proxy checks.
- Verified explorer ABI retrieval when available; imported ABI calls.
- Explicit token/native balance reads and eth_call/gas estimates.
- Wallet connection and analysis exports.

## What still needs the native service

Vercel deployment does not start Heimdall, Anvil, a persistent SQLite database, a background indexer, or the local AI model. Their status is unavailable and native operations return clear errors. Serverless mode does not persist analysis history. Export results before reloading. RPC and explorer availability remain external dependencies. Per-instance throttling is best effort, not a global quota.

Run `pnpm setup:engines` and `pnpm start:local` on your Mac for the full native workstation. Your localhost service is not reachable from Vercel. There is no automatic tunnel or secret exposure. A separately hosted engine integration is not configured here.

After deployment, use “Try Seaport” in Analyze and verify an actual bytecode response. Settings must honestly show native engines unavailable. Successful frontend deployment does not establish a successful recovery or independent audit.
