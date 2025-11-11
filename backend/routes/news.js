const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireNewsCreator, optionalAuth } = require('../middleware/auth');
const { 
  validateNews, 
  validateId, 
  validatePagination, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all news (public endpoint with optional auth for admin features)
router.get('/', optionalAuth, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const isPublished = req.query.published !== 'false'; // Default to published only
    const isArchived = req.query.archived === 'true';
    
    let whereConditions = [];
    let queryParams = [];
    
    // For non-authenticated users or non-admin users, only show published, non-archived news
    if (!req.user || req.user.role === 'parishioner') {
      whereConditions.push('n.is_published = true');
      whereConditions.push('n.is_archived = false');
    } else {
      // For admin users, allow filtering
      if (isPublished) {
        whereConditions.push('n.is_published = ?');
        queryParams.push(true);
      }
      
      whereConditions.push('n.is_archived = ?');
      queryParams.push(isArchived);
    }
    
    if (category) {
      whereConditions.push('c.name = ?');
      queryParams.push(category);
    }
    
    if (search) {
      whereConditions.push('(n.title LIKE ? OR n.summary LIKE ? OR n.content LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM news n
      LEFT JOIN categories c ON n.category_id = c.id
      ${whereClause}
    `;
    
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get news with pagination
    const newsQuery = `
      SELECT 
        n.id,
        n.title,
        n.summary,
        n.content,
        n.image_url,
        n.author,
        n.author_role,
        n.is_published,
        n.is_archived,
        n.published_at,
        n.archived_at,
        n.created_at,
        n.updated_at,
        c.name as category_name,
        c.id as category_id,
        u.username as created_by_username
      FROM news n
      LEFT JOIN categories c ON n.category_id = c.id
      LEFT JOIN users u ON n.created_by = u.id
      ${whereClause}
      ORDER BY 
        CASE WHEN n.published_at IS NOT NULL THEN n.published_at ELSE n.created_at END DESC
      LIMIT ? OFFSET ?
    `;
    
    const [news] = await db.execute(newsQuery, [...queryParams, limit, offset]);
    
    res.json({
      success: true,
      data: {
        news,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news'
    });
  }
});

// Get single news article
router.get('/:id', optionalAuth, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    let whereCondition = 'n.id = ?';
    const queryParams = [id];
    
    // For non-authenticated users or non-admin users, only show published, non-archived news
    if (!req.user || req.user.role === 'parishioner') {
      whereCondition += ' AND n.is_published = true AND n.is_archived = false';
    }
    
    const [news] = await db.execute(`
      SELECT 
        n.id,
        n.title,
        n.summary,
        n.content,
        n.image_url,
        n.author,
        n.author_role,
        n.is_published,
        n.is_archived,
        n.published_at,
        n.archived_at,
        n.created_at,
        n.updated_at,
        c.name as category_name,
        c.id as category_id,
        u.username as created_by_username
      FROM news n
      LEFT JOIN categories c ON n.category_id = c.id
      LEFT JOIN users u ON n.created_by = u.id
      WHERE ${whereCondition}
    `, queryParams);
    
    if (news.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        news: news[0]
      }
    });
    
  } catch (error) {
    console.error('Get news by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news article'
    });
  }
});

// Create news article
router.post('/', authenticateToken, requireNewsCreator, validateNews, handleValidationErrors, async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      category_id,
      image_url,
      author,
      author_role,
      is_published = false
    } = req.body;
    
    // Validate category if provided
    if (category_id) {
      const [categories] = await db.execute(
        'SELECT id FROM categories WHERE id = ? AND type = "news" AND is_active = true',
        [category_id]
      );
      
      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }
    
    const newsId = uuidv4();
    const publishedAt = is_published ? new Date().toISOString() : null;
    
    await db.execute(`
      INSERT INTO news (
        id, title, summary, content, category_id, image_url, 
        author, author_role, is_published, published_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newsId, title, summary, content, category_id, image_url,
      author, author_role, is_published, publishedAt, req.user.id
    ]);
    
    // Get created news article
    const [createdNews] = await db.execute(`
      SELECT 
        n.id,
        n.title,
        n.summary,
        n.content,
        n.image_url,
        n.author,
        n.author_role,
        n.is_published,
        n.is_archived,
        n.published_at,
        n.created_at,
        c.name as category_name,
        c.id as category_id
      FROM news n
      LEFT JOIN categories c ON n.category_id = c.id
      WHERE n.id = ?
    `, [newsId]);
    
    res.status(201).json({
      success: true,
      message: 'News article created successfully',
      data: {
        news: createdNews[0]
      }
    });
    
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create news article'
    });
  }
});

