#!/bin/bash

# MongoDB Setup Script for UIET College Website

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

print_status "Setting up MongoDB for UIET College Website..."

# Generate secure password
DB_PASSWORD=$(openssl rand -base64 32)

print_status "Creating MongoDB database and user..."

# Connect to MongoDB and create database/user
mongosh --eval "
use uiet_college;
db.createUser({
  user: 'uiet_user',
  pwd: '$DB_PASSWORD',
  roles: [
    {role: 'readWrite', db: 'uiet_college'}
  ]
});
print('Database and user created successfully');
"

# Create initial admin user
print_status "Creating initial admin user..."
mongosh uiet_college --eval "
db.users.insertOne({
  name: 'System Administrator',
  email: 'admin@uiet-college.edu',
  password: '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeWz2/jyTwYZ6b8gm', // password: admin123
  role: 'admin',
  isVerified: true,
  department: 'Administration',
  createdAt: new Date(),
  updatedAt: new Date()
});
print('Admin user created with email: admin@uiet-college.edu, password: admin123');
"

# Create departments collection
print_status "Setting up departments..."
mongosh uiet_college --eval "
db.departments.insertMany([
  { name: 'Computer Science', code: 'CS', createdAt: new Date() },
  { name: 'Mechanical Engineering', code: 'ME', createdAt: new Date() },
  { name: 'Electrical Engineering', code: 'EE', createdAt: new Date() },
  { name: 'Civil Engineering', code: 'CE', createdAt: new Date() },
  { name: 'Electronics & Communication', code: 'ECE', createdAt: new Date() }
]);
print('Departments created successfully');
"

# Create indexes for better performance
print_status "Creating database indexes..."
mongosh uiet_college --eval "
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ department: 1 });
db.notes.createIndex({ title: 'text', description: 'text' });
db.notes.createIndex({ department: 1 });
db.notes.createIndex({ createdAt: -1 });
db.notifications.createIndex({ createdAt: -1 });
db.notifications.createIndex({ targetAudience: 1 });
db.merchandise.createIndex({ name: 'text', description: 'text' });
db.merchandise.createIndex({ category: 1 });
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ createdAt: -1 });
print('Indexes created successfully');
"

print_success "MongoDB setup completed successfully!"
print_warning "Database Password: $DB_PASSWORD"
print_warning "Please update your .env file with this connection string:"
echo "MONGODB_URI=mongodb://uiet_user:$DB_PASSWORD@localhost:27017/uiet_college"
print_warning "Admin login credentials:"
echo "Email: admin@uiet-college.edu"
echo "Password: admin123"
print_warning "Please change the admin password after first login!"
