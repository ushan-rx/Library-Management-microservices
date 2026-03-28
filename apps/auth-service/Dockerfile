FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate --schema apps/auth-service/prisma/schema.prisma
RUN npm run build:auth-service

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/apps ./apps
COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "npx prisma db push --schema apps/auth-service/prisma/schema.prisma --skip-generate && node dist/apps/auth-service/main"]
