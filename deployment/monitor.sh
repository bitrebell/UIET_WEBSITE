#!/bin/bash

# System monitoring script for UIET College Website
# Run this script to check the health of all services

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

check_service() {
    if systemctl is-active --quiet $1; then
        print_success "$1 is running"
    else
        print_error "$1 is not running"
    fi
}

print_header "System Information"
echo "Date: $(date)"
echo "Uptime: $(uptime -p)"
echo "Load Average: $(uptime | awk -F'load average:' '{ print $2 }')"

print_header "Disk Usage"
df -h / | tail -1 | awk '{print "Root partition: " $3 " used of " $2 " (" $5 " full)"}'

print_header "Memory Usage"
free -h | awk 'NR==2{printf "Memory: %s used of %s (%.2f%%)\n", $3, $2, $3*100/$2}'

print_header "Service Status"
check_service nginx
check_service mongod

print_header "PM2 Status"
if command -v pm2 &> /dev/null; then
    pm2 status
else
    print_error "PM2 not found"
fi

print_header "MongoDB Status"
if mongosh --eval "db.adminCommand('ismaster')" --quiet > /dev/null 2>&1; then
    print_success "MongoDB is accessible"
    # Count documents in main collections
    echo "Collections status:"
    mongosh uiet_college --eval "
        print('Users: ' + db.users.countDocuments());
        print('Notes: ' + db.notes.countDocuments());
        print('Notifications: ' + db.notifications.countDocuments());
        print('Merchandise: ' + db.merchandise.countDocuments());
        print('Orders: ' + db.orders.countDocuments());
    " --quiet
else
    print_error "MongoDB is not accessible"
fi

print_header "Nginx Status"
if nginx -t > /dev/null 2>&1; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors"
fi

print_header "SSL Certificate Status"
DOMAIN=$(grep -oP 'server_name \K[^;]*' /etc/nginx/sites-available/uiet-website | head -1 | awk '{print $1}')
if [ ! -z "$DOMAIN" ] && [ "$DOMAIN" != "your-domain.com" ]; then
    CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    if [ -f "$CERT_PATH" ]; then
        EXPIRE_DATE=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
        print_success "SSL certificate exists, expires: $EXPIRE_DATE"
    else
        print_warning "SSL certificate not found"
    fi
else
    print_warning "Domain not configured yet"
fi

print_header "Recent Error Logs"
echo "Nginx errors (last 5):"
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "No nginx error log found"

echo -e "\nPM2 errors (last 5):"
pm2 logs uiet-backend --lines 5 --err --nostream 2>/dev/null || echo "No PM2 logs found"

print_header "Network Connectivity"
if curl -s http://localhost:80 > /dev/null; then
    print_success "Local HTTP server responding"
else
    print_error "Local HTTP server not responding"
fi

if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    print_success "Backend API responding"
else
    print_error "Backend API not responding"
fi

print_header "Security Updates Available"
UPDATES=$(apt list --upgradable 2>/dev/null | wc -l)
if [ $UPDATES -gt 1 ]; then
    print_warning "$((UPDATES-1)) security updates available"
    echo "Run: sudo apt update && sudo apt upgrade"
else
    print_success "System is up to date"
fi
