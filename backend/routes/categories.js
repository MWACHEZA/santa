const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireContentManager, optionalAuth } = require('../middleware/auth');
const { 
  validateCategory, 
  validateId, 
  validatePagination, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all categories (public endpoint with optional auth)
router.get('/', optionalAuth, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const type = req.query.type;
    const isActive = req.query.active !== 'false'; // Default to active only
    
    let whereConditions = [];
    let queryParams = [];
    
    // For non-authenticated users, only show active categories
    if (!req.user || req.user.role === 'parishioner') {
      whereConditions.push('is_active = true');
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
    const countQuery = `SELECT COUNT(*) as total FROM categories ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get categories with pagination
    const categoriesQuery = `
      SELECT 
        id,
        name,
        type,
        description,
        is_active,
        created_at,
        updated_at
      FROM categories
      ${whereClause}
      ORDER BY type, name
      LIMIT ? OFFSET ?
    `;
    
    const [categories] = await db.execute(categoriesQuery, [...queryParams, limit, offset]);
    
    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Get categories by type (public endpoint)
router.get('/type/:type', optionalAuth, async (req, res) => {
  try {
    const { type } = req.params;
    
    const validTypes = ['news', 'event', 'ministry', 'sacrament', 'general'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category type'
      });
    }
    
    let whereCondition = 'type = ?';
    const queryParams = [type];
    
    // For non-authenticated users, only show active categories
    if (!req.user || req.user.role === 'parishioner') {
      whereCondition += ' AND is_active = true';
    }
    
    const [categories] = await db.execute(`
      SELECT 
        id,
        name,
        type,
        description,
        is_active,
        created_at
      FROM categories
      WHERE ${whereCondition}
      ORDER BY name
    `, queryParams);
    
    res.json({
      success: true,
      data: {
        categories
      }
    });
    
  } catch (error) {
    console.error('Get categories by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Get single category
router.get('/:id', optionalAuth, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    let whereCondition = 'id = ?';
    const queryParams = [id];
    
    // For non-authenticated users, only show active categories
    if (!req.user || req.user.role === 'parishioner') {
      whereCondition += ' AND is_active = true';
    }
    
    const [categories] = await db.execute(`
      SELECT 
        id,
        name,
        type,
        description,
        is_active,
        created_at,
        updated_at
      FROM categories
      WHERE ${whereCondition}
    `, queryParams);
    
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        category: categories[0]
      }
    });
    
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
});

// Create category
router.post('/', authenticateToken, requireContentManager, validateCategory, handleValidationErrors, async (req, res) => {
  try {
    const { name, type, description, is_active = true } = req.body;
    
    // Check if category with same name and type already exists
    const [existingCategories] = await db.execute(
      'SELECT id FROM categories WHERE name = ? AND type = ?',
      [name, type]
    );
    
    if (existingCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name and type already exists'
      });
    }
    
    const categoryId = uuidv4();
    
    await db.execute(`
      INSERT INTO categories (id, name, type, description, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [categoryId, name, type, description, is_active]);
    
    // Get created category
    const [createdCategory] = await db.execute(`
      SELECT 
        id,
        name,
        type,
        description,
        is_active,
        created_at,
        updated_at
      FROM categories
      WHERE id = ?
    `, [categoryId]);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category: createdCategory[0]
      }
    });
    
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
});

// Update category
router.put('/:id', authenticateToken, requireContentManager, validateId, validateCategory, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, is_active } = req.body;
    
    // Check if category exists
    const [existingCategories] = await db.execute('SELECT id FROM categories WHERE id = ?', [id]);
    
    if (existingCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if another category with same name and type exists
    if (name && type) {
      const [duplicateCategories] = await db.execute(
        'SELECT id FROM categories WHERE name = ? AND type = ? AND id != ?',
        [name, type, id]
      );
      
      if (duplicateCategories.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name and type already exists'
        });
      }
    }
    
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    values.push(id);
    
    await db.execute(
      `UPDATE categories SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Get updated category
    const [updatedCategory] = await db.execute(`
      SELECT 
        id,
        name,
        type,
        description,
        is_active,
        created_at,
        updated_at
      FROM categories
      WHERE id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category: updatedCategory[0]
      }
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
router.delete('/:id', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const [existingCategories] = await db.execute('SELECT id, name FROM categories WHERE id = ?', [id]);
    
    if (existingCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category is being used
    const [newsUsage] = await db.execute('SELECT COUNT(*) as count FROM news WHERE category_id = ?', [id]);
    const [eventsUsage] = await db.execute('SELECT COUNT(*) as count FROM events WHERE category_id = ?', [id]);
    const [galleryUsage] = await db.execute('SELECT COUNT(*) as count FROM gallery WHERE category_id = ?', [id]);
    
    const totalUsage = newsUsage[0].count + eventsUsage[0].count + galleryUsage[0].count;
    
    if (totalUsage > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is being used by ${totalUsage} item(s). Please reassign or delete those items first.`,
        data: {
          usage: {
            news: newsUsage[0].count,
            events: eventsUsage[0].count,
            gallery: galleryUsage[0].count
          }
        }
      });
    }
    
    // Delete the category
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

// Get category usage statistics (admin only)
router.get('/:id/usage', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const [existingCategories] = await db.execute('SELECT id, name, type FROM categories WHERE id = ?', [id]);
    
    if (existingCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const category = existingCategories[0];
    
    // Get usage statistics
    const [newsUsage] = await db.execute(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN is_published = true AND is_archived = false THEN 1 ELSE 0 END) as published
      FROM news WHERE category_id = ?
    `, [id]);
    
    const [eventsUsage] = await db.execute(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published
      FROM events WHERE category_id = ?
    `, [id]);
    
    const [galleryUsage] = await db.execute(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN is_featured = true THEN 1 ELSE 0 END) as featured
      FROM gallery WHERE category_id = ?
    `, [id]);
    
    res.json({
      success: true,
      data: {
        category,
        usage: {
          news: {
            total: newsUsage[0].total,
            published: newsUsage[0].published
          },
          events: {
            total: eventsUsage[0].total,
            published: eventsUsage[0].published
          },
          gallery: {
            total: galleryUsage[0].total,
            featured: galleryUsage[0].featured
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Get category usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category usage'
    });
  }
});

// Get category statistics overview (admin only)
router.get('/stats/overview', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_categories,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_categories,
        COUNT(DISTINCT type) as category_types
      FROM categories
    `);
    
    // Get categories by type
    const [typeStats] = await db.execute(`
      SELECT 
        type,
        COUNT(*) as total,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active
      FROM categories
      GROUP BY type
      ORDER BY total DESC
    `);
    
    // Get most used categories
    const [mostUsed] = await db.execute(`
      SELECT 
        c.id,
        c.name,
        c.type,
        (
          COALESCE((SELECT COUNT(*) FROM news WHERE category_id = c.id), 0) +
          COALESCE((SELECT COUNT(*) FROM events WHERE category_id = c.id), 0) +
          COALESCE((SELECT COUNT(*) FROM gallery WHERE category_id = c.id), 0)
        ) as usage_count
      FROM categories c
      WHERE c.is_active = true
      ORDER BY usage_count DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats[0],
        typeStats,
        mostUsed
      }
    });
    
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics'
    });
  }
});

module.exports = router;
