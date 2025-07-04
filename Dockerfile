# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy everything except .github, .serverless, Makefile, and .env
COPY . .
RUN rm -rf .github .serverless Makefile .env

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Only copy the built files and necessary assets from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/apps/chunker/index.js"]
