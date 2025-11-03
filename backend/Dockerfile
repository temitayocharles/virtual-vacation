# =============================================================================
# VIRTUAL VACATION BACKEND - FAST APPLICATION BUILD
# =============================================================================
# Uses pre-built base image with dependencies for faster builds

# Use our pre-built base image with all dependencies
ARG BASE_IMAGE_TAG=latest
FROM temitayocharles/virtual-vacation-backend-base:${BASE_IMAGE_TAG} AS builder

# Copy source code (only this layer changes on code updates)
COPY --chown=nodeuser:nodejs . .

# Build the application (dependencies already installed in base image)
RUN npm run build

# Production stage - Final image
FROM node:18-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodeuser -u 1001

# Copy built application and production dependencies from builder
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodejs /app/package*.json ./

# Copy healthcheck script
COPY --chown=nodeuser:nodejs healthcheck.js ./

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
