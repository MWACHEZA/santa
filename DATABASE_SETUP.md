# Database Setup Guide for St. Patrick's Catholic Church Website

## 🗄️ Database Requirements

The backend requires MySQL or MariaDB to store all website data. Follow these steps to set up the database:

## 📥 Installation Options

### Option 1: XAMPP (Recommended for Development)
1. **Download XAMPP** from https://www.apachefriends.org/
2. **Install XAMPP** with MySQL/MariaDB component
3. **Start XAMPP Control Panel**
4. **Start MySQL** service from the control panel
5. **Access phpMyAdmin** at http://localhost/phpmyadmin (optional)

### Option 2: Standalone MySQL
1. **Download MySQL** from https://dev.mysql.com/downloads/mysql/
2. **Install MySQL Server** with default settings
3. **Set root password** during installation
4. **Start MySQL service**

### Option 3: MariaDB
1. **Download MariaDB** from https://mariadb.org/download/
2. **Install MariaDB Server**
3. **Set root password** during installation
4. **Start MariaDB service**

## ⚙️ Configuration

### 1. Update Backend Environment Variables
Edit the `.env` file in the `backend` folder:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=st_patricks_church
DB_PORT=3307
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL root password.

### 2. Test Database Connection
The backend will automatically:
- Create the database if it doesn't exist
- Create all required tables
- Insert default data including admin user

## 🚀 Starting the System

### 1. Start Database Server
- **XAMPP:** Start MySQL from XAMPP Control Panel
- **Standalone:** Ensure MySQL/MariaDB service is running

### 2. Start Backend Server
```bash
cd backend
npm install
npm run dev
```

### 3. Start Frontend
```bash
cd ..
npm start
```

## 📊 Database Schema

The system automatically creates these tables:

### Core Tables
- **users** - User accounts and authentication
- **categories** - Dynamic categories for content
- **news** - Parish news articles
- **events** - Church events and activities
- **announcements** - Important announcements
- **gallery** - Photo gallery management

### Configuration Tables
- **contact_info** - Church contact information
- **mass_schedule** - Mass times and schedules
- **ministries** - Church ministries
- **sacraments** - Sacrament information
- **prayer_intentions** - Prayer requests

### System Tables
- **file_uploads** - File upload tracking
- **analytics** - Website usage analytics

## 👤 Default Users

The system creates these default users:

| Username | Password | Role | Access |
|----------|----------|------|--------|
| admin | admin123 | admin | Full admin access |
| parishioner | parish123 | parishioner | Public website access |

**Security Note:** Change these passwords immediately after setup!

## 🔧 Troubleshooting

### Connection Refused Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Ensure MySQL/MariaDB is running on port 3306

### Access Denied Error
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** Check your DB_PASSWORD in the .env file

### Database Creation Error
```
Error: Can't create database 'st_patricks_church'
```
**Solution:** Ensure the MySQL user has CREATE privileges

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change the PORT in .env file or stop other services using port 5000

## 🛡️ Security Considerations

### Production Setup
1. **Create dedicated database user** (don't use root)
2. **Use strong passwords** for all accounts
3. **Enable SSL/TLS** for database connections
4. **Regular backups** of the database
5. **Update default user passwords**

### Database User Creation (Production)
```sql
CREATE USER 'stpatricks'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON st_patricks_church.* TO 'stpatricks'@'localhost';
FLUSH PRIVILEGES;
```

Then update your .env:
```env
DB_USER=stpatricks
DB_PASSWORD=strong_password_here
```

## 📱 Accessing the Application

Once everything is running:

1. **Frontend:** http://localhost:3000
2. **Backend API:** http://localhost:5000/api
3. **Health Check:** http://localhost:5000/health
4. **phpMyAdmin:** http://localhost/phpmyadmin (if using XAMPP)

## 🔄 Data Management

### Backup Database
```bash
mysqldump -u root -p st_patricks_church > backup.sql
```

### Restore Database
```bash
mysql -u root -p st_patricks_church < backup.sql
```

### Reset Database
The backend will recreate all tables if you delete the database:
```sql
DROP DATABASE st_patricks_church;
```
Then restart the backend server.

## 📞 Support

If you encounter issues:
1. Check that MySQL/MariaDB is running
2. Verify .env configuration
3. Check backend console for error messages
4. Ensure ports 3000 and 5000 are available
5. Try restarting both database and backend services

## 🎯 Next Steps

After successful setup:
1. Login with admin credentials
2. Change default passwords
3. Add church information
4. Upload church logo and images
5. Configure mass schedules
6. Add parish news and events

The system is now ready for use!
