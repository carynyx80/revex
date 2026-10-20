# REVEX Solana deployment

Use the Vercel instructions in [VERCEL.md](VERCEL.md), or run `pnpm start:local` and open http://127.0.0.1:8080.

The production Dockerfile packages the Solana web server and RPC adapter only; no local model, Heimdall, Anvil or persistent disk is needed. Expose port 8080 behind HTTPS. `/healthz` confirms the web service, not upstream RPC health. Cluster identity is verified on each investigation request.

Optional SOLANA_MAINNET_RPC_URL and SOLANA_DEVNET_RPC_URL are server-side HTTPS provider URLs. Do not expose credential-bearing URLs in browser code. Public endpoints can throttle or block traffic.

No cloud hosting purchase, public deployment or Pump.fun token launch has been performed. Historical EVM Docker/Compose scripts are retained as legacy source; use the root Dockerfile for the active Solana application.
