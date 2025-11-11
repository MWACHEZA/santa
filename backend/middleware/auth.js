const jwt = require('jsonwebtoken');
const db = require('../config/database-simple');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const [users] = await db.execute(
      'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Define role-based permissions
const ROLE_PERMISSIONS = {
  admin: ['*'], // Admin has all permissions
  secretary: [
    'announcements',
    'events',
    'contact',
    'theme',
    'mass_schedule',
    'sacraments',
    'prayers',
    'readings'
  ],
  priest: [
    'overview',
    'announcements',
    'events',
    'contact',
    'priest_desk',
    'prayers',
    'readings',
    'analytics',
    'sacraments',
    'prayer_intentions'
  ],
  reporter: [
    'gallery',
    'news',
    'images',
    'analytics',
    'ministries',
    'section_images'
  ]
};

// Check if user has permission
const hasPermission = (userRole, requiredPermission) => {
  if (!userRole) return false;
  if (userRole === 'admin') return true; // Admin has all permissions
  
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(requiredPermission) || permissions.includes('*');
};

// Middleware to check specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Role-based middleware
const requireAdmin = requireRole(['admin']);
const requireSecretary = requireRole(['admin', 'secretary']);
const requirePriest = requireRole(['admin', 'priest']);
const requireReporter = requireRole(['admin', 'reporter']);

// Permission-based middleware
const requireContentManager = requirePermission('content_management');
const requireNewsCreator = requirePermission('news_create');

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await db.execute(
      'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length > 0 && users[0].is_active) {
      req.user = users[0];
    } else {
      req.user = null;
    }
    
    next();
    
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSecretary,
  requirePriest,
  requireReporter,
  requireContentManager,
  requireNewsCreator,
  optionalAuth,
  hasPermission,
  ROLE_PERMISSIONS
};
