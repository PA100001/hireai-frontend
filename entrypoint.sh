#!/bin/sh

# Ensure the app is built
if [ ! -d "/usr/share/nginx/html/index.html" ]; then
    echo "Building Vite app..."
    npm run build
fi

# Start Nginx
echo "Starting Nginx..."
nginx -g 'daemon off;'
