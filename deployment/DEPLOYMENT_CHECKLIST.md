# 🚀 Deployment Checklist for UIET College Website

Use this checklist to ensure your deployment is complete and secure.

## Pre-Deployment ✅

- [ ] Google Cloud Project created with billing enabled
- [ ] Domain name registered (optional)
- [ ] Environment variables prepared
- [ ] Email service configured (Gmail App Password)
- [ ] Cloudinary account set up for file uploads
- [ ] Stripe account configured for payments

## Infrastructure Setup ✅

- [ ] VM instance created (`e2-standard-2` or higher)
- [ ] Firewall rules configured (HTTP, HTTPS, Port 5000)
- [ ] Static IP assigned (optional, recommended for production)
- [ ] Domain DNS configured (if using custom domain)

## Application Deployment ✅

- [ ] Connected to VM via SSH
- [ ] Ran deployment script (`./deploy.sh`)
- [ ] Environment variables configured in `.env`
- [ ] Database setup completed (`./mongodb-setup.sh`)
- [ ] Frontend built and deployed to Nginx
- [ ] Backend started with PM2

## Security Configuration ✅

- [ ] SSL certificate installed (if using domain)
- [ ] UFW firewall enabled
- [ ] MongoDB authentication configured
- [ ] Strong JWT secrets set
- [ ] Admin password changed from default
- [ ] CORS properly configured
- [ ] Rate limiting enabled

## Testing ✅

- [ ] Frontend accessible via browser
- [ ] Backend API health check working (`/api/health`)
- [ ] User registration and login working
- [ ] File uploads working (profile pictures, documents)
- [ ] Email notifications working
- [ ] Database queries working
- [ ] SSL certificate valid (if configured)

## Monitoring & Maintenance ✅

- [ ] Daily backup cron job set up
- [ ] Monitoring script scheduled
- [ ] Log rotation configured
- [ ] PM2 startup script enabled
- [ ] Health check endpoints monitored

## Performance Optimization ✅

- [ ] Nginx gzip compression enabled
- [ ] Static asset caching configured
- [ ] Database indexes created
- [ ] PM2 cluster mode enabled (if needed)
- [ ] CDN configured (optional)

## Documentation ✅

- [ ] Environment variables documented
- [ ] Admin credentials recorded securely
- [ ] Backup procedures documented
- [ ] Troubleshooting guide available
- [ ] Update procedures documented

## Post-Deployment Tasks ✅

- [ ] Initial admin user created
- [ ] Sample data added (departments, test users)
- [ ] User roles and permissions tested
- [ ] All features tested end-to-end
- [ ] Performance benchmarks recorded

## Emergency Procedures ✅

- [ ] Backup restoration process tested
- [ ] Rollback procedure documented
- [ ] Emergency contact information available
- [ ] Disaster recovery plan in place

---

## Quick Verification Commands

```bash
# System Health
./deployment/monitor.sh

# Check Services
sudo systemctl status nginx mongod
pm2 status

# Test API
curl http://localhost:5000/api/health

# Check SSL
curl -I https://your-domain.com

# Database Connection
mongosh uiet_college --eval "db.stats()"

# Disk Space
df -h

# Memory Usage
free -h

# Recent Logs
pm2 logs uiet-backend --lines 20
sudo tail -20 /var/log/nginx/access.log
```

## Production Readiness Score

Count your completed items:
- **90-100%**: Production Ready ✅
- **80-89%**: Near Production Ready ⚠️
- **70-79%**: Development Ready 📝
- **Below 70%**: Needs More Work ❌

---

## Emergency Contacts

- **System Administrator**: [Your Email]
- **Database Admin**: [Your Email]
- **Domain Registrar**: [Contact Info]
- **Cloud Provider Support**: Google Cloud Support
- **SSL Certificate**: Let's Encrypt (automatic renewal)

## Important URLs

- **Application**: https://your-domain.com
- **API Health**: https://your-domain.com/api/health
- **Google Cloud Console**: https://console.cloud.google.com
- **Domain Management**: [Your Domain Registrar]

## Deployment Date: ___________
## Deployed By: ___________
## Version: ___________
