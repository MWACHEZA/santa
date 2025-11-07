# 🚀 Production Deployment Guide - St. Patrick's Catholic Church Website

## 📋 Pre-Deployment Checklist

### Security Requirements
- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Create dedicated database user
- [ ] Enable database backups
- [ ] Set up monitoring and logging

### Environment Setup
- [ ] Production server with Node.js 16+
- [ ] MySQL/MariaDB production database
- [ ] Domain name and DNS configuration
- [ ] Email service for notifications
- [ ] CDN for static assets (optional)

## 🔐 Security Configuration

### 1. Database Security

#### Create Production Database User
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create dedicated user
CREATE USER 'stpatricks_prod'@'localhost' IDENTIFIED BY 'STRONG_RANDOM_PASSWORD_HERE';

-- Create production database
CREATE DATABASE st_patricks_church_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant permissions
GRANT ALL PRIVILEGES ON st_patricks_church_prod.* TO 'stpatricks_prod'@'localhost';
FLUSH PRIVILEGES;

-- Test connection
mysql -u stpatricks_prod -p st_patricks_church_prod
```

#### Secure MySQL Configuration
```sql
-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Remove remote root access
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Remove test database
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';

-- Reload privileges
FLUSH PRIVILEGES;
```

### 2. Environment Variables

#### Production Backend `.env`
```env
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database Configuration
DB_HOST=localhost
DB_USER=stpatricks_prod
DB_PASSWORD=STRONG_RANDOM_PASSWORD_HERE
DB_NAME=st_patricks_church_prod
DB_PORT=3306

# JWT Configuration (Generate new secrets!)
JWT_SECRET=GENERATE_STRONG_SECRET_256_CHARS_MIN
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=GENERATE_ANOTHER_STRONG_SECRET_256_CHARS_MIN
JWT_REFRESH_EXPIRES_IN=30d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_church_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=St. Patrick's Catholic Church

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# External APIs
DIOCESE_API_URL=https://api.archdiocesebulawayo.org
VATICAN_API_URL=https://api.vatican.va
ZCBC_API_URL=https://api.zcbc.co.zw
```

#### Production Frontend `.env`
```env
# API Configuration
REACT_APP_API_URL=https://yourdomain.com/api

# Application Configuration
REACT_APP_NAME=St. Patrick's Catholic Church
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# Church Information
REACT_APP_CHURCH_NAME=St. Patrick's Catholic Church
REACT_APP_CHURCH_LOCATION=Makokoba, Bulawayo, Zimbabwe
REACT_APP_DIOCESE=Archdiocese of Bulawayo

# Google Analytics
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX

# Social Media Links
REACT_APP_FACEBOOK_URL=https://facebook.com/stpatricksmakokoba
REACT_APP_TWITTER_URL=https://twitter.com/stpatricksmako
REACT_APP_YOUTUBE_URL=https://youtube.com/stpatricksmakokoba

# Features Toggle
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PRAYER_REQUESTS=true
REACT_APP_ENABLE_EVENT_REGISTRATION=true
REACT_APP_ENABLE_GALLERY=true

# Production Settings
REACT_APP_DEBUG_MODE=false
REACT_APP_MOCK_API=false
```

## 🏗️ Server Setup

### 1. Ubuntu/Debian Server Setup

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

#### Configure MySQL
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Application Deployment

#### Clone and Setup Application
```bash
# Create application directory
sudo mkdir -p /var/www/stpatricks
sudo chown $USER:$USER /var/www/stpatricks

# Clone repository
cd /var/www/stpatricks
git clone https://github.com/yourusername/st-patricks-makokoba.git .

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies and build
cd ..
npm install
npm run build
```

#### Setup Environment Files
```bash
# Copy production environment files
cp backend/.env.example backend/.env
cp .env.example .env

# Edit with production values
nano backend/.env
nano .env
```

#### Initialize Database
```bash
# Run database setup
cd backend
npm run setup

# Start backend to initialize database
npm start
```

### 3. Process Management with PM2

#### Create PM2 Ecosystem File
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'stpatricks-backend',
    script: './backend/server.js',
    cwd: '/var/www/stpatricks',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/stpatricks-backend-error.log',
    out_file: '/var/log/pm2/stpatricks-backend-out.log',
    log_file: '/var/log/pm2/stpatricks-backend.log',
    time: true
  }]
};
```

