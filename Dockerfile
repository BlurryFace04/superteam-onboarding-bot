FROM node:20-alpine

WORKDIR /app

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/bot.db

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

CMD ["node", "src/index.js"]