// Update news article
router.put('/:id', authenticateToken, requireNewsCreator, validateId, validateNews, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      summary,
      content,
      category_id,
      image_url,
      author,
      author_role,
      is_published
    } = req.body;
    
    // Check if news exists
    const [existingNews] = await db.execute('SELECT id, is_published FROM news WHERE id = ?', [id]);
    
    if (existingNews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    // Validate category if provided
    if (category_id) {
      const [categories] = await db.execute(
        'SELECT id FROM categories WHERE id = ? AND type = "news" AND is_active = true',
        [category_id]
      );
      
      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }
    
    // Handle publishing
    let publishedAt = null;
    if (is_published && !existingNews[0].is_published) {
      publishedAt = new Date().toISOString();
    }
    
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (summary !== undefined) { updates.push('summary = ?'); values.push(summary); }
    if (content !== undefined) { updates.push('content = ?'); values.push(content); }
    if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
    if (image_url !== undefined) { updates.push('image_url = ?'); values.push(image_url); }
    if (author !== undefined) { updates.push('author = ?'); values.push(author); }
    if (author_role !== undefined) { updates.push('author_role = ?'); values.push(author_role); }
    if (is_published !== undefined) { updates.push('is_published = ?'); values.push(is_published); }
    if (publishedAt) { updates.push('published_at = ?'); values.push(publishedAt); }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    values.push(id);
    
    await db.execute(
      `UPDATE news SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Get updated news article
    const [updatedNews] = await db.execute(`
      SELECT 
        n.id,
        n.title,
        n.summary,
        n.content,
        n.image_url,
        n.author,
        n.author_role,
        n.is_published,
        n.is_archived,
        n.published_at,
        n.created_at,
        n.updated_at,
        c.name as category_name,
        c.id as category_id
      FROM news n
      LEFT JOIN categories c ON n.category_id = c.id
      WHERE n.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'News article updated successfully',
      data: {
        news: updatedNews[0]
      }
    });
    
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update news article'
    });
  }
});

// Archive news article
router.patch('/:id/archive', authenticateToken, requireNewsCreator, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if news exists and is not already archived
    const [existingNews] = await db.execute(
      'SELECT id, is_archived FROM news WHERE id = ?',
      [id]
    );
    
    if (existingNews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    if (existingNews[0].is_archived) {
      return res.status(400).json({
        success: false,
        message: 'News article is already archived'
      });
    }
    
    // Archive the news article
    await db.execute(
      'UPDATE news SET is_archived = true, archived_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'News article archived successfully'
    });
    
  } catch (error) {
    console.error('Archive news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive news article'
    });
  }
});

// Unarchive news article
router.patch('/:id/unarchive', authenticateToken, requireNewsCreator, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if news exists and is archived
    const [existingNews] = await db.execute(
      'SELECT id, is_archived FROM news WHERE id = ?',
      [id]
    );
    
    if (existingNews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    if (!existingNews[0].is_archived) {
      return res.status(400).json({
        success: false,
        message: 'News article is not archived'
      });
    }
    
    // Unarchive the news article
    await db.execute(
      'UPDATE news SET is_archived = false, archived_at = NULL WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'News article unarchived successfully'
    });
    
  } catch (error) {
    console.error('Unarchive news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unarchive news article'
    });
  }
});

// Delete news article
router.delete('/:id', authenticateToken, requireNewsCreator, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if news exists
    const [existingNews] = await db.execute('SELECT id FROM news WHERE id = ?', [id]);
    
    if (existingNews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    // Delete the news article
    await db.execute('DELETE FROM news WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'News article deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete news article'
    });
  }
});

// Get news statistics (admin only)
router.get('/stats/overview', authenticateToken, requireNewsCreator, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_news,
        SUM(CASE WHEN is_published = true AND is_archived = false THEN 1 ELSE 0 END) as published_news,
        SUM(CASE WHEN is_published = false AND is_archived = false THEN 1 ELSE 0 END) as draft_news,
        SUM(CASE WHEN is_archived = true THEN 1 ELSE 0 END) as archived_news,
        COUNT(DISTINCT author) as total_authors,
        COUNT(DISTINCT category_id) as categories_used
      FROM news
    `);
    
    // Get news by category
    const [categoryStats] = await db.execute(`
      SELECT 
        c.name as category_name,
        COUNT(n.id) as news_count
      FROM categories c
      LEFT JOIN news n ON c.id = n.category_id AND n.is_published = true AND n.is_archived = false
      WHERE c.type = 'news' AND c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY news_count DESC
    `);
    
    // Get recent activity
    const [recentActivity] = await db.execute(`
      SELECT 
        n.id,
        n.title,
        n.author,
        n.created_at,
        n.updated_at,
        n.is_published,
        CASE 
          WHEN n.created_at = n.updated_at THEN 'created'
          ELSE 'updated'
        END as action
      FROM news n
      ORDER BY n.updated_at DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats[0],
        categoryStats,
        recentActivity
      }
    });
    
  } catch (error) {
    console.error('Get news stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news statistics'
    });
  }
});

module.exports = router;
