const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireContentManager, optionalAuth } = require('../middleware/auth');
const { 
  validateAnnouncement, 
  validateId, 
  validatePagination, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all announcements (public endpoint with optional auth)
router.get('/', optionalAuth, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const type = req.query.type;
    const isActive = req.query.active !== 'false'; // Default to active only
    
    let whereConditions = [];
    let queryParams = [];
    
    // For non-authenticated users, only show active announcements within date range
    if (!req.user || req.user.role === 'parishioner') {
      whereConditions.push('is_active = true');
      whereConditions.push('(start_date IS NULL OR start_date <= CURDATE())');
      whereConditions.push('(end_date IS NULL OR end_date >= CURDATE())');
    } else if (isActive) {
      whereConditions.push('is_active = ?');
      queryParams.push(true);
    }
    
    if (type) {
      whereConditions.push('type = ?');
      queryParams.push(type);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM announcements ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get announcements with pagination
    const announcementsQuery = `
      SELECT 
        a.id,
        a.title,
        a.content,
        a.type,
        a.is_active,
        a.start_date,
        a.end_date,
        a.created_at,
        a.updated_at,
        u.username as created_by_username
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ${whereClause}
      ORDER BY 
        CASE a.type 
          WHEN 'urgent' THEN 1 
          WHEN 'event' THEN 2 
          WHEN 'mass' THEN 3 
          ELSE 4 
        END,
        a.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [announcements] = await db.execute(announcementsQuery, [...queryParams, limit, offset]);
    
    res.json({
      success: true,
      data: {
        announcements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements'
    });
  }
});

// Get active announcements (public endpoint)
router.get('/active', async (req, res) => {
  try {
    const [announcements] = await db.execute(`
      SELECT 
        id,
        title,
        content,
        type,
        start_date,
        end_date,
        created_at
      FROM announcements
      WHERE is_active = true
        AND (start_date IS NULL OR start_date <= CURDATE())
        AND (end_date IS NULL OR end_date >= CURDATE())
      ORDER BY 
        CASE type 
          WHEN 'urgent' THEN 1 
          WHEN 'event' THEN 2 
          WHEN 'mass' THEN 3 
          ELSE 4 
        END,
        created_at DESC
      LIMIT 5
    `);
    
    res.json({
      success: true,
      data: {
        announcements
      }
    });
    
  } catch (error) {
    console.error('Get active announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active announcements'
    });
  }
});

// Get single announcement
router.get('/:id', optionalAuth, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    let whereCondition = 'a.id = ?';
    const queryParams = [id];
    
    // For non-authenticated users, only show active announcements within date range
    if (!req.user || req.user.role === 'parishioner') {
      whereCondition += ` AND a.is_active = true 
                         AND (a.start_date IS NULL OR a.start_date <= CURDATE())
                         AND (a.end_date IS NULL OR a.end_date >= CURDATE())`;
    }
    
    const [announcements] = await db.execute(`
      SELECT 
        a.id,
        a.title,
        a.content,
        a.type,
        a.is_active,
        a.start_date,
        a.end_date,
        a.created_at,
        a.updated_at,
        u.username as created_by_username
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE ${whereCondition}
    `, queryParams);
    
    if (announcements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        announcement: announcements[0]
      }
    });
    
  } catch (error) {
    console.error('Get announcement by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcement'
    });
  }
});

// Create announcement
router.post('/', authenticateToken, requireContentManager, validateAnnouncement, handleValidationErrors, async (req, res) => {
  try {
    const {
      title,
      content,
      type = 'general',
      is_active = true,
      start_date,
      end_date
    } = req.body;
    
    // Validate date range
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }
    
    const announcementId = uuidv4();
    
    await db.execute(`
      INSERT INTO announcements (
        id, title, content, type, is_active, start_date, end_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      announcementId, title, content, type, is_active, 
      start_date || null, end_date || null, req.user.id
    ]);
    
    // Get created announcement
    const [createdAnnouncement] = await db.execute(`
      SELECT 
        a.id,
        a.title,
        a.content,
        a.type,
        a.is_active,
        a.start_date,
        a.end_date,
        a.created_at,
        u.username as created_by_username
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = ?
    `, [announcementId]);
    
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: {
        announcement: createdAnnouncement[0]
      }
    });
    
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement'
    });
  }
});

