# Build stage using Node
FROM node:23-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage using official Nginx
FROM nginx:latest

# Set working directory for Nginx
WORKDIR /usr/share/nginx/html

# Remove default index.html (if exists)
RUN rm -f /usr/share/nginx/html/index.html

# Copy built frontend from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 8080
EXPOSE 8080

# Use custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]
