FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
RUN corepack enable
RUN mkdir -p /app/data
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile=false
COPY --from=build /app/build ./build
CMD ["pnpm", "start"]
