const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const announcementRoutes = require('./routes/announcements');
const eventRoutes = require('./routes/events');
const galleryRoutes = require('./routes/gallery');
const newsRoutes = require('./routes/news');
const scheduleRoutes = require('./routes/schedule');
const themeRoutes = require('./routes/themes');
const prayerRoutes = require('./routes/prayers');
const ministryRoutes = require('./routes/ministries');
const sacramentRoutes = require('./routes/sacraments');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const priestDeskRoutes = require('./routes/priest-desk');
const financeRoutes = require('./routes/finances');
const categoryRoutes = require('./routes/categories');
const contactRoutes = require('./routes/contact');
const analyticsRoutes = require('./routes/analytics');
const auditLogRoutes = require('./routes/audit-logs');

const liturgicalPrayerRoutes = require('./routes/liturgical-prayers');
const videosRoutes = require('./routes/videos');

const ensureUserProfilesTable = async () => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id VARCHAR(36) PRIMARY KEY,
      association VARCHAR(100),
      section VARCHAR(100),
      is_baptized BOOLEAN,
      baptism_date DATE,
      baptism_venue VARCHAR(255),
      is_confirmed BOOLEAN,
      confirmation_date DATE,
      confirmation_venue VARCHAR(255),
      receives_communion BOOLEAN,
      first_communion_date DATE,
      is_married BOOLEAN,
      marriage_date DATE,
      marriage_venue VARCHAR(255),
      spouse_name VARCHAR(150),
      ordination_date DATE,
      ordination_venue VARCHAR(255),
      ordained_by VARCHAR(150),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await db.execute(createTableSql);
    console.log('✅ Ensured user_profiles table exists');
  } catch (error) {
    console.error('❌ Failed to ensure user_profiles table:', error.message);
  }
};

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

<<<<<<< HEAD
// CORS configuration (must be before rate limiting and other middlewares)
=======
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration - Allow multiple origins including port 3001
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased for development
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // console.log('Headers:', JSON.stringify(req.headers, null, 2)); // Too verbose, let's just log path
  next();
});
app.use(morgan('dev'));

// Static files (with CORS headers to allow canvas screenshot)
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'St. Patrick\'s Church API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Public data endpoints
app.get('/api/associations', async (req, res) => {
  try {
    const [associations] = await db.execute('SELECT * FROM associations WHERE is_active = true ORDER BY name ASC');
    res.json({ success: true, data: { associations } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch associations' });
  }
});

app.get('/api/sections', async (req, res) => {
  try {
    const [sections] = await db.execute('SELECT * FROM sections WHERE is_active = true ORDER BY name ASC');
    res.json({ success: true, data: { sections } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sections' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/ministries', ministryRoutes);
app.use('/api/sacraments', sacramentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/priest-desk', priestDeskRoutes);
app.use('/api/liturgical-prayers', liturgicalPrayerRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/videos', videosRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large'
    });
  }
  
  // PostgreSQL errors
  if (err.code === '23505') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    // Initialize database (create tables if not exist)
    await db.initializeDatabase();
    await db.insertDefaultData();
    console.log('✅ Database initialized and connected successfully');
    
    // Ensure extended profile table exists
    await ensureUserProfilesTable();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
 
