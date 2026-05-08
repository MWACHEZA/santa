const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /audit-logs
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      userId, 
      entityType, 
      action,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (userId) {
      whereClause += ' AND a.user_id = ?';
      params.push(userId);
    }
    
    if (entityType) {
      whereClause += ' AND a.entity_type = ?';
      params.push(entityType);
    }
    
    if (action) {
      whereClause += ' AND a.action = ?';
      params.push(action);
    }
    
    if (search) {
      whereClause += ' AND (a.details ILIKE ? OR a.action ILIKE ? OR u.username ILIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const query = `
      SELECT a.*, u.username, u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [logs] = await db.execute(query, [...params, parseInt(limit), offset]);
    
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total 
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
    `, params);
    
    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages
        }
      }
    });
    
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

// GET /audit-logs/stats/overview
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as active_admins,
        SUM(CASE WHEN created_at >= (NOW() - INTERVAL '24 hours') THEN 1 ELSE 0 END) as logs_last_24h,
        SUM(CASE WHEN action = 'LOGIN' THEN 1 ELSE 0 END) as total_logins
      FROM audit_logs
    `);
    
    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics'
    });
  }
});

// POST /audit-logs
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { action, entityType, entityId, details } = req.body;
    
    const { logAction } = require('../utils/logger');
    await logAction({
      userId: req.user.id,
      action,
      entityType,
      entityId,
      details,
      ipAddress: req.ip
    });
    
    res.status(201).json({ success: true, message: 'Log created successfully' });
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({ success: false, message: 'Failed to create audit log' });
  }
});

module.exports = router;
