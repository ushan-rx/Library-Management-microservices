FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 300000 \
 && npm config set registry https://registry.npmjs.org/ \
 && npm ci --no-audit --prefer-offline

COPY . .

RUN npx prisma generate --schema apps/member-service/prisma/schema.prisma
RUN npm run build:member-service

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 300000 \
 && npm config set registry https://registry.npmjs.org/ \
 && npm ci --omit=dev --no-audit --prefer-offline

COPY --from=builder /app/apps ./apps
COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "npx prisma db push --schema apps/member-service/prisma/schema.prisma --skip-generate && node dist/apps/member-service/main"]
