const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { logAction } = require('../utils/logger');
const { authenticateToken, requireContentManager, optionalAuth } = require('../middleware/auth');
const { 
  validateId, 
  validatePagination, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all liturgical prayers (public endpoint with optional auth)
router.get('/', optionalAuth, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const isActive = req.query.active !== 'false';
    const category = req.query.category;
    
    let whereConditions = [];
    let queryParams = [];
    
    // For non-authenticated users, only show published prayers
    if (!req.user || req.user.role === 'parishioner') {
      whereConditions.push('is_published = true');
    } else if (isActive) {
      whereConditions.push('is_published = ?');
      queryParams.push(true);
    }
    
    if (category && category !== 'All') {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM liturgical_prayers ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = parseInt(countResult[0].total);
    
    // Get prayers with pagination
    const prayersQuery = `
      SELECT 
        id,
        title,
        content,
        category,
        language,
        is_active,
        created_at
      FROM liturgical_prayers 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [prayers] = await db.execute(prayersQuery, [...queryParams, limit, offset]);
    
    res.json({
      success: true,
      data: {
        prayers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get liturgical prayers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch liturgical prayers'
    });
  }
});

// Create liturgical prayer (admin only)
router.post('/', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      language = 'english',
      is_active = true
    } = req.body;
    
    const prayerId = uuidv4();
    
    await db.execute(`
      INSERT INTO liturgical_prayers (
        id, title, content, category, language, is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      prayerId, title, content, category || null, language || 'english', is_active, req.user.id
    ]);
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'CREATE_LITURGICAL_PRAYER',
      entityType: 'liturgical_prayer',
      entityId: prayerId,
      details: `Created liturgical prayer: ${title}`,
      ipAddress: req.ip
    });
    
    res.status(201).json({
      success: true,
      message: 'Liturgical prayer created successfully',
      data: {
        id: prayerId,
        title,
        content,
        category,
        language,
        is_active
      }
    });
    
  } catch (error) {
    console.error('Create liturgical prayer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create liturgical prayer'
    });
  }
});

// Update liturgical prayer (admin only)
router.put('/:id', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      category,
      language,
      is_active
    } = req.body;
    
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (content !== undefined) { updates.push('content = ?'); values.push(content); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (language !== undefined) { updates.push('language = ?'); values.push(language); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    values.push(id);
    
    await db.execute(
      `UPDATE liturgical_prayers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    res.json({
      success: true,
      message: 'Liturgical prayer updated successfully'
    });
    
  } catch (error) {
    console.error('Update liturgical prayer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update liturgical prayer'
    });
  }
});

// Delete liturgical prayer (admin only)
router.delete('/:id', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.execute('DELETE FROM liturgical_prayers WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Liturgical prayer deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete liturgical prayer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete liturgical prayer'
    });
  }
});

module.exports = router;
