#!/bin/bash
# Google Cloud VM Startup Script for UIET College Website
# This script runs when the VM first starts up

# Log everything to startup log
exec > >(tee -a /var/log/startup-script.log)
exec 2>&1

echo "Starting UIET College Website setup..."
echo "Timestamp: $(date)"

# Update system
apt-get update -y

# Install basic tools
apt-get install -y curl wget git htop nano

echo "Basic system setup completed"
echo "Please connect via SSH to continue with application deployment"
