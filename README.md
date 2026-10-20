# REVEX — Solana

Reverse Engineer. Reconstruct. Recover.

REVEX now targets Solana mainnet-beta and devnet. The active interface and API no longer use Robinhood Chain, EVM addresses, Ethereum ABI calls, ERC-4626 recovery, Heimdall or Anvil.

## Run locally

Node 24 and pnpm 11.25.0 are required.

```sh
pnpm install --frozen-lockfile
pnpm start:local
```

Open http://127.0.0.1:8080. For frontend hot reload, keep the API server running on 8080 and run `pnpm dev` separately. No native engine/model download is needed.

## Deploy to Vercel

Import this repository. `vercel.json` configures the Vite build (`pnpm build:web`, output `dist-web`) and Node serverless API. No paid resources are provisioned by this code. No domain purchase is necessary. A public deployment has not been verified.

Optional server environment variables:

- `SOLANA_MAINNET_RPC_URL`
- `SOLANA_DEVNET_RPC_URL`

HTTPS endpoints are required; each request checks the cluster genesis hash. Public Solana RPC endpoints may block hosting-provider IPs or impose rate limits. An available RPC provider is required for live results. Do not put provider credentials in frontend variables.

## Implemented Solana workflows

- **Analyze:** validate 32-byte base58 public keys, inspect account ownership/executable status, parsed data, program loader metadata when provided, observed slot and 15 recent signatures. Raw base64 account data is SHA-256 hashed. Parsed JSON is not represented as original source code.
- **Protocol Explorer / Activity:** session evidence library; export actual results. No server-side history or cross-device records.
- **Reconstruction Studio:** inspect user-imported Anchor IDL instructions, account requirements, discriminators and argument definitions. Imported IDLs are unverified; the app does not generate arbitrary signing controls from them.
- **Recovery Center:** discover currently owned SPL Token and Token-2022 accounts, exact raw token units and native lamports. Partial provider failures are shown. No claim of complete DeFi position discovery or recoverability.
- **Simulation Lab:** real Solana `simulateTransaction`, with logs and compute units. Base64 wire transaction size is bounded at 1232 bytes. Signatures are not verified, recent blockhash is replaced, and no transaction is broadcast.
- **Wallets:** injected Phantom and Solflare connection, account/disconnection events. No seed phrases or signing requests.
- **Launch:** project information and a link to the official Pump.fun creation flow. No token creation transaction, mint address, sale or liquidity is fabricated.

## Explicit remaining limits

Solana source decompilation, autonomous AI, protocol-specific recovery execution and all-protocol indexed position discovery are not implemented. The evidence workspace states that it is not AI. Solana RPC simulation is not a disposable validator fork. Account observations can come from different confirmed slots, so they are not an atomic snapshot.

Old EVM engine modules and their tests remain in the repository as historical source, isolated from the active UI, Vercel entrypoint, default scripts and production Docker image. They are not Solana implementations. `pnpm test:legacy` runs their historical unit suite; `pnpm test:fork` remains a legacy EVM test and is not part of Solana CI.

## Pump.fun

REVEX the application and any future REVEX token are separate. The Launch page links to https://pump.fun/create. Review token metadata, economics, wallet and platform terms there. No launch or transaction has been performed, and no audit or successful fund recovery is claimed.

## Verify

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm build:web
```

The Solana tests use explicit mocked RPC fixtures for deterministic behavior; they are not evidence of live balances. CI also builds and smoke-tests the production Docker container. API request bounds, origin checks and per-instance best-effort throttling are retained.
