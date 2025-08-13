# UIET College Website - Google Cloud Deployment Guide

## Prerequisites
- Google Cloud Platform account
- Google Cloud CLI (gcloud) installed
- Docker installed locally
- Node.js and npm installed

## Step 1: Set up Google Cloud Project

1. Create a new project or select existing one:
```bash
gcloud projects create uiet-college-website --name="UIET College Website"
gcloud config set project uiet-college-website
```

2. Enable required APIs:
```bash
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

3. Set up billing (required for VM instances)

## Step 2: Create VM Instance

Create a Compute Engine instance:
```bash
gcloud compute instances create uiet-server \
  --zone=us-central1-a \
  --machine-type=e2-standard-2 \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-standard \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --tags=http-server,https-server
```

## Step 3: Configure Firewall Rules

```bash
# Allow HTTP traffic
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server

# Allow HTTPS traffic
gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --source-ranges 0.0.0.0/0 \
  --target-tags https-server

# Allow Node.js backend port
gcloud compute firewall-rules create allow-backend \
  --allow tcp:5000 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server
```

## Step 4: Connect to VM

```bash
gcloud compute ssh uiet-server --zone=us-central1-a
```

## Step 5: Set up VM Environment

Once connected to the VM, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Step 6: Clone and Deploy Application

```bash
# Clone the repository
git clone https://github.com/bitrebell/UIET_WEBSITE.git
cd UIET_WEBSITE

# Set up backend
cd backend
npm install
cp .env.example .env

# Edit environment variables
sudo nano .env
# Update with production values

# Build frontend
cd ../frontend
npm install
npm run build

# Move build files to web server directory
sudo cp -r build/* /var/www/html/

# Start backend with PM2
cd ../backend
pm2 start server.js --name "uiet-backend"
pm2 startup
pm2 save
```

## Step 7: Configure Nginx

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/uiet-website
```

## Step 8: Set up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Step 9: Configure Database

```bash
# Connect to MongoDB
mongosh

# Create database and user
use uiet_college
db.createUser({
  user: "uiet_user",
  pwd: "your_secure_password",
  roles: [{role: "readWrite", db: "uiet_college"}]
})
```

## Step 10: Set up Monitoring

```bash
# Install monitoring tools
sudo apt install htop -y

# Set up log rotation
sudo nano /etc/logrotate.d/uiet-app
```

## Estimated Costs (Monthly)
- e2-standard-2 VM: ~$50-70/month
- Storage (20GB): ~$2/month
- Network egress: Variable based on traffic
- Total: ~$55-75/month

## Security Considerations
- Keep system updated
- Use strong passwords
- Configure firewall properly
- Regular backups
- Monitor logs
- Use environment variables for secrets
