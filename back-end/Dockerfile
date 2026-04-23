FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json tsconfig*.json ./
COPY prisma ./prisma
RUN npm ci
RUN DATABASE_URL=postgresql://dummy:dummy@dummy:5432/dummy npx prisma generate
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/dist ./dist
EXPOSE 3333
CMD ["sh", "-c", "node_modules/.bin/prisma db push --accept-data-loss && node prisma/seed.mjs && node dist/server.js"]
