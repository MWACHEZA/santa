# 🚀 St. Patrick's Catholic Church - Deployment Guide

This comprehensive guide covers deployment options for the St. Patrick's Catholic Church Management System, with detailed instructions for Render.com deployment and other platforms.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Render.com Deployment (Recommended)](#rendercom-deployment)
3. [Manual Server Deployment](#manual-server-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [File Storage Configuration](#file-storage-configuration)
7. [SSL and Security](#ssl-and-security)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MySQL** (v8.0 or higher)
- **Git**

### Required Accounts
- **Render.com** account (for cloud deployment)
- **Domain name** (optional, for custom domain)
- **Email service** (Gmail, SendGrid, etc.)

## 🌐 Render.com Deployment (Recommended)

Render.com provides an excellent platform for deploying full-stack applications with automatic scaling and built-in security.

### Step 1: Prepare Your Repository

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify File Structure**
   ```
   st-patricks-makokoba/
   ├── backend/
   │   ├── package.json
   │   ├── server.js
   │   └── ...
   ├── src/
   │   ├── components/
   │   └── ...
   ├── package.json
   ├── render.yaml
   └── README.md
   ```

### Step 2: Create Render Services

#### Option A: Using Blueprint (Recommended)

1. **Login to Render Dashboard**
   - Go to [render.com](https://render.com)
   - Sign in with GitHub/GitLab

2. **Create New Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml`
   - Review and deploy all services

#### Option B: Manual Service Creation

1. **Create Database Service**
   - Click "New +" → "PostgreSQL" or "MySQL"
   - Name: `st-patricks-db`
   - Plan: Starter (can upgrade later)
   - Note down connection details

2. **Create Backend Service**
   - Click "New +" → "Web Service"
   - Connect repository
   - Settings:
     - **Name**: `st-patricks-api`
     - **Runtime**: Node
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Plan**: Starter

3. **Create Frontend Service**
   - Click "New +" → "Static Site"
   - Connect repository
   - Settings:
     - **Name**: `st-patricks-frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`

### Step 3: Configure Environment Variables

#### Backend Environment Variables
```bash
# Database Configuration
DB_HOST=<render-database-host>
DB_PORT=3306
DB_USER=<render-database-user>
DB_PASSWORD=<render-database-password>
DB_NAME=st_patricks_db

# Application Settings
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-secure-random-string>
BCRYPT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=https://st-patricks.onrender.com

# File Upload Settings
MAX_FILE_SIZE=52428800
UPLOAD_PATH=/opt/render/project/src/uploads

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASS=<your-app-password>
EMAIL_FROM=noreply@stpatricks.com
```

#### Frontend Environment Variables
```bash
REACT_APP_API_URL=https://st-patricks-api.onrender.com
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
CI=false
```

### Step 4: Database Initialization

1. **Connect to Database**
   ```bash
   mysql -h <render-db-host> -P <port> -u <user> -p<password>
   ```

2. **Run Database Schema**
   ```sql
   SOURCE comprehensive-database-schema.sql;
   ```

3. **Verify Tables Created**
   ```sql
   USE st_patricks_db;
   SHOW TABLES;
   ```

### Step 5: Custom Domain (Optional)

1. **Add Custom Domain in Render**
   - Go to service settings
   - Add custom domain: `www.stpatricks.com`
   - Follow DNS configuration instructions

2. **Configure DNS Records**
   ```
   Type: CNAME
   Name: www
   Value: st-patricks.onrender.com
   ```

## 🖥️ Manual Server Deployment

For deployment on your own server (VPS, dedicated server, etc.).

### Step 1: Server Setup

1. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Dependencies**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install MySQL
   sudo apt install mysql-server -y

   # Install Nginx
   sudo apt install nginx -y

   # Install PM2 (Process Manager)
   sudo npm install -g pm2
   ```

### Step 2: Application Deployment

1. **Clone Repository**
   ```bash
   cd /var/www
   sudo git clone https://github.com/yourusername/st-patricks-makokoba.git
   sudo chown -R $USER:$USER st-patricks-makokoba
   cd st-patricks-makokoba
   ```

2. **Install Dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install --production
   
   # Frontend build
   cd ..
   npm install
   npm run build
   ```

3. **Configure Environment**
   ```bash
   # Create environment file
   cd backend
   cp .env.example .env
   nano .env
   ```

### Step 3: Database Setup

1. **Secure MySQL Installation**
   ```bash
   sudo mysql_secure_installation
   ```

2. **Create Database and User**
   ```sql
   mysql -u root -p
   
   CREATE DATABASE st_patricks_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'st_patricks_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON st_patricks_db.* TO 'st_patricks_user'@'localhost';
   FLUSH PRIVILEGES;
   
   USE st_patricks_db;
   SOURCE comprehensive-database-schema.sql;
   ```

### Step 4: Process Management

1. **Create PM2 Ecosystem File**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'st-patricks-api',
       script: './backend/server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3001
       }
     }]
   };
   ```

2. **Start Application**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Step 5: Nginx Configuration

1. **Create Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/stpatricks
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       # Frontend
       location / {
           root /var/www/st-patricks-makokoba/build;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
       
       # API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
       
       # File uploads
       location /uploads {
           alias /var/www/st-patricks-makokoba/backend/uploads;
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

2. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/stpatricks /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 🔐 Environment Configuration

### Required Environment Variables

#### Backend (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=st_patricks_user
DB_PASSWORD=your_secure_password
DB_NAME=st_patricks_db

# Application
NODE_ENV=production
PORT=3001
JWT_SECRET=your_jwt_secret_minimum_32_characters
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Optional: External Services
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

## 🗄️ Database Setup

### Schema Installation

1. **Download Schema**
   ```bash
   wget https://raw.githubusercontent.com/yourusername/st-patricks-makokoba/main/backend/comprehensive-database-schema.sql
   ```

2. **Install Schema**
   ```bash
   mysql -u st_patricks_user -p st_patricks_db < comprehensive-database-schema.sql
   ```

3. **Verify Installation**
   ```sql
   mysql -u st_patricks_user -p
   USE st_patricks_db;
   SHOW TABLES;
   SELECT COUNT(*) FROM users;
   ```

### Default Users

The schema creates default users:
- **Admin**: username: `admin`, password: `admin123`
- **Priest**: username: `priest`, password: `priest123`
- **Parishioner**: username: `parishioner`, password: `parish123`

**⚠️ IMPORTANT**: Change these passwords immediately after deployment!

## 📁 File Storage Configuration

### Local File Storage

1. **Create Upload Directories**
   ```bash
   mkdir -p backend/uploads/{images,videos,audio,documents,thumbnails}
   chmod 755 backend/uploads
   ```

2. **Configure Permissions**
   ```bash
   # For production server
   sudo chown -R www-data:www-data backend/uploads
   sudo chmod -R 755 backend/uploads
   ```

### Cloud Storage (Optional)

For better scalability, consider using cloud storage:

#### Cloudinary Setup
```javascript
// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

## 🔒 SSL and Security

### SSL Certificate (Let's Encrypt)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Obtain Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Security Headers

Add to Nginx configuration:
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
```

## 📊 Monitoring and Maintenance

### Health Checks

1. **API Health Endpoint**
   ```javascript
   // backend/routes/health.js
   app.get('/api/health', (req, res) => {
     res.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       uptime: process.uptime()
     });
   });
   ```

2. **Database Health Check**
   ```javascript
   app.get('/api/health/db', async (req, res) => {
     try {
       await db.execute('SELECT 1');
       res.json({ status: 'healthy', database: 'connected' });
     } catch (error) {
       res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
     }
   });
   ```

### Backup Strategy

1. **Database Backup Script**
   ```bash
   #!/bin/bash
   # backup-db.sh
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/backups/mysql"
   
   mkdir -p $BACKUP_DIR
   
   mysqldump -u st_patricks_user -p st_patricks_db > $BACKUP_DIR/st_patricks_db_$DATE.sql
   
   # Keep only last 7 days of backups
   find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
   ```

2. **Automated Backups**
   ```bash
   # Add to crontab
   0 2 * * * /path/to/backup-db.sh
   ```

### Log Management

1. **PM2 Logs**
   ```bash
   pm2 logs st-patricks-api
   pm2 logs --lines 100
   ```

2. **Nginx Logs**
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check MySQL service
sudo systemctl status mysql

# Check connection
mysql -u st_patricks_user -p -h localhost

# Check environment variables
echo $DB_HOST $DB_USER $DB_NAME
```

#### 2. File Upload Issues
```bash
# Check permissions
ls -la backend/uploads/
sudo chown -R www-data:www-data backend/uploads/

# Check disk space
df -h
```

#### 3. API Not Responding
```bash
# Check PM2 status
pm2 status
pm2 restart st-patricks-api

# Check logs
pm2 logs st-patricks-api --lines 50
```

#### 4. Frontend Not Loading
```bash
# Check Nginx configuration
sudo nginx -t

# Check build files
ls -la build/

# Rebuild if necessary
npm run build
```

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Add indexes for common queries
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_events_date ON events(start_datetime);
   CREATE INDEX idx_media_type ON media_files(file_type);
   ```

2. **Nginx Caching**
   ```nginx
   # Add to server block
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **PM2 Clustering**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'st-patricks-api',
       script: './backend/server.js',
       instances: 'max', // Use all CPU cores
       exec_mode: 'cluster'
     }]
   };
   ```

## 📞 Support

For deployment support:
- **Documentation**: Check this guide first
- **Issues**: Create GitHub issue with deployment logs
- **Community**: Join our Discord/Slack channel

---

**🎉 Congratulations!** Your St. Patrick's Catholic Church Management System should now be successfully deployed and running!

Remember to:
- Change default passwords
- Set up regular backups
- Monitor system health
- Keep dependencies updated
- Review security settings regularly
