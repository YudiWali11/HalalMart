#!/bin/sh
set -e

echo "Running Laravel migrations..."
php artisan migrate --force

echo "Clearing and optimizing config..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "Starting Apache..."
exec apache2-foreground
