# 🏛️ St. Patrick's Catholic Church Website - Complete Setup Guide

## 📋 Overview

This guide will help you set up the complete St. Patrick's Catholic Church website system with:
- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express.js API
- **Database**: MySQL/MariaDB with automatic initialization
- **Authentication**: JWT-based with role management
- **File Uploads**: Image optimization and storage
- **Admin Dashboard**: Complete content management system

## 🚀 Quick Start (5 Minutes)

### 1. Install Database
**Option A: XAMPP (Recommended)**
```bash
# Download and install XAMPP from https://www.apachefriends.org/
# Start MySQL service from XAMPP Control Panel
```

**Option B: Standalone MySQL**
```bash
# Download MySQL from https://dev.mysql.com/downloads/mysql/
# Install and start MySQL service
```

### 2. Configure Database
Edit `backend/.env` and set your MySQL password:
```env
DB_PASSWORD=your_mysql_password_here
```

### 3. Start Backend
```bash
cd backend
npm install
npm run check-db  # Optional: Check database connection
npm run dev       # Starts backend server on port 5000
```

### 4. Start Frontend
```bash
# In a new terminal, from project root
npm install
npm start         # Starts frontend on port 3000
```

### 5. Access the System
- **Website**: http://localhost:3000
- **Login Credentials**:
  - Admin: `admin` / `admin123`
  - User: `parishioner` / `parish123`

## 🔧 Detailed Setup

### Prerequisites
- **Node.js** 16+ installed
- **MySQL** or **MariaDB** installed and running
- **Git** for version control (optional)

### Backend Setup

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Environment Configuration
The `.env` file is already configured with defaults. Update these values:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=st_patricks_church
DB_PORT=3306

# JWT Secrets (Change in production!)
JWT_SECRET=st_patricks_church_super_secret_jwt_key_2024_makokoba_bulawayo_zimbabwe
JWT_REFRESH_SECRET=st_patricks_church_refresh_token_secret_2024

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### 3. Database Check
```bash
npm run check-db
```
This script will:
- Test MySQL connection
- Check if database exists
- List tables and users
- Provide troubleshooting tips

#### 4. Start Backend Server
```bash
npm run dev
```

The backend will automatically:
- Create the database if it doesn't exist
- Create all 12 required tables
- Insert default data including admin users
- Start the API server on port 5000

### Frontend Setup

#### 1. Install Dependencies
```bash
# From project root directory
npm install
```

#### 2. Environment Configuration
The `.env` file is already configured:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CHURCH_NAME=St. Patrick's Catholic Church
REACT_APP_CHURCH_LOCATION=Makokoba, Bulawayo, Zimbabwe
```

#### 3. Start Frontend
```bash
npm start
```

The frontend will start on http://localhost:3000

## 🗄️ Database Schema

The system automatically creates these tables:

### Core Tables
- **users** - User accounts and authentication
- **categories** - Dynamic categories for content
- **news** - Parish news articles
- **events** - Church events and activities
- **announcements** - Important announcements

### Content Tables
- **gallery** - Photo gallery management
- **ministries** - Church ministries information
- **sacraments** - Sacrament details
- **prayer_intentions** - Prayer requests

### Configuration Tables
- **contact_info** - Church contact information
- **mass_schedule** - Mass times and schedules

### System Tables
- **file_uploads** - File upload tracking
- **analytics** - Website usage analytics

## 👥 Default Users

| Username | Password | Role | Access Level |
|----------|----------|------|-------------|
| admin | admin123 | admin | Full admin access |
| parishioner | parish123 | parishioner | Public website access |

**⚠️ Security Note**: Change these passwords immediately after setup!

## 🎯 Features Overview

### Public Website Features
- **Home Page** with hero slider and church information
- **News & Events** with categorized content
- **Mass Schedule** with multiple languages
- **Gallery** with photo management
- **Contact Information** with office hours
- **Prayer Intentions** submission form
- **Ministries & Sacraments** information

### Admin Dashboard Features
- **Content Management** - News, events, announcements
- **User Management** - Create, edit, delete users
- **Gallery Management** - Upload and organize photos
- **Schedule Management** - Mass times and services
- **Contact Management** - Church information updates
- **Analytics Dashboard** - Website usage statistics
- **Prayer Management** - Approve prayer intentions

### Technical Features
- **Responsive Design** - Mobile, tablet, desktop optimized
- **File Upload System** - Image optimization and thumbnails
- **Search Functionality** - Full-text search across content
- **Role-Based Access** - Different permissions for different users
- **Real-time Updates** - Live data synchronization
- **Security Features** - JWT authentication, input validation

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Content Management
- `GET /api/news` - Get news articles
- `POST /api/news` - Create news article
- `PUT /api/news/:id` - Update news article
- `DELETE /api/news/:id` - Delete news article

### File Uploads
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload` - List uploaded files

### And many more... (See API documentation for complete list)

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-restart
```

### Frontend Development
```bash
npm start    # Starts with hot reload
```

### Database Management
```bash
cd backend
npm run check-db  # Check database status
```

## 🚀 Production Deployment

### 1. Environment Setup
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure production database
- Set up SSL certificates

### 2. Database Security
```sql
-- Create dedicated database user
CREATE USER 'stpatricks'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON st_patricks_church.* TO 'stpatricks'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Build Frontend
```bash
npm run build
```

### 4. Deploy Backend
```bash
cd backend
npm start  # Production server
```

## 🔍 Troubleshooting

### Database Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solutions**:
1. Ensure MySQL/MariaDB is running
2. Check port 3306 is not blocked
3. Verify DB_HOST and DB_PORT in .env

### Access Denied Errors
```
Error: Access denied for user 'root'@'localhost'
```
**Solutions**:
1. Check DB_PASSWORD in .env file
2. Verify MySQL root password
3. Try connecting with MySQL command line

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solutions**:
1. Change PORT in backend/.env
2. Kill process using port 5000
3. Use different port number

### Frontend API Connection
```
Network Error or CORS issues
```
**Solutions**:
1. Ensure backend is running on port 5000
2. Check REACT_APP_API_URL in .env
3. Verify CORS configuration in backend

## 📞 Support

### Quick Commands
```bash
# Check database status
cd backend && npm run check-db

# Reset database (WARNING: Deletes all data)
# In MySQL: DROP DATABASE st_patricks_church;
# Then restart backend server

# View backend logs
cd backend && npm run dev

# Build for production
npm run build
```

### Log Files
- Backend logs: Console output when running `npm run dev`
- Database logs: MySQL error logs
- Frontend logs: Browser developer console

## 🎉 Success!

If everything is working correctly, you should see:
1. ✅ Backend server running on http://localhost:5000
2. ✅ Frontend running on http://localhost:3000
3. ✅ Database connected with all tables created
4. ✅ Default users created and accessible
5. ✅ Admin dashboard functional
6. ✅ Public website displaying content

**Next Steps**:
1. Login with admin credentials
2. Change default passwords
3. Add church information and images
4. Configure mass schedules
5. Start adding news and events

The St. Patrick's Catholic Church website is now ready for use! 🏛️✨
