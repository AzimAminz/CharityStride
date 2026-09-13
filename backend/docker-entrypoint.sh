#!/bin/sh
set -e

# Copy .env if not exists
if [ ! -f /var/www/html/.env ]; then
    if [ -f /var/www/html/.env.example ]; then
        echo "Creating .env from .env.example..."
        cp /var/www/html/.env.example /var/www/html/.env
    fi
fi

# Install dependencies if vendor is missing
if [ ! -d /var/www/html/vendor ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Generate app key if not set
if grep -q "APP_KEY=$" /var/www/html/.env || grep -q "APP_KEY=\"\"" /var/www/html/.env || ! grep -q "APP_KEY=" /var/www/html/.env; then
    echo "Generating Laravel application key..."
    php artisan key:generate --force
fi

# Ensure storage and bootstrap directories are writable
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Create storage symlink if not exists
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link || true
fi

echo "Starting CharityStride Backend on http://0.0.0.0:8000..."
exec php artisan serve --host=0.0.0.0 --port=8000
