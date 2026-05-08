const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
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
    const countQuery = `SELECT COUNT(*) as total FROM prayers ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = parseInt(countResult[0].total);
    
    // Get prayers with pagination
    const prayersQuery = `
      SELECT 
        id,
        title,
        text,
        category,
        image_url,
        is_published as is_active,
        created_at
      FROM prayers 
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
      text,
      category,
      is_active = true,
      image_url = null
    } = req.body;
    
    const prayerId = uuidv4();
    
    await db.execute(`
      INSERT INTO prayers (
        id, title, text, category, is_published, image_url, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      prayerId, title, text, category, is_active, image_url, req.user.id
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Liturgical prayer created successfully',
      data: {
        id: prayerId,
        title,
        text,
        category,
        is_active,
        image_url
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
      text,
      category,
      is_active,
      image_url
    } = req.body;
    
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (text !== undefined) { updates.push('text = ?'); values.push(text); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (is_active !== undefined) { updates.push('is_published = ?'); values.push(is_active); }
    if (image_url !== undefined) { updates.push('image_url = ?'); values.push(image_url); }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    values.push(id);
    
    await db.execute(
      `UPDATE prayers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
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
    
    await db.execute('DELETE FROM prayers WHERE id = ?', [id]);
    
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
