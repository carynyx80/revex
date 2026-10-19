# REVEX

A working Robinhood Chain forensic workstation with a React/Vinext frontend, Cloudflare Worker APIs, D1 investigation storage, and native analysis engines backed by SQLite.

## Start locally

Requires Node 24+, pnpm 11.25.0, macOS or Linux on arm64/x64, internet access to Robinhood Chain, and enough disk/memory for the 639 MB Qwen model.

```sh
pnpm install
pnpm setup:engines
pnpm start:local
```

Open http://127.0.0.1:5173/. The launcher starts the local model, native engine service, and workstation, reusing services that are already healthy. `setup:engines` downloads pinned official releases and verifies SHA-256/SHA-512 integrity. Heimdall writes its own configuration/cache to `~/.bifrost`. No home directory environment variable is overridden.

Native jobs and wallet indexing checkpoints persist in `.revex/engine.sqlite`. Model authorization uses a generated file with mode 0600 at `.revex/local-ai-key`. These files and all runtime binaries/model weights are ignored and excluded from source packages.

D1 investigations use `.openai/hosting.json` binding `DB`. Generate schema migrations with `pnpm db:generate`; local previews need the schema applied with Wrangler against the starter's local D1 database. The native engines operate independently of D1.

## Implemented engines

- **Decompilation:** Heimdall 0.9.3 symbolic execution against bytecode pinned to an upstream block. Returns Solidity pseudocode, inferred ABI, bytecode hash, provenance, and engine logs. One click opens the inferred ABI in Reconstruction Studio. Placeholder names preserve original selectors during calldata encoding.
- **Position discovery:** Scans actual incoming/outgoing ERC-20 Transfer logs, deduplicates token candidates, persists resumable checkpoints, reads current token/native balances at a pinned block, and probes compatible ERC-4626 vaults. Coverage and truncation are explicit. Jobs scan at most 10,000 blocks; the UI defaults to 2,000 and resumes on demand. Full historical coverage requires continuing to genesis; empty partial results never prove absence of assets.
- **Fork simulation:** A disposable Anvil instance forks the selected Robinhood network at an explicit block. Transactions execute only on its loopback RPC. Results include receipts, recursive call traces, sender native balance changes, gas costs and tracked-token deltas. Forks are terminated after each job. Sender gas balance is not artificially topped up in user simulations.
- **Autonomous research:** Local Qwen3-0.6B performs real model inference after a bounded plan automatically collects contract and/or wallet evidence. An optional OpenAI provider supports up to five model-directed rounds using strict, scope-checked read-only function tools. Neither provider can sign or submit transactions.
- **Recovery:** ERC-4626 `withdraw` and `redeem` plans check current limits and share balances. Receiver and owner are fixed to the connected wallet. The engine requires a successful fresh fork simulation with positive underlying-asset recovery and observed share burn; it rechecks code, proxy implementation, calldata and live limits before returning a transaction for wallet review. No token approval or server-side signing is used.

## AI configuration

Local AI runs without a cloud credential. It uses CPU execution with thinking disabled. Small-model findings must be checked against attached tool evidence. Optionally configure `AI_API_KEY` and `AI_MODEL` in ignored `.dev.vars` to use OpenAI. Runtime secrets never enter browser code. `.dev.vars` is loaded by the native service; restart it after changes.

## Verification

```sh
pnpm test
pnpm test:fork
pnpm exec tsc --noEmit
pnpm build
```

`test:fork` actually starts an isolated Robinhood mainnet fork, funds only an explicit test account on that fork, deploys controlled local fixtures, validates withdrawal limits, and verifies asset/share deltas and execution traces. It never deploys fixtures or broadcasts transactions to the real chain. The fixture Solidity and compiled artifacts are committed under `tests/fixtures/`.

## Deployment

The UI/Worker is configured for private Sites deployment. Native processes cannot execute inside a Cloudflare Worker. `Dockerfile.engine` and `compose.yaml` package the separate native service and local model; configure `REVEX_ENGINE_URL` and matching `ENGINE_TOKEN` as Worker runtime settings when hosting remotely. Non-loopback engine listeners require a token. Use a private HTTPS ingress; the example Compose port is bound to host loopback. Docker configuration is supplied but has not been executed on this machine.

Use `ENGINE_TOKEN` in the container environment, never a committed secret. Data persists in the `revex-engine-data` volume. The engine service rejects direct browser-Origin requests and exposes only bounded jobs, status and guarded recovery validation; it does not expose an arbitrary RPC forwarding endpoint.

## Evidence and audit boundaries

**No independent security audit has been performed.** Recovery guards have automated unit, security-boundary and real-fork fixture tests. These are not an external audit certificate. The UI states this explicitly.

Decompilation is best-effort and cannot guarantee original source recovery or complete path coverage. Inferred ABI types and mutability remain unverified. Transfer indexing does not discover all nonstandard, rebasing or eventless positions. Anvil implements standard EVM behavior; Robinhood-specific ArbOS precompiles/sequencing can differ. Only explicitly tracked assets and sender balances are compared; state may change before submission. A compatible vault read surface does not prove legitimacy, solvency or safe recovery.

Source and runtime configuration support Robinhood Chain mainnet (4663) and testnet (46630) only, using the official public endpoints. Public RPC can rate-limit or restrict archive/log queries. See https://docs.robinhood.com/chain/connecting/.

The current Site is owner-private. Do not expand its audience without adding per-user authentication, record isolation, deployment-specific rate limits and operational monitoring. No live recovery or successful wallet transaction is claimed by the included tests.
