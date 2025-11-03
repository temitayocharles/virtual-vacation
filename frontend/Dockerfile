# =============================================================================
# VIRTUAL VACATION FRONTEND - FAST APPLICATION BUILD
# =============================================================================
# Uses pre-built base image with dependencies for faster builds

# Use our pre-built base image with all dependencies
# This will be pulled from registry or use cached version
ARG BASE_IMAGE_TAG=latest
FROM temitayocharles/virtual-vacation-frontend-base:${BASE_IMAGE_TAG} AS builder

# Copy source code (only this layer changes on code updates)
COPY --chown=nextjs:nodejs . .

# Build the application (dependencies already installed in base image)
RUN npm run build

# Stage 2: Production runtime with Nginx
FROM nginx:1.25-alpine AS runtime

# Simple nginx configuration
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        return 200 "healthy"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -nv -t1 --spider http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
