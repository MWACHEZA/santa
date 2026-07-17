const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const db = require('./config/database-simple');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const announcementRoutes = require('./routes/announcements');
const eventRoutes = require('./routes/events');
const galleryRoutes = require('./routes/gallery');
const newsRoutes = require('./routes/news');
const contactRoutes = require('./routes/contact');
const scheduleRoutes = require('./routes/schedule');
const prayerRoutes = require('./routes/prayers');
const ministryRoutes = require('./routes/ministries');
const sacramentRoutes = require('./routes/sacraments');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/upload');
const analyticsRoutes = require('./routes/analytics');
const themeRoutes = require('./routes/themes');
const financeRoutes = require('./routes/finances');
const liturgicalPrayerRoutes = require('./routes/liturgical-prayers');
const priestDeskRoutes = require('./routes/priest-desk');
const auditLogRoutes = require('./routes/audit-logs');
const videoRoutes = require('./routes/videos');

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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
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

// Enable trust proxy for correct client IP detection behind reverse proxies like Render
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - increased to 1000 for high-activity frontend sync
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
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

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow any onrender.com subdomain or allowed local/configured origins
    if (origin.includes('onrender.com') || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-access-token']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'St. Patrick\'s Church API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
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
app.use('/api/prayers', prayerRoutes);
app.use('/api/ministries', ministryRoutes);
app.use('/api/sacraments', sacramentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/liturgical-prayers', liturgicalPrayerRoutes);
app.use('/api/priest-desk', priestDeskRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/videos', videoRoutes);

// 404 handler
app.use('*', (req, res) => {
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
  
  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
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
  // ── DB Connection with Retry ───────────────────────────────────────────────
  // Render's free PostgreSQL can take up to 30s to accept connections after
  // a cold start. We retry up to 10 times (5s apart = 50s total) before giving up.
  const MAX_RETRIES = 10;
  const RETRY_DELAY_MS = 5000;

  let connected = false;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔌 DB connection attempt ${attempt}/${MAX_RETRIES}...`);
      await db.execute('SELECT 1');
      console.log('✅ Database connected successfully');
      connected = true;
      break;
    } catch (err) {
      console.warn(`⚠️  DB attempt ${attempt} failed: ${err.message || err}`);
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  if (!connected) {
    console.error('❌ Could not connect to database after all retries. Exiting.');
    process.exit(1);
  }
  // ──────────────────────────────────────────────────────────────────────────

  try {
    // Initialize full database schema and seed default data automatically
    const dbFull = require('./config/database');
    console.log('🔄 Initializing database schema...');
    await dbFull.initializeDatabase();
    console.log('🌱 Seeding default categories and users...');
    await dbFull.insertDefaultData();

    // Ensure extended profile table exists
    await ensureUserProfilesTable();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);

      // ── Keep-Alive Self-Ping ──────────────────────────────────────────────
      // Render.com free tier sleeps after 15 minutes of inactivity.
      // We ping our own /health endpoint every 14 minutes to stay awake.
      if (process.env.NODE_ENV === 'production') {
        const https = require('https');
        const SELF_URL = process.env.RENDER_EXTERNAL_URL || process.env.REACT_APP_API_URL || `https://st-patricks-makokoba.onrender.com`;
        const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

        const pingself = () => {
          https.get(`${SELF_URL}/health`, (res) => {
            console.log(`🏓 Keep-alive ping: ${res.statusCode}`);
          }).on('error', (err) => {
            console.warn('⚠️ Keep-alive ping failed:', err.message);
          });
        };

        // Start pinging after 1 minute (give DB time to fully init)
        setTimeout(() => {
          pingself();
          setInterval(pingself, PING_INTERVAL_MS);
        }, 60 * 1000);

        console.log(`🏓 Keep-alive self-ping enabled (every 14 minutes)`);
      }
      // ─────────────────────────────────────────────────────────────────────
    });
  } catch (error) {
    console.error('❌ Failed to initialise server after DB connected:', error);
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
