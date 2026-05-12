const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { logAction } = require('../utils/logger');
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
      whereConditions.push('a.is_active = true');
      whereConditions.push('(a.start_date IS NULL OR a.start_date <= CURRENT_DATE)');
      whereConditions.push('(a.end_date IS NULL OR a.end_date >= CURRENT_DATE)');
    } else if (isActive) {
      whereConditions.push('a.is_active = ?');
      queryParams.push(true);
    }
    
    if (type) {
      whereConditions.push('type = ?');
      queryParams.push(type);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM announcements a ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = parseInt(countResult[0].total);
    
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
        AND (start_date IS NULL OR start_date <= CURRENT_DATE)
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
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
    
    const announcementId = uuidv4();
    
    await db.execute(`
      INSERT INTO announcements (
        id, title, content, type, is_active, start_date, end_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      announcementId, title, content, type, is_active, 
      start_date || null, end_date || null, req.user.id
    ]);
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'CREATE_ANNOUNCEMENT',
      entityType: 'announcement',
      entityId: announcementId,
      details: `Created announcement: ${title}`,
      ipAddress: req.ip
    });

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
    
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (content !== undefined) { 
      updates.push('content = ?'); values.push(content);
    }
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
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'UPDATE_ANNOUNCEMENT',
      entityType: 'announcement',
      entityId: id,
      details: `Updated announcement: ${title || id}`,
      ipAddress: req.ip
    });

    // Get updated announcement
    const [updatedAnnouncement] = await db.execute(`
      SELECT 
        a.id, a.title, a.content, a.type, a.is_active,
        a.start_date, a.end_date, a.created_at, a.updated_at,
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
    
    // Log action before deletion
    await logAction({
      userId: req.user.id,
      action: 'DELETE_ANNOUNCEMENT',
      entityType: 'announcement',
      entityId: id,
      details: `Deleted announcement ID: ${id}`,
      ipAddress: req.ip
    });

    await db.execute('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete announcement' });
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
                 AND (start_date IS NULL OR start_date <= CURRENT_DATE)
                 AND (end_date IS NULL OR end_date >= CURRENT_DATE) 
            THEN 1 ELSE 0 END) as current_announcements,
        SUM(CASE WHEN type = 'urgent' AND is_active = true THEN 1 ELSE 0 END) as urgent_announcements
      FROM announcements
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats[0]
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
