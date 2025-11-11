const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireContentManager, optionalAuth } = require('../middleware/auth');
const { 
  validateSacrament, 
  validateId, 
  validatePagination, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all sacraments (public endpoint with optional auth)
router.get('/', optionalAuth, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const isActive = req.query.active !== 'false'; // Default to active only
    const search = req.query.search;
    
    let whereConditions = [];
    let queryParams = [];
    
    // For non-authenticated users, only show active sacraments
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
    const countQuery = `SELECT COUNT(*) as total FROM sacraments ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get sacraments with pagination
    const sacramentsQuery = `
      SELECT 
        s.id,
        s.name,
        s.description,
        s.requirements,
        s.preparation_time,
        s.contact_person,
        s.contact_info,
        s.is_active,
        s.created_at,
        s.updated_at,
        u.username as created_by_username
      FROM sacraments s
      LEFT JOIN users u ON s.created_by = u.id
      ${whereClause}
      ORDER BY s.name ASC
      LIMIT ? OFFSET ?
    `;
    
    const [sacraments] = await db.execute(sacramentsQuery, [...queryParams, limit, offset]);
    
    res.json({
      success: true,
      data: {
        sacraments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get sacraments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sacraments'
    });
  }
});

// Get active sacraments (public endpoint)
router.get('/active', async (req, res) => {
  try {
    const [sacraments] = await db.execute(`
      SELECT 
        id,
        name,
        description,
        requirements,
        preparation_time,
        contact_person,
        contact_info
      FROM sacraments
      WHERE is_active = true
      ORDER BY name ASC
    `);
    
    res.json({
      success: true,
      data: {
        sacraments
      }
    });
    
  } catch (error) {
    console.error('Get active sacraments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active sacraments'
    });
  }
});

// Get single sacrament
router.get('/:id', optionalAuth, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    let whereCondition = 's.id = ?';
    const queryParams = [id];
    
    // For non-authenticated users, only show active sacraments
    if (!req.user || req.user.role === 'parishioner') {
      whereCondition += ' AND s.is_active = true';
    }
    
    const [sacraments] = await db.execute(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.requirements,
        s.preparation_time,
        s.contact_person,
        s.contact_info,
        s.is_active,
        s.created_at,
        s.updated_at,
        u.username as created_by_username
      FROM sacraments s
      LEFT JOIN users u ON s.created_by = u.id
      WHERE ${whereCondition}
    `, queryParams);
    
    if (sacraments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sacrament not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        sacrament: sacraments[0]
      }
    });
    
  } catch (error) {
    console.error('Get sacrament by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sacrament'
    });
  }
});

// Create sacrament (admin only)
router.post('/', authenticateToken, requireContentManager, validateSacrament, handleValidationErrors, async (req, res) => {
  try {
    const {
      name,
      description,
      requirements,
      preparation_time,
      contact_person,
      contact_info,
      is_active = true
    } = req.body;
    
    // Check if sacrament with same name already exists
    const [existingSacraments] = await db.execute(
      'SELECT id FROM sacraments WHERE name = ?',
      [name]
    );
    
    if (existingSacraments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Sacrament with this name already exists'
      });
    }
    
    const sacramentId = uuidv4();
    
    await db.execute(`
      INSERT INTO sacraments (
        id, name, description, requirements, preparation_time,
        contact_person, contact_info, is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sacramentId, name, description, requirements, preparation_time,
      contact_person, contact_info, is_active, req.user.id
    ]);
    
    // Get created sacrament
    const [createdSacrament] = await db.execute(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.requirements,
        s.preparation_time,
        s.contact_person,
        s.contact_info,
        s.is_active,
        s.created_at,
        u.username as created_by_username
      FROM sacraments s
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `, [sacramentId]);
    
    res.status(201).json({
      success: true,
      message: 'Sacrament created successfully',
      data: {
        sacrament: createdSacrament[0]
      }
    });
    
  } catch (error) {
    console.error('Create sacrament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sacrament'
    });
  }
});

// Update sacrament (admin only)
router.put('/:id', authenticateToken, requireContentManager, validateId, validateSacrament, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      requirements,
      preparation_time,
      contact_person,
      contact_info,
      is_active
    } = req.body;
    
    // Check if sacrament exists
    const [existingSacraments] = await db.execute('SELECT id FROM sacraments WHERE id = ?', [id]);
    
    if (existingSacraments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sacrament not found'
      });
    }
    
    // Check if another sacrament with same name exists
    if (name) {
      const [duplicateSacraments] = await db.execute(
        'SELECT id FROM sacraments WHERE name = ? AND id != ?',
        [name, id]
      );
      
      if (duplicateSacraments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Sacrament with this name already exists'
        });
      }
    }
    
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (requirements !== undefined) { updates.push('requirements = ?'); values.push(requirements); }
    if (preparation_time !== undefined) { updates.push('preparation_time = ?'); values.push(preparation_time); }
    if (contact_person !== undefined) { updates.push('contact_person = ?'); values.push(contact_person); }
    if (contact_info !== undefined) { updates.push('contact_info = ?'); values.push(contact_info); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    values.push(id);
    
    await db.execute(
      `UPDATE sacraments SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Get updated sacrament
    const [updatedSacrament] = await db.execute(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.requirements,
        s.preparation_time,
        s.contact_person,
        s.contact_info,
        s.is_active,
        s.created_at,
        s.updated_at,
        u.username as created_by_username
      FROM sacraments s
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Sacrament updated successfully',
      data: {
        sacrament: updatedSacrament[0]
      }
    });
    
  } catch (error) {
    console.error('Update sacrament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sacrament'
    });
  }
});

// Delete sacrament (admin only)
router.delete('/:id', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if sacrament exists
    const [existingSacraments] = await db.execute('SELECT id, name FROM sacraments WHERE id = ?', [id]);
    
    if (existingSacraments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sacrament not found'
      });
    }
    
    // Delete the sacrament
    await db.execute('DELETE FROM sacraments WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Sacrament deleted successfully',
      data: {
        name: existingSacraments[0].name
      }
    });
    
  } catch (error) {
    console.error('Delete sacrament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sacrament'
    });
  }
});

// Toggle sacrament status (admin only)
router.patch('/:id/toggle', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current status
    const [sacraments] = await db.execute(
      'SELECT id, name, is_active FROM sacraments WHERE id = ?',
      [id]
    );
    
    if (sacraments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sacrament not found'
      });
    }
    
    const sacrament = sacraments[0];
    const newStatus = !sacrament.is_active;
    
    // Update status
    await db.execute(
      'UPDATE sacraments SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({
      success: true,
      message: `Sacrament ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: {
        name: sacrament.name,
        is_active: newStatus
      }
    });
    
  } catch (error) {
    console.error('Toggle sacrament status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle sacrament status'
    });
  }
});

module.exports = router;
