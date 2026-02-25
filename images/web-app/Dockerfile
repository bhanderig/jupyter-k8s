# Build the frontend and backend together using Bun
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package files
COPY web/package.json web/bun.lock* ./
RUN bun install

# Copy source code
COPY web/ .

# Build frontend and backend
RUN bun run build:full

# Final image - use Bun runtime for the TypeScript backend
FROM oven/bun:1-slim
WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json

# Install production dependencies only
RUN bun install --production --frozen-lockfile

# The bun:1-slim image already has a 'bun' user with uid/gid 1000
# We'll use that user instead of creating a new one

# Set ownership and switch to non-root user
RUN chown -R 1000:1000 /app
USER 1000:1000

# Expose port
EXPOSE 8090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version > /dev/null || exit 1

# Start the server
CMD ["bun", "run", "start"]
