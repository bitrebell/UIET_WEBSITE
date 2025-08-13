#!/bin/bash

# Backup script for UIET College Website
# Creates backups of database and uploaded files

set -e

BACKUP_DIR="/home/$(whoami)/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_DIR="$BACKUP_DIR/database"
FILES_BACKUP_DIR="$BACKUP_DIR/files"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Create backup directories
mkdir -p "$DB_BACKUP_DIR"
mkdir -p "$FILES_BACKUP_DIR"

print_status "Starting backup process..."

# Database backup
print_status "Backing up MongoDB database..."
mongodump --db uiet_college --out "$DB_BACKUP_DIR/mongodb_$DATE"
if [ $? -eq 0 ]; then
    print_success "Database backup created: mongodb_$DATE"
else
    echo "Database backup failed"
    exit 1
fi

# Compress database backup
print_status "Compressing database backup..."
cd "$DB_BACKUP_DIR"
tar -czf "mongodb_backup_$DATE.tar.gz" "mongodb_$DATE"
rm -rf "mongodb_$DATE"
print_success "Database backup compressed"

# Files backup (if uploads directory exists)
if [ -d "/home/$(whoami)/UIET_WEBSITE/backend/uploads" ]; then
    print_status "Backing up uploaded files..."
    tar -czf "$FILES_BACKUP_DIR/files_backup_$DATE.tar.gz" -C "/home/$(whoami)/UIET_WEBSITE/backend" uploads
    print_success "Files backup created: files_backup_$DATE.tar.gz"
fi

# Application code backup
print_status "Backing up application code..."
cd "/home/$(whoami)"
tar --exclude='node_modules' --exclude='build' --exclude='logs' --exclude='.git' \
    -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" UIET_WEBSITE
print_success "Application code backup created"

# Clean old backups (keep only last 7 days)
print_status "Cleaning old backups..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete
print_success "Old backups cleaned"

# Create backup summary
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | awk '{print $1}')
cat > "$BACKUP_DIR/backup_summary_$DATE.txt" << EOF
Backup Summary - $DATE
========================
Date: $(date)
Database Backup: mongodb_backup_$DATE.tar.gz
Files Backup: files_backup_$DATE.tar.gz (if exists)
App Backup: app_backup_$DATE.tar.gz
Total Size: $BACKUP_SIZE
Location: $BACKUP_DIR
EOF

print_success "Backup completed successfully!"
print_status "Backup location: $BACKUP_DIR"
print_status "Total backup size: $BACKUP_SIZE"

# Optional: Upload to Google Cloud Storage (uncomment if needed)
# if command -v gsutil &> /dev/null; then
#     print_status "Uploading backups to Google Cloud Storage..."
#     gsutil -m cp -r "$BACKUP_DIR" gs://your-backup-bucket/uiet-backups/
#     print_success "Backups uploaded to cloud storage"
# fi
