FROM node:24-slim AS deps
WORKDIR /app
RUN corepack enable
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

FROM node:24-slim AS build
WORKDIR /app
RUN corepack enable
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm build

FROM node:24-slim
WORKDIR /app
RUN corepack enable
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml* ./
# Reuse the compiled dependencies from deps stage to ensure bindings exist
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm prune --prod
COPY --from=build /app/build ./build
CMD ["pnpm", "start"]
