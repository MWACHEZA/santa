# 🏛️ St. Patrick's Catholic Church Management System

A comprehensive, modern web application for managing all aspects of parish life, built with React, Node.js, and MySQL.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 🌟 Features

### 👥 **User Management**
- **Role-based access control** (Admin, Priest, Secretary, Reporter, Parishioner)
- **Modern authentication** with secure password handling
- **User profiles** with comprehensive information
- **Session management** with JWT tokens

### 📱 **Modern UI/UX**
- **Figma-inspired design** with modern components
- **Responsive layout** for all devices
- **Side navigation menu** for better space utilization
- **Dark/light theme support**
- **Multi-language support** (English, Ndebele, Shona)

### 📊 **Content Management**
- **News and announcements** with rich text editor
- **Event calendar** with recurring events
- **Photo/video gallery** with categorization
- **Prayer intentions** management
- **Daily readings** and spiritual content

### 💒 **Parish Operations**
- **Sacrament management** (Baptism, Confirmation, Marriage, etc.)
- **Ministry coordination** with member tracking
- **Financial management** with donation tracking
- **Mass schedule** management
- **Communication system** with messaging

### 📁 **Media Management**
- **File upload system** supporting images, videos, audio, documents
- **Automatic image optimization** and thumbnail generation
- **Video processing** with thumbnail extraction
- **Cloud storage integration** (optional)
- **Media categorization** and search

### 📈 **Analytics & Reporting**
- **User demographics** with visual charts
- **Attendance tracking** for events and masses
- **Financial reports** with donation analytics
- **Export capabilities** (PDF, CSV, Excel)

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/st-patricks-makokoba.git
   cd st-patricks-makokoba
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   ```

3. **Set up the database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE st_patricks_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   
   # Import the comprehensive schema
   mysql -u root -p st_patricks_db < comprehensive-database-schema.sql
   ```

4. **Configure environment variables**
   ```bash
   # Backend configuration
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials and settings
   
   # Frontend configuration
   cd ..
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

5. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   cd backend
   npm run dev
   
   # Start frontend (from root directory, new terminal)
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Default Login Credentials
- **Admin**: username: `admin`, password: `admin123`
- **Priest**: username: `priest`, password: `priest123`
- **Parishioner**: username: `parishioner`, password: `parish123`

**⚠️ Change these passwords immediately after setup!**

## 🏗️ Architecture

### Frontend (React)
```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   │   ├── ModernLogin.tsx
│   │   ├── ModernRegister.tsx
│   │   └── ModernAuth.css
│   ├── admin/           # Admin-specific components
│   ├── common/          # Shared components
│   └── Header.tsx       # Main navigation header
├── contexts/            # React contexts for state management
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── styles/             # Global styles
```

### Backend (Node.js/Express)
```
backend/
├── config/             # Configuration files
├── controllers/        # Request handlers
├── middleware/         # Custom middleware
│   └── mediaStorage.js # File upload handling
├── models/             # Database models
├── routes/             # API routes
├── uploads/            # File storage directory
├── utils/              # Utility functions
└── server.js           # Main server file
```

### Database (MySQL)
- **26+ tables** covering all parish operations
- **Comprehensive relationships** with foreign keys
- **Optimized indexes** for performance
- **Role-based permissions** built into schema

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=st_patricks_db

# Application Settings
NODE_ENV=development
PORT=3001
JWT_SECRET=your_jwt_secret_minimum_32_characters
BCRYPT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Settings
MAX_FILE_SIZE=52428800  # 50MB
UPLOAD_PATH=./uploads

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@stpatricks.com
```

