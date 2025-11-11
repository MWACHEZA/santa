const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireContentManager, optionalAuth } = require('../middleware/auth');
const { 
  validateMinistry, 
  validateId, 
  validatePagination, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all ministries (public endpoint with optional auth)
router.get('/', optionalAuth, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const isActive = req.query.active !== 'false'; // Default to active only
    const search = req.query.search;
    
    let whereConditions = [];
    let queryParams = [];
    
    // For non-authenticated users, only show active ministries
    if (!req.user || req.user.role === 'parishioner') {
      whereConditions.push('is_active = true');
    } else if (isActive) {
      whereConditions.push('is_active = ?');
      queryParams.push(true);
    }
    
    if (search) {
      whereConditions.push('(name LIKE ? OR description LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM ministries ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get ministries with pagination
    const ministriesQuery = `
      SELECT 
        m.id,
        m.name,
        m.description,
        m.leader_name,
        m.leader_contact,
        m.meeting_schedule,
        m.requirements,
        m.is_active,
        m.created_at,
        m.updated_at,
        u.username as created_by_username
      FROM ministries m
      LEFT JOIN users u ON m.created_by = u.id
      ${whereClause}
      ORDER BY m.name ASC
      LIMIT ? OFFSET ?
    `;
    
    const [ministries] = await db.execute(ministriesQuery, [...queryParams, limit, offset]);
    
    res.json({
      success: true,
      data: {
        ministries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get ministries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ministries'
    });
  }
});

// Get active ministries (public endpoint)
router.get('/active', async (req, res) => {
  try {
    const [ministries] = await db.execute(`
      SELECT 
        id,
        name,
        description,
        leader_name,
        leader_contact,
        meeting_schedule,
        requirements
      FROM ministries
      WHERE is_active = true
      ORDER BY name ASC
    `);
    
    res.json({
      success: true,
      data: {
        ministries
      }
    });
    
  } catch (error) {
    console.error('Get active ministries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active ministries'
    });
  }
});

// Get single ministry
router.get('/:id', optionalAuth, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    let whereCondition = 'm.id = ?';
    const queryParams = [id];
    
    // For non-authenticated users, only show active ministries
    if (!req.user || req.user.role === 'parishioner') {
      whereCondition += ' AND m.is_active = true';
    }
    
    const [ministries] = await db.execute(`
      SELECT 
        m.id,
        m.name,
        m.description,
        m.leader_name,
        m.leader_contact,
        m.meeting_schedule,
        m.requirements,
        m.is_active,
        m.created_at,
        m.updated_at,
        u.username as created_by_username
      FROM ministries m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE ${whereCondition}
    `, queryParams);
    
    if (ministries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ministry not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        ministry: ministries[0]
      }
    });
    
  } catch (error) {
    console.error('Get ministry by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ministry'
    });
  }
});

// Create ministry (admin only)
router.post('/', authenticateToken, requireContentManager, validateMinistry, handleValidationErrors, async (req, res) => {
  try {
    const {
      name,
      description,
      leader_name,
      leader_contact,
      meeting_schedule,
      requirements,
      is_active = true
    } = req.body;
    
    // Check if ministry with same name already exists
    const [existingMinistries] = await db.execute(
      'SELECT id FROM ministries WHERE name = ?',
      [name]
    );
    
    if (existingMinistries.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ministry with this name already exists'
      });
    }
    
    const ministryId = uuidv4();
    
    await db.execute(`
      INSERT INTO ministries (
        id, name, description, leader_name, leader_contact,
        meeting_schedule, requirements, is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ministryId, name, description, leader_name, leader_contact,
      meeting_schedule, requirements, is_active, req.user.id
    ]);
    
    // Get created ministry
    const [createdMinistry] = await db.execute(`
      SELECT 
        m.id,
        m.name,
        m.description,
        m.leader_name,
        m.leader_contact,
        m.meeting_schedule,
        m.requirements,
        m.is_active,
        m.created_at,
        u.username as created_by_username
      FROM ministries m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.id = ?
    `, [ministryId]);
    
    res.status(201).json({
      success: true,
      message: 'Ministry created successfully',
      data: {
        ministry: createdMinistry[0]
      }
    });
    
  } catch (error) {
    console.error('Create ministry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ministry'
    });
  }
});

// Update ministry (admin only)
router.put('/:id', authenticateToken, requireContentManager, validateId, validateMinistry, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      leader_name,
      leader_contact,
      meeting_schedule,
      requirements,
      is_active
    } = req.body;
    
    // Check if ministry exists
    const [existingMinistries] = await db.execute('SELECT id FROM ministries WHERE id = ?', [id]);
    
    if (existingMinistries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ministry not found'
      });
    }
    
    // Check if another ministry with same name exists
    if (name) {
      const [duplicateMinistries] = await db.execute(
        'SELECT id FROM ministries WHERE name = ? AND id != ?',
        [name, id]
      );
      
      if (duplicateMinistries.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ministry with this name already exists'
        });
      }
    }
    
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (leader_name !== undefined) { updates.push('leader_name = ?'); values.push(leader_name); }
    if (leader_contact !== undefined) { updates.push('leader_contact = ?'); values.push(leader_contact); }
    if (meeting_schedule !== undefined) { updates.push('meeting_schedule = ?'); values.push(meeting_schedule); }
    if (requirements !== undefined) { updates.push('requirements = ?'); values.push(requirements); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    values.push(id);
    
    await db.execute(
      `UPDATE ministries SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Get updated ministry
    const [updatedMinistry] = await db.execute(`
      SELECT 
        m.id,
        m.name,
        m.description,
        m.leader_name,
        m.leader_contact,
        m.meeting_schedule,
        m.requirements,
        m.is_active,
        m.created_at,
        m.updated_at,
        u.username as created_by_username
      FROM ministries m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Ministry updated successfully',
      data: {
        ministry: updatedMinistry[0]
      }
    });
    
  } catch (error) {
    console.error('Update ministry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ministry'
    });
  }
});

// Delete ministry (admin only)
router.delete('/:id', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ministry exists
    const [existingMinistries] = await db.execute('SELECT id, name FROM ministries WHERE id = ?', [id]);
    
    if (existingMinistries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ministry not found'
      });
    }
    
    // Delete the ministry
    await db.execute('DELETE FROM ministries WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Ministry deleted successfully',
      data: {
        name: existingMinistries[0].name
      }
    });
    
  } catch (error) {
    console.error('Delete ministry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ministry'
    });
  }
});

// Toggle ministry status (admin only)
router.patch('/:id/toggle', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current status
    const [ministries] = await db.execute(
      'SELECT id, name, is_active FROM ministries WHERE id = ?',
      [id]
    );
    
    if (ministries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ministry not found'
      });
    }
    
    const ministry = ministries[0];
    const newStatus = !ministry.is_active;
    
    // Update status
    await db.execute(
      'UPDATE ministries SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({
      success: true,
      message: `Ministry ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: {
        name: ministry.name,
        is_active: newStatus
      }
    });
    
  } catch (error) {
    console.error('Toggle ministry status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle ministry status'
    });
  }
});

module.exports = router;
