# NutriFlow backend (Node.js/Express) container image
FROM node:20-alpine AS base

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/ ./

# backend/index.js defaults to 8000 when PORT is unset
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-8000}/nutriflow || exit 1

USER node

CMD ["node", "index.js"]

