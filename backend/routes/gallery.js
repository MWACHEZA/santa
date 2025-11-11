const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireContentManager, optionalAuth } = require('../middleware/auth');
const { 
  validateGallery, 
  validateId, 
  validatePagination, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get gallery images (public endpoint with optional auth)
router.get('/', optionalAuth, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const featured = req.query.featured === 'true';
    const eventId = req.query.event_id;
    
    let whereConditions = [];
    let queryParams = [];
    
    if (category) {
      whereConditions.push('c.name = ?');
      queryParams.push(category);
    }
    
    if (featured) {
      whereConditions.push('g.is_featured = true');
    }
    
    if (eventId) {
      whereConditions.push('g.event_id = ?');
      queryParams.push(eventId);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM gallery g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN events e ON g.event_id = e.id
      ${whereClause}
    `;
    
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get gallery images with pagination
    const galleryQuery = `
      SELECT 
        g.id,
        g.title,
        g.description,
        g.image_url,
        g.thumbnail_url,
        g.is_featured,
        g.upload_date,
        g.created_at,
        c.name as category_name,
        c.id as category_id,
        e.title as event_title,
        e.id as event_id,
        u.username as created_by_username
      FROM gallery g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN events e ON g.event_id = e.id
      LEFT JOIN users u ON g.created_by = u.id
      ${whereClause}
      ORDER BY g.is_featured DESC, g.upload_date DESC
      LIMIT ? OFFSET ?
    `;
    
    const [images] = await db.execute(galleryQuery, [...queryParams, limit, offset]);
    
    res.json({
      success: true,
      data: {
        images,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery images'
    });
  }
});

// Get featured images (public endpoint)
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const [images] = await db.execute(`
      SELECT 
        g.id,
        g.title,
        g.description,
        g.image_url,
        g.thumbnail_url,
        g.upload_date,
        c.name as category_name,
        e.title as event_title
      FROM gallery g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN events e ON g.event_id = e.id
      WHERE g.is_featured = true
      ORDER BY g.upload_date DESC
      LIMIT ?
    `, [limit]);
    
    res.json({
      success: true,
      data: {
        images
      }
    });
    
  } catch (error) {
    console.error('Get featured images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured images'
    });
  }
});

// Create gallery image (admin only)
router.post('/', authenticateToken, requireContentManager, validateGallery, handleValidationErrors, async (req, res) => {
  try {
    const {
      title,
      description,
      image_url,
      thumbnail_url,
      category_id,
      event_id,
      is_featured = false,
      upload_date
    } = req.body;
    
    // Validate category if provided
    if (category_id) {
      const [categories] = await db.execute(
        'SELECT id FROM categories WHERE id = ? AND is_active = true',
        [category_id]
      );
      
      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }
    
    // Validate event if provided
    if (event_id) {
      const [events] = await db.execute(
        'SELECT id FROM events WHERE id = ?',
        [event_id]
      );
      
      if (events.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID'
        });
      }
    }
    
    const imageId = uuidv4();
    
    await db.execute(`
      INSERT INTO gallery (
        id, title, description, image_url, thumbnail_url,
        category_id, event_id, is_featured, upload_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      imageId, title, description, image_url, thumbnail_url,
      category_id, event_id, is_featured, upload_date, req.user.id
    ]);
    
    // Get created image
    const [createdImage] = await db.execute(`
      SELECT 
        g.id,
        g.title,
        g.description,
        g.image_url,
        g.thumbnail_url,
        g.is_featured,
        g.upload_date,
        g.created_at,
        c.name as category_name,
        e.title as event_title
      FROM gallery g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN events e ON g.event_id = e.id
      WHERE g.id = ?
    `, [imageId]);
    
    res.status(201).json({
      success: true,
      message: 'Gallery image created successfully',
      data: {
        image: createdImage[0]
      }
    });
    
  } catch (error) {
    console.error('Create gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create gallery image'
    });
  }
});

// Update gallery image (admin only)
router.put('/:id', authenticateToken, requireContentManager, validateId, validateGallery, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category_id,
      event_id,
      is_featured
    } = req.body;
    
    // Check if image exists
    const [existingImages] = await db.execute('SELECT id FROM gallery WHERE id = ?', [id]);
    
    if (existingImages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found'
      });
    }
    
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
    if (event_id !== undefined) { updates.push('event_id = ?'); values.push(event_id); }
    if (is_featured !== undefined) { updates.push('is_featured = ?'); values.push(is_featured); }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    values.push(id);
    
    await db.execute(
      `UPDATE gallery SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Get updated image
    const [updatedImage] = await db.execute(`
      SELECT 
        g.id,
        g.title,
        g.description,
        g.image_url,
        g.thumbnail_url,
        g.is_featured,
        g.upload_date,
        g.created_at,
        g.updated_at,
        c.name as category_name,
        e.title as event_title
      FROM gallery g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN events e ON g.event_id = e.id
      WHERE g.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Gallery image updated successfully',
      data: {
        image: updatedImage[0]
      }
    });
    
  } catch (error) {
    console.error('Update gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gallery image'
    });
  }
});

// Delete gallery image (admin only)
router.delete('/:id', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if image exists
    const [existingImages] = await db.execute('SELECT id FROM gallery WHERE id = ?', [id]);
    
    if (existingImages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found'
      });
    }
    
    // Delete the image
    await db.execute('DELETE FROM gallery WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Gallery image deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gallery image'
    });
  }
});

module.exports = router;
