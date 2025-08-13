#!/bin/bash

# SSL Certificate Setup with Let's Encrypt
# Run this script after your domain is pointing to the server

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if domain is provided
if [ -z "$1" ]; then
    print_error "Please provide your domain name"
    echo "Usage: ./ssl-setup.sh your-domain.com"
    exit 1
fi

DOMAIN=$1
print_status "Setting up SSL certificate for domain: $DOMAIN"

# Install Certbot
print_status "Installing Certbot..."
sudo apt install certbot python3-certbot-nginx -y
print_success "Certbot installed"

# Update Nginx configuration with domain
print_status "Updating Nginx configuration..."
sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/uiet-website

# Test Nginx configuration
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    print_success "Nginx configuration updated and reloaded"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Get SSL certificate
print_status "Obtaining SSL certificate from Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

if [ $? -eq 0 ]; then
    print_success "SSL certificate obtained and installed successfully!"
    
    # Set up auto-renewal
    print_status "Setting up automatic certificate renewal..."
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
    print_success "Auto-renewal configured"
    
    print_success "🔒 Your website is now secured with HTTPS!"
    print_status "You can access your website at: https://$DOMAIN"
else
    print_error "Failed to obtain SSL certificate"
    print_warning "Make sure your domain is pointing to this server's IP address"
    exit 1
fi
