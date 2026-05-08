const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, requireContentManager, optionalAuth } = require('../middleware/auth');
const { logAction } = require('../utils/logger');

const router = express.Router();

// ── LIVE STREAMS ──────────────────────────────────────────────

// GET /videos/streams
router.get('/streams', optionalAuth, async (req, res) => {
  try {
    const { active } = req.query;
    // Only return streams that are either currently LIVE or scheduled for the FUTURE
    let query = `
      SELECT * FROM live_streams 
      WHERE is_live = true 
      OR scheduled_time > CURRENT_TIMESTAMP - INTERVAL '4 hours'
      ORDER BY scheduled_time ASC
    `;
    const params = [];
    
    const [streams] = await db.execute(query, params);
    res.json({ success: true, data: streams });
  } catch (err) {
    console.error('Get streams error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch streams', error: err.message });
  }
});

// POST /videos/streams
router.post('/streams', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const { title, description, streamUrl, scheduledTime, thumbnail, isLive } = req.body;
    if (!title || !streamUrl) {
      return res.status(400).json({ success: false, message: 'title and streamUrl are required' });
    }
    const liveStatus = isLive === true || isLive === 'true';
    const id = uuidv4();
    await db.execute(
      'INSERT INTO live_streams (id, title, description, stream_url, scheduled_time, thumbnail, is_live, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description || null, streamUrl, scheduledTime || null, thumbnail || null, liveStatus, req.user.id]
    );
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'CREATE_STREAM',
      entityType: 'stream',
      entityId: id,
      details: `Created stream: ${title}`,
      ipAddress: req.ip
    });

    const [rows] = await db.execute('SELECT * FROM live_streams WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: rows[0], message: 'Live stream created successfully' });
  } catch (err) {
    console.error('Create stream error:', err);
    res.status(500).json({ success: false, message: 'Failed to create stream' });
  }
});

// PUT /videos/streams/:id
router.put('/streams/:id', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, streamUrl, scheduledTime, thumbnail, isLive } = req.body;

    const updates = [];
    const vals = [];
    if (title !== undefined)         { updates.push('title = ?');          vals.push(title); }
    if (description !== undefined)   { updates.push('description = ?');    vals.push(description); }
    if (streamUrl !== undefined)     { updates.push('stream_url = ?');     vals.push(streamUrl); }
    if (scheduledTime !== undefined) { updates.push('scheduled_time = ?'); vals.push(scheduledTime); }
    if (thumbnail !== undefined)     { updates.push('thumbnail = ?');      vals.push(thumbnail); }
    if (isLive !== undefined)        { updates.push('is_live = ?');        vals.push(isLive); }

    if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update' });

    vals.push(id);
    await db.execute(`UPDATE live_streams SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, vals);

    // Log action
    await logAction({
      userId: req.user.id,
      action: 'UPDATE_STREAM',
      entityType: 'stream',
      entityId: id,
      details: `Updated stream: ${title || id}`,
      ipAddress: req.ip
    });

    const [rows] = await db.execute('SELECT * FROM live_streams WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Stream not found' });
    res.json({ success: true, data: rows[0], message: 'Stream updated successfully' });
  } catch (err) {
    console.error('Update stream error:', err);
    res.status(500).json({ success: false, message: 'Failed to update stream' });
  }
});

// DELETE /videos/streams/:id
router.delete('/streams/:id', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Log action before deletion
    await logAction({
      userId: req.user.id,
      action: 'DELETE_STREAM',
      entityType: 'stream',
      entityId: id,
      details: `Deleted stream ID: ${id}`,
      ipAddress: req.ip
    });

    await db.execute('DELETE FROM live_streams WHERE id = ?', [id]);
    res.json({ success: true, message: 'Stream deleted successfully' });
  } catch (err) {
    console.error('Delete stream error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete stream' });
  }
});

// POST /videos/streams/:id/viewer/start
router.post('/streams/:id/viewer/start', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE live_streams SET viewers = viewers + 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Viewer joined' });
  } catch (err) {
    console.error('Increment viewers error:', err);
    res.status(500).json({ success: false, message: 'Failed to join stream' });
  }
});

// POST /videos/streams/:id/viewer/stop
router.post('/streams/:id/viewer/stop', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure viewers don't go below 0
    await db.execute('UPDATE live_streams SET viewers = GREATEST(0, viewers - 1) WHERE id = ?', [id]);
    res.json({ success: true, message: 'Viewer left' });
  } catch (err) {
    console.error('Decrement viewers error:', err);
    res.status(500).json({ success: false, message: 'Failed to leave stream' });
  }
});

// ── VIDEO ARCHIVE ─────────────────────────────────────────────

// GET /videos/archive
router.get('/archive', optionalAuth, async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE is_published = true';
    const params = [];
    
    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    
    const [items] = await db.execute(
      `SELECT * FROM video_archive ${whereClause} ORDER BY published_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM video_archive ${whereClause}`,
      params
    );
    
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Get archive error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch archive' });
  }
});

// POST /videos/archive
router.post('/archive', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnail, duration, category, isPublished } = req.body;
    const id = uuidv4();
    const publishedAt = isPublished ? new Date() : null;
    
    await db.execute(
      `INSERT INTO video_archive (
        id, title, description, video_url, thumbnail, duration, category, is_published, published_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, videoUrl, thumbnail, duration, category, isPublished || false, publishedAt, req.user.id]
    );
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'CREATE_ARCHIVE_VIDEO',
      entityType: 'video',
      entityId: id,
      details: `Archived video: ${title}`,
      ipAddress: req.ip
    });

    const [rows] = await db.execute('SELECT * FROM video_archive WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Create archive error:', err);
    res.status(500).json({ success: false, message: 'Failed to archive video' });
  }
});

// GET /videos/archive/:id
router.get('/archive/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM video_archive WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Video not found' });
    
    // Increment views
    await db.execute('UPDATE video_archive SET views = views + 1 WHERE id = ?', [id]);
    
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get video error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch video' });
  }
});

// POST /videos/archive/:id/view
router.post('/archive/:id/view', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE video_archive SET views = views + 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'View incremented' });
  } catch (err) {
    console.error('Increment archive views error:', err);
    res.status(500).json({ success: false, message: 'Failed to increment views' });
  }
});

// POST /videos/stream/:id/view (for consistency)
router.post('/stream/:id/view', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE live_streams SET viewers = viewers + 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'View incremented' });
  } catch (err) {
    console.error('Increment stream views error:', err);
    res.status(500).json({ success: false, message: 'Failed to increment views' });
  }
});

// GET /videos/analytics (admin only)
router.get('/analytics', authenticateToken, requireContentManager, async (req, res) => {
  try {
    // Get live stream stats
    const [streamStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_streams,
        SUM(viewers) as total_live_viewers,
        (SELECT COUNT(*) FROM live_streams WHERE is_live = true) as currently_live
      FROM live_streams
    `);

    // Get archive stats
    const [archiveStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_videos,
        SUM(views) as total_archive_views,
        AVG(views) as avg_views_per_video
      FROM video_archive
    `);

    // Get popular content
    const [popularStreams] = await db.execute('SELECT title, viewers FROM live_streams ORDER BY viewers DESC LIMIT 5');
    const [popularArchive] = await db.execute('SELECT title, views FROM video_archive ORDER BY views DESC LIMIT 5');

    res.json({
      success: true,
      data: {
        live: streamStats[0],
        archive: archiveStats[0],
        popular: {
          streams: popularStreams,
          archive: popularArchive
        }
      }
    });
  } catch (err) {
    console.error('Video analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch video analytics' });
  }
});

module.exports = router;