#### Frontend (.env.local)
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
```

## 📦 Deployment

### Docker Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy using Docker**
   - Build and run with Docker:
   ```bash
   docker build -t st-patricks-app .
   docker run -p 3000:3000 -p 3001:3001 st-patricks-app
   ```
   - Or use Docker Compose: `docker-compose up -d`

3. **Configure Environment Variables**
   - Set database credentials
   - Configure email settings
   - Set JWT secret

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Manual Server Deployment

See the comprehensive [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for:
- VPS/Dedicated server setup
- Nginx configuration
- SSL certificate setup
- PM2 process management
- Database optimization
- Security hardening

## 🎨 UI Components

### Modern Authentication
- **Multi-step registration** with progress indicators
- **Password strength meter** with real-time validation
- **Multiple login methods** (email, phone, username)
- **Enhanced security** with proper password visibility toggle

### Navigation
- **Side navigation menu** for better space utilization
- **Responsive design** that works on all devices
- **Role-based menu items** showing only relevant options
- **Smooth animations** and transitions

### Forms and Inputs
- **Modern form styling** with Figma-inspired design
- **Real-time validation** with helpful error messages
- **File upload with drag & drop** support
- **Rich text editors** for content creation

## 🔐 Security Features

### Authentication & Authorization
- **JWT-based authentication** with secure token handling
- **Role-based access control** with granular permissions
- **Password hashing** using bcrypt with configurable rounds
- **Session management** with automatic expiry

### Data Protection
- **SQL injection prevention** using parameterized queries
- **XSS protection** with input sanitization
- **CSRF protection** with token validation
- **File upload security** with type and size validation

### Infrastructure Security
- **HTTPS enforcement** in production
- **Security headers** (HSTS, CSP, etc.)
- **Rate limiting** to prevent abuse
- **Input validation** at multiple layers

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
GET  /api/auth/profile        # Get user profile
PUT  /api/auth/profile        # Update user profile
```

### Content Management
```
GET    /api/news              # Get news articles
POST   /api/news              # Create news article
PUT    /api/news/:id          # Update news article
DELETE /api/news/:id          # Delete news article

GET    /api/events            # Get events
POST   /api/events            # Create event
PUT    /api/events/:id        # Update event
DELETE /api/events/:id        # Delete event

GET    /api/prayers           # Get prayers
POST   /api/prayers           # Create prayer
PUT    /api/prayers/:id       # Update prayer
DELETE /api/prayers/:id       # Delete prayer
```

### Media Management
```
POST   /api/media/upload      # Upload files
GET    /api/media             # Get media files
GET    /api/media/:id         # Get specific file
PUT    /api/media/:id         # Update file metadata
DELETE /api/media/:id         # Delete file
```

### User Management
```
GET    /api/users             # Get users (admin only)
POST   /api/users             # Create user (admin only)
PUT    /api/users/:id         # Update user
DELETE /api/users/:id         # Delete user (admin only)
```

### Parish Operations
```
GET    /api/sacraments        # Get sacrament records
POST   /api/sacraments        # Request sacrament
PUT    /api/sacraments/:id    # Update sacrament record

GET    /api/donations         # Get donation records
POST   /api/donations         # Record donation

GET    /api/ministries        # Get ministries
POST   /api/ministries        # Create ministry
```

## 🛠️ Development

### Project Structure
```
st-patricks-makokoba/
├── backend/                          # Backend API
│   ├── config/
│   │   ├── database.js              # Database configuration
│   │   └── auth.js                  # Authentication config
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── newsController.js        # News management
│   │   ├── eventController.js       # Event management
│   │   └── mediaController.js       # Media handling
│   ├── middleware/
│   │   ├── auth.js                  # Authentication middleware
│   │   ├── validation.js            # Input validation
│   │   └── mediaStorage.js          # File upload handling
│   ├── models/
│   │   ├── User.js                  # User model
│   │   ├── News.js                  # News model
│   │   └── Event.js                 # Event model
│   ├── routes/
│   │   ├── auth.js                  # Authentication routes
│   │   ├── news.js                  # News routes
│   │   ├── events.js                # Event routes
│   │   └── media.js                 # Media routes
│   ├── uploads/                     # File storage
│   ├── comprehensive-database-schema.sql  # Database schema
│   ├── package.json
│   └── server.js                    # Main server file
├── src/                             # Frontend React app
│   ├── components/
│   │   ├── auth/
│   │   │   ├── ModernLogin.tsx      # Modern login form
│   │   │   ├── ModernRegister.tsx   # Modern registration form
│   │   │   └── ModernAuth.css       # Modern auth styles
│   │   ├── admin/                   # Admin components
│   │   ├── common/                  # Shared components
│   │   └── Header.tsx               # Navigation header
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Authentication context
│   │   └── LanguageContext.tsx      # Language context
│   ├── pages/                       # Page components
│   ├── hooks/                       # Custom hooks
│   ├── utils/                       # Utility functions
│   └── styles/                      # Global styles
├── public/                          # Static assets
├── Dockerfile                       # Docker container config
├── docker-compose.yml               # Docker Compose config
├── DEPLOYMENT_GUIDE.md              # Deployment instructions
├── package.json                     # Frontend dependencies
└── README.md                        # This file
```

