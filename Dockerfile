# Multi-stage build for production optimization
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --no-audit --no-fund --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular application
RUN npm run build:prod

# Production stage
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application from builder stage
COPY --from=builder /app/dist/got /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy custom nginx configuration for Angular routing
COPY nginx-angular.conf /etc/nginx/conf.d/default.conf

# Expose port 4200 to match Angular CLI default
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4200/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]