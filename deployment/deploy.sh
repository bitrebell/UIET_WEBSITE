#!/bin/bash

# UIET College Website Deployment Script for Google Cloud VM
# Run this script after connecting to your VM instance

set -e

echo "🚀 Starting UIET College Website deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root"
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated successfully"

# Install Node.js 18
print_status "Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_warning "Node.js already installed: $(node --version)"
fi

# Install PM2
print_status "Installing PM2 process manager..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed successfully"
else
    print_warning "PM2 already installed"
fi

# Install Nginx
print_status "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_success "Nginx installed and started"
else
    print_warning "Nginx already installed"
fi

# Install Git
print_status "Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install git -y
    print_success "Git installed successfully"
else
    print_warning "Git already installed"
fi

# Install MongoDB
print_status "Installing MongoDB..."
if ! command -v mongod &> /dev/null; then
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
    print_success "MongoDB installed and started"
else
    print_warning "MongoDB already installed"
fi

# Clone repository
print_status "Cloning UIET College Website repository..."
if [ ! -d "UIET_WEBSITE" ]; then
    git clone https://github.com/bitrebell/UIET_WEBSITE.git
    print_success "Repository cloned successfully"
else
    print_warning "Repository already exists, pulling latest changes..."
    cd UIET_WEBSITE && git pull && cd ..
fi

cd UIET_WEBSITE

# Set up backend
print_status "Setting up backend..."
cd backend

# Install backend dependencies
npm install
print_success "Backend dependencies installed"

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_warning "Created .env file from template. Please update it with your configuration!"
    print_warning "Edit the file: nano .env"
else
    print_warning ".env file already exists"
fi

cd ..

# Set up frontend
print_status "Setting up frontend..."
cd frontend

# Install frontend dependencies
npm install
print_success "Frontend dependencies installed"

# Build frontend
print_status "Building frontend for production..."
npm run build
print_success "Frontend built successfully"

# Copy build files to Nginx directory
print_status "Deploying frontend to Nginx..."
sudo rm -rf /var/www/html/*
sudo cp -r build/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
print_success "Frontend deployed to /var/www/html"

cd ..

# Configure Nginx
print_status "Configuring Nginx..."
if [ -f "deployment/nginx.conf" ]; then
    sudo cp deployment/nginx.conf /etc/nginx/sites-available/uiet-website
    
    # Enable the site
    if [ ! -f "/etc/nginx/sites-enabled/uiet-website" ]; then
        sudo ln -s /etc/nginx/sites-available/uiet-website /etc/nginx/sites-enabled/
    fi
    
    # Disable default site
    if [ -f "/etc/nginx/sites-enabled/default" ]; then
        sudo rm /etc/nginx/sites-enabled/default
    fi
    
    # Test Nginx configuration
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        print_success "Nginx configured and reloaded"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
else
    print_warning "Nginx configuration file not found, using default setup"
fi

# Start backend with PM2
print_status "Starting backend with PM2..."
cd backend

# Stop existing process if running
pm2 delete uiet-backend 2>/dev/null || true

# Start the application
pm2 start server.js --name "uiet-backend"
pm2 startup
pm2 save
print_success "Backend started with PM2"

# Set up firewall (if UFW is available)
if command -v ufw &> /dev/null; then
    print_status "Configuring firewall..."
    sudo ufw allow ssh
    sudo ufw allow http
    sudo ufw allow https
    sudo ufw allow 5000
    sudo ufw --force enable
    print_success "Firewall configured"
fi

# Final status check
print_status "Checking service status..."
echo "MongoDB status:"
sudo systemctl status mongod --no-pager
echo ""
echo "Nginx status:"
sudo systemctl status nginx --no-pager
echo ""
echo "PM2 status:"
pm2 status

print_success "🎉 Deployment completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Update your .env file in the backend directory"
echo "2. Configure your domain name in Nginx configuration"
echo "3. Set up SSL certificate with Let's Encrypt"
echo "4. Configure MongoDB user and authentication"
echo ""
print_status "Useful commands:"
echo "- Check PM2 logs: pm2 logs uiet-backend"
echo "- Restart backend: pm2 restart uiet-backend"
echo "- Nginx logs: sudo tail -f /var/log/nginx/access.log"
echo "- MongoDB logs: sudo journalctl -u mongod"
