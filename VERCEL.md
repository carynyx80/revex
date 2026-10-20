# REVEX Solana on Vercel

1. Import `carynyx80/revex`, branch `main`, root `./`.
2. Use Vite, Node 24.x, install `pnpm install --frozen-lockfile`, build `pnpm build:web`, output `dist-web` (committed in vercel.json).
3. Deploy using an eligible plan within your account's limits. No paid services are configured by the repository.
4. Open Analyze, select mainnet or devnet, and inspect the SPL Token program example.

The Vercel APIs perform Solana account inspection, SPL token account discovery and unsigned transaction simulation. They never call Ethereum RPC methods or broadcast transactions. Configure `SOLANA_MAINNET_RPC_URL` / `SOLANA_DEVNET_RPC_URL` in Vercel if public endpoints restrict traffic. Endpoints must use HTTPS and return the selected cluster genesis hash. Secrets remain on the server.

History is session-only. Export investigations before reloading. Autonomous AI, original Rust source reconstruction and recovery execution are not implemented. The Pump.fun Launch page opens the official token creation flow; no token has been created.

A successful build does not verify RPC availability from Vercel. Verify actual responses after deployment and configure a provider if you see HTTP 403/429.
