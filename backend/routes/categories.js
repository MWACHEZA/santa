const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', optionalAuth, async (req, res) => {
  try {
    const type = req.query.type;
    let query = 'SELECT * FROM categories WHERE is_active = true';
    let params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY name ASC';
    
    const [rows] = await db.execute(query, params);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Add new category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, type = 'financial', description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check for existing
    const [existing] = await db.execute(
      'SELECT * FROM categories WHERE name = ? AND type = ?',
      [name, type]
    );

    if (existing.length > 0) {
      // Reactivate if soft-deleted
      await db.execute(
        'UPDATE categories SET is_active = true WHERE name = ? AND type = ?',
        [name, type]
      );
      const [rows] = await db.execute(
        'SELECT * FROM categories WHERE name = ? AND type = ?',
        [name, type]
      );
      return res.status(200).json({ success: true, data: rows[0] });
    }

    const id = uuidv4();
    await db.execute(
      'INSERT INTO categories (id, name, type, description, is_active) VALUES (?, ?, ?, ?, true)',
      [id, name, type, description || null]
    );

    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
});

// Get categories by type
router.get('/type/:type', optionalAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const [rows] = await db.execute(
      'SELECT * FROM categories WHERE type = ? AND is_active = true ORDER BY name ASC',
      [type]
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Fetch categories by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Update category
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    
    await db.execute(
      'UPDATE categories SET name = ?, description = ?, is_active = ? WHERE id = ?',
      [name, description, is_active !== undefined ? is_active : true, id]
    );

    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
});

// Delete category
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category is in use (optional but recommended)
    // For now, just soft delete or hard delete
    await db.execute('DELETE FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
});

module.exports = router;
