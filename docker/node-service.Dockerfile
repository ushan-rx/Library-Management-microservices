FROM node:20-alpine AS builder

ARG APP_NAME
ARG PRISMA_SCHEMA

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN if [ -n "$PRISMA_SCHEMA" ]; then npx prisma generate --schema "$PRISMA_SCHEMA"; fi
RUN npm run build:$APP_NAME

FROM node:20-alpine AS runner

ARG APP_NAME

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps ./apps

CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main"]
