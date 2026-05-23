# syntax=docker/dockerfile:1.6

# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
# Prisma engines need openssl on Alpine, else the schema engine fails to load.
RUN apk add --no-cache openssl libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY package.json ./
RUN npx prisma generate
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Prisma migrate deploy + client need openssl at runtime too.
RUN apk add --no-cache openssl libc6-compat
# Install only runtime deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Run migrations on container start, then boot the server.
# `prisma migrate deploy` is the safe production command — never modifies schema.
CMD sh -c "npx prisma migrate deploy && node dist/server.js"

EXPOSE 3001
