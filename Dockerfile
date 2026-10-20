FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN npm install -g pnpm@11.25.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build:web
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production WEB_HOST=0.0.0.0 PORT=8080
COPY --from=build /app/dist-web ./dist-web
COPY --from=build /app/api ./api
COPY --from=build /app/engine/solana ./engine/solana
COPY --from=build /app/engine/http-security.mjs ./engine/http-security.mjs
COPY --from=build /app/package.json ./package.json
EXPOSE 8080
USER node
CMD ["node","engine/solana/server.mjs"]