// Update announcement
router.put('/:id', authenticateToken, requireContentManager, validateId, validateAnnouncement, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      type,
      is_active,
      start_date,
      end_date
    } = req.body;
    
    // Check if announcement exists
    const [existingAnnouncements] = await db.execute('SELECT id FROM announcements WHERE id = ?', [id]);
    
    if (existingAnnouncements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    // Validate date range
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }
    
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (content !== undefined) { updates.push('content = ?'); values.push(content); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    if (start_date !== undefined) { updates.push('start_date = ?'); values.push(start_date || null); }
    if (end_date !== undefined) { updates.push('end_date = ?'); values.push(end_date || null); }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    values.push(id);
    
    await db.execute(
      `UPDATE announcements SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Get updated announcement
    const [updatedAnnouncement] = await db.execute(`
      SELECT 
        a.id,
        a.title,
        a.content,
        a.type,
        a.is_active,
        a.start_date,
        a.end_date,
        a.created_at,
        a.updated_at,
        u.username as created_by_username
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: {
        announcement: updatedAnnouncement[0]
      }
    });
    
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement'
    });
  }
});

// Delete announcement
router.delete('/:id', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if announcement exists
    const [existingAnnouncements] = await db.execute('SELECT id FROM announcements WHERE id = ?', [id]);
    
    if (existingAnnouncements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    // Delete the announcement
    await db.execute('DELETE FROM announcements WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement'
    });
  }
});

// Toggle announcement status
router.patch('/:id/toggle', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current status
    const [announcements] = await db.execute(
      'SELECT id, is_active FROM announcements WHERE id = ?',
      [id]
    );
    
    if (announcements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    const newStatus = !announcements[0].is_active;
    
    // Update status
    await db.execute(
      'UPDATE announcements SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({
      success: true,
      message: `Announcement ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: {
        is_active: newStatus
      }
    });
    
  } catch (error) {
    console.error('Toggle announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle announcement status'
    });
  }
});

// Get announcements by type
router.get('/type/:type', optionalAuth, async (req, res) => {
  try {
    const { type } = req.params;
    
    const validTypes = ['general', 'urgent', 'event', 'mass'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement type'
      });
    }
    
    let whereCondition = 'type = ?';
    const queryParams = [type];
    
    // For non-authenticated users, only show active announcements within date range
    if (!req.user || req.user.role === 'parishioner') {
      whereCondition += ` AND is_active = true 
                         AND (start_date IS NULL OR start_date <= CURDATE())
                         AND (end_date IS NULL OR end_date >= CURDATE())`;
    }
    
    const [announcements] = await db.execute(`
      SELECT 
        id,
        title,
        content,
        type,
        is_active,
        start_date,
        end_date,
        created_at
      FROM announcements
      WHERE ${whereCondition}
      ORDER BY created_at DESC
      LIMIT 10
    `, queryParams);
    
    res.json({
      success: true,
      data: {
        announcements
      }
    });
    
  } catch (error) {
    console.error('Get announcements by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements'
    });
  }
});

// Get announcement statistics (admin only)
router.get('/stats/overview', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_announcements,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_announcements,
        SUM(CASE WHEN is_active = true 
                 AND (start_date IS NULL OR start_date <= CURDATE())
                 AND (end_date IS NULL OR end_date >= CURDATE()) 
            THEN 1 ELSE 0 END) as current_announcements,
        SUM(CASE WHEN type = 'urgent' AND is_active = true THEN 1 ELSE 0 END) as urgent_announcements
      FROM announcements
    `);
    
    // Get announcements by type
    const [typeStats] = await db.execute(`
      SELECT 
        type,
        COUNT(*) as total,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active
      FROM announcements
      GROUP BY type
      ORDER BY total DESC
    `);
    
    // Get recent activity
    const [recentActivity] = await db.execute(`
      SELECT 
        a.id,
        a.title,
        a.type,
        a.is_active,
        a.created_at,
        a.updated_at,
        u.username as created_by_username,
        CASE 
          WHEN a.created_at = a.updated_at THEN 'created'
          ELSE 'updated'
        END as action
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.updated_at DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats[0],
        typeStats,
        recentActivity
      }
    });
    
  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcement statistics'
    });
  }
});

module.exports = router;