#### Start Application with PM2
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Monitor application
pm2 monit
```

### 4. Nginx Configuration

#### Create Nginx Configuration
```nginx
# /etc/nginx/sites-available/stpatricks
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Serve React build files
    root /var/www/stpatricks/build;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve uploaded files
    location /uploads {
        alias /var/www/stpatricks/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

#### Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/stpatricks /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5. SSL Certificate Setup

#### Get SSL Certificate
```bash
# Get certificate from Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring and Maintenance

### 1. Log Management

#### Setup Log Rotation
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/stpatricks

# Add configuration:
/var/log/pm2/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. Database Backups

#### Automated Backup Script
```bash
#!/bin/bash
# /home/user/scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"
DB_NAME="st_patricks_church_prod"
DB_USER="stpatricks_prod"
DB_PASS="YOUR_DB_PASSWORD"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/stpatricks_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/stpatricks_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "stpatricks_*.sql.gz" -mtime +30 -delete

echo "Backup completed: stpatricks_$DATE.sql.gz"
```

#### Setup Backup Cron Job
```bash
# Make script executable
chmod +x /home/user/scripts/backup-db.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /home/user/scripts/backup-db.sh
```

### 3. Monitoring Setup

#### Install Monitoring Tools
```bash
# Install htop for system monitoring
sudo apt install htop -y

# Install netdata for real-time monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

#### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart stpatricks-backend

# View process status
pm2 status
```

## 🔄 Deployment Updates

### 1. Application Updates

#### Update Script
```bash
#!/bin/bash
# /home/user/scripts/update-app.sh

cd /var/www/stpatricks

# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
npm install --production

# Update frontend and rebuild
cd ..
npm install
npm run build

# Restart application
pm2 restart stpatricks-backend

echo "Application updated successfully"
```

### 2. Zero-Downtime Deployment

#### Blue-Green Deployment Setup
```bash
# Create deployment directories
sudo mkdir -p /var/www/stpatricks-blue
sudo mkdir -p /var/www/stpatricks-green

# Setup symlink for current version
sudo ln -s /var/www/stpatricks-blue /var/www/stpatricks-current
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check PM2 logs
pm2 logs stpatricks-backend

# Check system resources
htop
df -h

# Check database connection
cd /var/www/stpatricks/backend
npm run check-db
```

#### High Memory Usage
```bash
# Restart PM2 processes
pm2 restart all

# Check for memory leaks
pm2 monit

# Optimize PM2 configuration
pm2 delete all
pm2 start ecosystem.config.js
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test Nginx configuration
sudo nginx -t
```

## 📈 Performance Optimization

### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_news_published ON news(is_published, published_at);
CREATE INDEX idx_events_date ON events(event_date, is_published);
CREATE INDEX idx_announcements_active ON announcements(is_active, start_date, end_date);
```

### 2. Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable HTTP/2
listen 443 ssl http2;

# Enable caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;
```

### 3. Node.js Optimization
```javascript
// Add to ecosystem.config.js
env: {
  NODE_ENV: 'production',
  NODE_OPTIONS: '--max-old-space-size=2048'
}
```

## ✅ Final Checklist

### Pre-Launch
- [ ] All default passwords changed
- [ ] SSL certificate installed and working
- [ ] Database backups configured
- [ ] Monitoring setup complete
- [ ] Error logging configured
- [ ] Performance testing completed
- [ ] Security scan performed

### Post-Launch
- [ ] Monitor application logs
- [ ] Check website performance
- [ ] Verify all features working
- [ ] Test admin dashboard
- [ ] Confirm email notifications
- [ ] Monitor server resources

## 🎉 Success!

Your St. Patrick's Catholic Church website is now successfully deployed to production with:

- ✅ **Secure HTTPS** with SSL certificates
- ✅ **Production database** with backups
- ✅ **Process management** with PM2
- ✅ **Reverse proxy** with Nginx
- ✅ **Monitoring and logging** setup
- ✅ **Automated deployments** ready
- ✅ **Performance optimization** configured

The website is now ready to serve the parish community! 🏛️✨
