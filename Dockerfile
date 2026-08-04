# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ============================================
# Stage 2: Build Next.js application in standalone mode
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================
# Stage 3: Run Next.js application
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copia assets públicos
COPY --from=builder --chown=node:node /app/public ./public

# Permissão correta pro cache de prerender
RUN mkdir .next
RUN chown node:node .next

# Output standalone reduz drasticamente o tamanho da imagem
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Usuário "node" já vem pronto na imagem oficial — não precisa criar na mão
USER node

EXPOSE 3000
CMD ["node", "server.js"]