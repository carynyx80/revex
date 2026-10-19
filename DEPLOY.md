# Give people a working REVEX website

REVEX can now run as one service: the website, saved investigations, decompiler, wallet indexer, isolated fork simulator and local AI all run together.

## Simplest deployment

[Deploy REVEX to Render](https://render.com/deploy?repo=https://github.com/carynyx80/revex)

1. Open the link and sign in or create a Render account.
2. Review the hosting cost shown by Render. The supplied configuration selects a paid 2-CPU / 4-GB server and a 5-GB persistent disk; a 512-MB free instance cannot run this stack. Nothing has been purchased by Codex.
3. Deploy the Blueprint. Render builds the repository and gives you an HTTPS web address.
4. Open that address and choose **Analyze → Try Seaport**. This reads an actual deployed contract without requiring a wallet.

The service includes its own private data store and model. You do not need an OpenAI key to start. Signed browser sessions keep visitors' investigation histories and jobs separate. Browser sessions are anonymous and last up to 14 days; this is not a cross-device account system.

The included GitHub Actions workflow builds the web application, runs security and fork tests, and attempts a complete Docker startup on Linux. Check its result before relying on a new release. A workflow file alone is not proof that a particular cloud deployment succeeded.

## Other Docker hosting

```sh
docker compose -f compose.production.yaml up --build -d
```

The example binds the website to server loopback port 8080. Put it behind an HTTPS reverse proxy and set `PUBLIC_ORIGIN` to its public HTTPS origin. Native engines remain on container loopback and are not published. Only the web service is exposed.

Saved records and session-signing material persist under `/app/.revex`. Back up that volume. Loss of the session key invalidates old anonymous visitor sessions. An attached single-writer SQLite disk supports one application instance; horizontal scaling requires a shared database and durable job queue.

## Before increasing traffic

The default public RPC can rate-limit real users. Configure `ROBINHOOD_MAINNET_RPC_URL` and `ROBINHOOD_TESTNET_RPC_URL` with production HTTPS provider endpoints if needed. Each source endpoint is checked against the expected Robinhood Chain ID. Do not commit credentials.

Requests have per-session and per-IP limits, each visitor can queue at most two jobs, and the native queue is bounded. The initial service is suitable for a small pilot, not an assertion of unlimited throughput. Benchmark your intended traffic before opening access widely.

Recovery adapters have automated security-boundary and isolated-fork tests. They have not received an independent security audit, and no real-funds recovery has been certified. Signing stays in each user's wallet.
