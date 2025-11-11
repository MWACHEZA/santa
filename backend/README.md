# St. Patrick's Catholic Church - Backend API

A comprehensive Node.js backend API for the St. Patrick's Catholic Church website management system.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **News Management**: Full CRUD operations for parish news with categories and archiving
- **File Upload System**: Image optimization, thumbnail generation, and file management
- **User Management**: Admin panel for managing users and roles
- **Category System**: Dynamic category management for news, events, and other content
- **Database Integration**: MySQL/MariaDB with connection pooling
- **Security**: Rate limiting, input validation, and secure file uploads
- **Analytics**: Basic analytics tracking for website usage

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL or MariaDB database
- npm or yarn package manager

## 🛠️ Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=st_patricks_church
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Set up MySQL/MariaDB database**:
   - Create a new database named `st_patricks_db`
   - The application will automatically create tables and insert default data

5. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 🗄️ Database Schema

The application automatically creates the following tables:

### Core Tables
- **users**: User accounts with role-based access
- **categories**: Dynamic categories for content organization
- **news**: Parish news articles with publishing and archiving
- **events**: Church events and activities
- **announcements**: Important announcements
- **gallery**: Photo gallery management
- **file_uploads**: File upload tracking and management

### Configuration Tables
- **contact_info**: Church contact information
- **mass_schedule**: Mass times and schedules
- **ministries**: Church ministries information
- **sacraments**: Sacrament information and requirements
- **prayer_intentions**: Prayer request management

### Analytics Tables
- **analytics**: Website usage tracking

## 🔐 Authentication & Authorization

### User Roles
- **admin**: Full system access
- **priest**: Content management and spiritual oversight
- **secretary**: Administrative content management
- **reporter**: News and event creation
- **vice_secretary**: Limited administrative access
- **parishioner**: Basic user access

### Default Users
The system creates default users on first run:
- **Admin**: username: `admin`, password: `admin123`
- **Parishioner**: username: `parishioner`, password: `parish123`

### JWT Tokens
- Access tokens expire in 7 days (configurable)
- Refresh tokens expire in 30 days (configurable)
- Tokens include user ID and are verified on each request

## 📡 API Endpoints

### Authentication
```
POST /api/auth/login          - User login
POST /api/auth/register       - Register new user (admin only)
POST /api/auth/refresh        - Refresh access token
GET  /api/auth/profile        - Get user profile
PUT  /api/auth/profile        - Update user profile
PUT  /api/auth/change-password - Change password
POST /api/auth/logout         - Logout user
GET  /api/auth/verify         - Verify token validity
```

### News Management
```
GET    /api/news              - Get all news (with filtering)
GET    /api/news/:id          - Get single news article
POST   /api/news              - Create news article
PUT    /api/news/:id          - Update news article
DELETE /api/news/:id          - Delete news article
PATCH  /api/news/:id/archive  - Archive news article
PATCH  /api/news/:id/unarchive - Unarchive news article
GET    /api/news/stats/overview - Get news statistics
```

### File Upload
```
POST   /api/upload/single     - Upload single file
POST   /api/upload/multiple   - Upload multiple files
GET    /api/upload            - Get uploaded files
GET    /api/upload/:id        - Get file info
DELETE /api/upload/:id        - Delete uploaded file
```

### Categories
```
GET    /api/categories        - Get all categories
POST   /api/categories        - Create category
PUT    /api/categories/:id    - Update category
DELETE /api/categories/:id    - Delete category
```

## 📁 File Upload System

### Supported File Types
- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX

### Image Processing
- Automatic optimization and compression
- Thumbnail generation (300x200px)
- Progressive JPEG encoding
- Maximum resolution: 1920x1080px

### File Organization
```
uploads/
├── news/           # News article images
├── events/         # Event images
├── gallery/        # Gallery images
├── documents/      # Document uploads
└── general/        # General uploads
```

## 🔒 Security Features

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable limits for different endpoints

### Input Validation
- Comprehensive validation using express-validator
- SQL injection prevention
- XSS protection through input sanitization

### File Upload Security
- File type validation
- File size limits (10MB default)
- Secure file naming with UUIDs
- Image processing to remove EXIF data

### Password Security
- bcrypt hashing with configurable rounds (12 default)
- Password strength requirements
- Secure password reset functionality

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📝 Development

### Adding New Routes
1. Create route file in `routes/` directory
2. Add validation middleware
3. Implement authentication/authorization
4. Add route to `server.js`

### Database Migrations
The application uses direct SQL for database operations. To add new tables or modify existing ones:
1. Update `config/database.js`
2. Add migration logic to `initializeDatabase()` function

### Environment Variables
All configuration is handled through environment variables. See `.env.example` for all available options.

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up reverse proxy (nginx recommended)
4. Configure SSL certificates
5. Set up database backups
6. Configure monitoring and logging

### PM2 Configuration
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "st-patricks-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 📞 Support

For technical support or questions about the API, please contact the development team.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
