const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const db = require('../config/database');

// =============================================
// LIVE STREAMS ENDPOINTS
// =============================================

// Get all live streams
router.get('/streams', [
  query('active').optional().isBoolean(),
  query('scheduled').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { active, scheduled, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (active !== undefined) {
      whereClause += ` AND is_live = $${params.length + 1}`;
      params.push(active === 'true');
    }

    if (scheduled !== undefined) {
      const now = new Date();
      if (scheduled === 'true') {
        whereClause += ` AND scheduled_time > $${params.length + 1}`;
        params.push(now);
      }
    }

    const query = `
      SELECT 
        ls.*,
        u.username as created_by_username,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM live_streams ls
      LEFT JOIN users u ON ls.created_by = u.id
      ${whereClause}
      ORDER BY 
        CASE WHEN is_live THEN 1 ELSE 2 END,
        scheduled_time DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM live_streams ls ${whereClause}`;
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching live streams:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new live stream
router.post('/streams', [
  auth,
  roleAuth(['admin', 'reporter']),
  body('title').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim(),
  body('streamUrl').notEmpty().isURL(),
  body('scheduledTime').notEmpty().isISO8601(),
  body('thumbnailUrl').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, streamUrl, scheduledTime, thumbnailUrl } = req.body;

    const query = `
      INSERT INTO live_streams (
        title, description, stream_url, scheduled_time, 
        thumbnail_url, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [
      title, description, streamUrl, scheduledTime, 
      thumbnailUrl, req.user.id
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Live stream created successfully'
    });
  } catch (error) {
    console.error('Error creating live stream:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update live stream
router.put('/streams/:id', [
  auth,
  roleAuth(['admin', 'reporter']),
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim(),
  body('streamUrl').optional().isURL(),
  body('scheduledTime').optional().isISO8601(),
  body('thumbnailUrl').optional().isURL(),
  body('isLive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const setClause = [];
    const params = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        setClause.push(`${dbKey} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    params.push(id);
    const query = `
      UPDATE live_streams 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Live stream not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Live stream updated successfully'
    });
  } catch (error) {
    console.error('Error updating live stream:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete live stream
router.delete('/streams/:id', [
  auth,
  roleAuth(['admin', 'reporter'])
], async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM live_streams WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Live stream not found' });
    }

    res.json({
      success: true,
      message: 'Live stream deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting live stream:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================================
// VIDEO ARCHIVE ENDPOINTS
// =============================================

// Get all archived videos
router.get('/archive', [
  query('category').optional().isIn(['mass', 'event', 'sermon', 'special']),
  query('published').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, published, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (category) {
      whereClause += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (published !== undefined) {
      whereClause += ` AND is_published = $${params.length + 1}`;
      params.push(published === 'true');
    }

    if (search) {
      whereClause += ` AND (title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    const query = `
      SELECT 
        va.*,
        u.username as created_by_username,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name,
        EXTRACT(EPOCH FROM duration) as duration_seconds
      FROM video_archive va
      LEFT JOIN users u ON va.created_by = u.id
      ${whereClause}
      ORDER BY 
        CASE WHEN is_published THEN published_at ELSE created_at END DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM video_archive va ${whereClause}`;
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching video archive:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new archived video
router.post('/archive', [
  auth,
  roleAuth(['admin', 'reporter']),
  body('title').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim(),
  body('videoUrl').notEmpty().isURL(),
  body('category').notEmpty().isIn(['mass', 'event', 'sermon', 'special']),
  body('duration').optional().matches(/^\d{2}:\d{2}:\d{2}$/),
  body('thumbnailUrl').optional().isURL(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, videoUrl, category, duration, thumbnailUrl, tags } = req.body;

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const query = `
      INSERT INTO video_archive (
        title, description, video_url, category, duration,
        thumbnail_url, tags, slug, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(query, [
      title, description, videoUrl, category, duration,
      thumbnailUrl, tags || [], slug, req.user.id
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Video created successfully'
    });
  } catch (error) {
    console.error('Error creating video:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ success: false, message: 'Video with this title already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

// Update archived video
router.put('/archive/:id', [
  auth,
  roleAuth(['admin', 'reporter']),
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim(),
  body('videoUrl').optional().isURL(),
  body('category').optional().isIn(['mass', 'event', 'sermon', 'special']),
  body('duration').optional().matches(/^\d{2}:\d{2}:\d{2}$/),
  body('thumbnailUrl').optional().isURL(),
  body('isPublished').optional().isBoolean(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const setClause = [];
    const params = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        setClause.push(`${dbKey} = $${paramIndex}`);
        params.push(value);
        paramIndex++;

        // Set published_at when publishing
        if (key === 'isPublished' && value === true) {
          setClause.push(`published_at = CURRENT_TIMESTAMP`);
        }
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    params.push(id);
    const query = `
      UPDATE video_archive 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Video updated successfully'
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete archived video
router.delete('/archive/:id', [
  auth,
  roleAuth(['admin', 'reporter'])
], async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM video_archive WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================================
// VIEW TRACKING ENDPOINTS
// =============================================

// Track video view
router.post('/archive/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Insert view record
    const viewQuery = `
      INSERT INTO video_views (video_id, user_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    await db.query(viewQuery, [id, userId, ipAddress, userAgent]);

    // Update video view count
    const updateQuery = `
      UPDATE video_archive 
      SET views = views + 1 
      WHERE id = $1
    `;

    await db.query(updateQuery, [id]);

    res.json({ success: true, message: 'View tracked successfully' });
  } catch (error) {
    console.error('Error tracking video view:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Track stream view
router.post('/streams/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Insert view record
    const viewQuery = `
      INSERT INTO video_views (stream_id, user_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    await db.query(viewQuery, [id, userId, ipAddress, userAgent]);

    // Update stream view count
    const updateQuery = `
      UPDATE live_streams 
      SET total_views = total_views + 1 
      WHERE id = $1
    `;

    await db.query(updateQuery, [id]);

    res.json({ success: true, message: 'View tracked successfully' });
  } catch (error) {
    console.error('Error tracking stream view:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================================
// ANALYTICS ENDPOINTS
// =============================================

// Get video analytics
router.get('/analytics', [
  auth,
  roleAuth(['admin', 'priest', 'reporter']),
  query('timeRange').optional().isIn(['7d', '30d', '90d', '1y']),
  query('videoId').optional().isUUID(),
  query('category').optional().isIn(['mass', 'event', 'sermon', 'special'])
], async (req, res) => {
  try {
    const { timeRange = '30d', videoId, category } = req.query;

    // Calculate date range
    const timeRanges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const days = timeRanges[timeRange];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let analytics = {};

    if (videoId) {
      // Get analytics for specific video
      const videoQuery = `
        SELECT 
          va.*,
          COUNT(vv.id) as total_detailed_views,
          AVG(EXTRACT(EPOCH FROM vv.watch_duration)) as avg_watch_duration,
          COUNT(vv.id) FILTER (WHERE vv.completed = true) as completed_views
        FROM video_archive va
        LEFT JOIN video_views vv ON va.id = vv.video_id 
          AND vv.viewed_at >= $1
        WHERE va.id = $2
        GROUP BY va.id
      `;

      const result = await db.query(videoQuery, [startDate, videoId]);
      analytics = result.rows[0] || {};
    } else {
      // Get overall analytics
      let whereClause = 'WHERE va.created_at >= $1';
      const params = [startDate];

      if (category) {
        whereClause += ` AND va.category = $${params.length + 1}`;
        params.push(category);
      }

      const overallQuery = `
        SELECT 
          COUNT(DISTINCT va.id) as total_videos,
          COUNT(DISTINCT ls.id) as total_streams,
          SUM(va.views) as total_video_views,
          SUM(ls.total_views) as total_stream_views,
          COUNT(DISTINCT vv.id) as total_detailed_views,
          AVG(EXTRACT(EPOCH FROM vv.watch_duration)) as avg_watch_duration
        FROM video_archive va
        FULL OUTER JOIN live_streams ls ON 1=1
        LEFT JOIN video_views vv ON (va.id = vv.video_id OR ls.id = vv.stream_id)
          AND vv.viewed_at >= $1
        ${whereClause}
      `;

      const overallResult = await db.query(overallQuery, params);
      analytics.overall = overallResult.rows[0];

      // Get top performing videos
      const topVideosQuery = `
        SELECT 
          va.id, va.title, va.category, va.views,
          COUNT(vv.id) as recent_views
        FROM video_archive va
        LEFT JOIN video_views vv ON va.id = vv.video_id 
          AND vv.viewed_at >= $1
        ${whereClause}
        GROUP BY va.id, va.title, va.category, va.views
        ORDER BY recent_views DESC, va.views DESC
        LIMIT 10
      `;

      const topVideosResult = await db.query(topVideosQuery, params);
      analytics.topVideos = topVideosResult.rows;

      // Get category breakdown
      const categoryQuery = `
        SELECT 
          category,
          COUNT(*) as video_count,
          SUM(views) as total_views
        FROM video_archive va
        ${whereClause}
        GROUP BY category
        ORDER BY total_views DESC
      `;

      const categoryResult = await db.query(categoryQuery, params);
      analytics.categoryBreakdown = categoryResult.rows;
    }

    res.json({
      success: true,
      data: analytics,
      timeRange,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching video analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
