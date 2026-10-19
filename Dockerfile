FROM node:24-bookworm AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm@11.25.0 && pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm run build:web

FROM ubuntu:24.04
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates tar libgomp1 libopenblas0 libssl3t64 libcurl4t64 && rm -rf /var/lib/apt/lists/*
COPY --from=build /usr/local /usr/local
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/engine ./engine
COPY --from=build /app/lib ./lib
COPY --from=build /app/scripts/setup-engines.mjs /app/scripts/start-production.mjs ./scripts/
COPY --from=build /app/dist-web ./dist-web
COPY package.json ./
RUN node scripts/setup-engines.mjs
ENV WEB_HOST=0.0.0.0 WEB_PORT=8080 ENGINE_HOST=127.0.0.1
EXPOSE 8080
VOLUME ["/app/.revex"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","scripts/start-production.mjs"]
