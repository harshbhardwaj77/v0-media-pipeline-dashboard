# ── builder ───────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Use pnpm for better performance and reliability
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies (generate lockfile if missing)
RUN pnpm install --frozen-lockfile=false

# Copy source code
COPY . .

# Build the application
ARG VITE_API_BASE=http://localhost:8081
ENV VITE_API_BASE=${VITE_API_BASE}
RUN pnpm build

# Verify build output
ARG DIST_DIR=dist
RUN echo "Checking build output at /app/${DIST_DIR}" && \
    ls -la /app && \
    ls -la /app/${DIST_DIR} || (echo "❌ No build output at /app/${DIST_DIR}"; exit 1)

# ── runtime ───────────────────────────────────────────
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
ARG DIST_DIR=dist
COPY --from=builder /app/${DIST_DIR} /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