### Development Workflow

1. **Feature Development**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature
   
   # Make changes and test
   npm test
   
   # Commit changes
   git add .
   git commit -m "Add new feature"
   
   # Push and create PR
   git push origin feature/new-feature
   ```

2. **Testing**
   ```bash
   # Run frontend tests
   npm test
   
   # Run backend tests
   cd backend
   npm test
   
   # Run integration tests
   npm run test:integration
   ```

3. **Code Quality**
   ```bash
   # Lint code
   npm run lint
   
   # Format code
   npm run format
   
   # Type checking
   npm run type-check
   ```

### Database Management

#### Schema Updates
```bash
# Create migration
cd backend
npm run migration:create add_new_table

# Run migrations
npm run migration:run

# Rollback migration
npm run migration:rollback
```

#### Backup and Restore
```bash
# Backup database
mysqldump -u root -p st_patricks_db > backup.sql

# Restore database
mysql -u root -p st_patricks_db < backup.sql
```

## 🧪 Testing

### Frontend Testing
```bash
# Unit tests
npm test

# Component tests
npm run test:components

# E2E tests
npm run test:e2e
```

### Backend Testing
```bash
cd backend

# Unit tests
npm test

# API tests
npm run test:api

# Database tests
npm run test:db
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 🔍 Monitoring

### Health Checks
- **API Health**: `/api/health`
- **Database Health**: `/api/health/db`
- **File System Health**: `/api/health/storage`

### Logging
- **Application logs**: PM2 logs or console output
- **Access logs**: Nginx access logs
- **Error logs**: Application error logs with stack traces

### Performance Monitoring
- **Response times**: API endpoint performance
- **Database queries**: Slow query monitoring
- **File uploads**: Upload success/failure rates
- **User activity**: Login/logout tracking

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- **ESLint** for JavaScript/TypeScript linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Jest** for testing
- **Conventional Commits** for commit messages

### Pull Request Process
1. Update documentation if needed
2. Add tests for new features
3. Ensure CI/CD pipeline passes
4. Request review from maintainers
5. Address feedback and merge

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **St. Patrick's Catholic Church, Makokoba** for the inspiration and requirements
- **React Team** for the excellent frontend framework
- **Node.js Community** for the robust backend platform
- **MySQL Team** for the reliable database system
- **Docker Community** for the excellent containerization platform

## 📞 Support

### Documentation
- **Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **API Documentation**: Available at `/api/docs` when running
- **User Manual**: Available in the application help section

### Getting Help
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team at dev@stpatricks.com
- **Community**: Join our Discord server for real-time help

### Reporting Issues
When reporting issues, please include:
- **Environment details** (OS, Node.js version, browser)
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** or error messages if applicable
- **Log files** if relevant

## 🗺️ Roadmap

### Version 2.1 (Planned)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Integration with payment gateways
- [ ] Multi-parish support

### Version 2.2 (Future)
- [ ] AI-powered content recommendations
- [ ] Advanced reporting with charts
- [ ] Integration with church management systems
- [ ] Automated backup system
- [ ] Advanced user permissions

### Long-term Goals
- [ ] Offline functionality
- [ ] Multi-language content management
- [ ] Integration with social media platforms
- [ ] Advanced security features
- [ ] Performance optimizations

---

**🎉 Thank you for using St. Patrick's Catholic Church Management System!**

This system is designed to serve the spiritual and administrative needs of our parish community. We hope it helps strengthen our bonds of faith and fellowship.

*"For where two or three gather in my name, there am I with them." - Matthew 18:20*
