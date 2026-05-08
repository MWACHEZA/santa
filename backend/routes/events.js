const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { logAction } = require('../utils/logger');
const { authenticateToken, requireContentManager, optionalAuth } = require('../middleware/auth');
const { 
  validateEvent, 
  validateId, 
  validatePagination, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all events (public endpoint with optional auth)
router.get('/', optionalAuth, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const upcoming = req.query.upcoming === 'true';
    const past = req.query.past === 'true';
    const isPublished = req.query.published !== 'false'; // Default to published only
    
    let whereConditions = [];
    let queryParams = [];
    
    // For non-authenticated users or non-admin users, only show published events
    if (!req.user || req.user.role === 'parishioner') {
      whereConditions.push('e.is_published = true');
    } else if (isPublished) {
      whereConditions.push('e.is_published = ?');
      queryParams.push(true);
    }
    
    if (category) {
      whereConditions.push('c.name = ?');
      queryParams.push(category);
    }
    
    if (upcoming) {
      whereConditions.push('e.event_date >= CURRENT_DATE');
    } else if (past) {
      whereConditions.push('e.event_date < CURRENT_DATE');
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      ${whereClause}
    `;
    
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = parseInt(countResult[0].total);
    
    // Get events with pagination
    const eventsQuery = `
      SELECT 
        e.id, e.title, e.description, e.event_date, e.start_time, e.end_time,
        e.location, e.image_url, e.is_published, e.max_attendees,
        e.current_attendees, e.created_at, e.updated_at,
        c.name as category_name, c.id as category_id,
        u.username as created_by_username
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN users u ON e.created_by = u.id
      ${whereClause}
      ORDER BY e.event_date ASC, e.start_time ASC
      LIMIT ? OFFSET ?
    `;
    
    const [events] = await db.execute(eventsQuery, [...queryParams, limit, offset]);
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// Create event
router.post('/', authenticateToken, requireContentManager, validateEvent, handleValidationErrors, async (req, res) => {
  try {
    const {
      title, description, event_date, start_time, end_time, 
      location, category_id, image_url, is_published = false, max_attendees
    } = req.body;
    
    const eventId = uuidv4();
    
    await db.execute(`
      INSERT INTO events (
        id, title, description, event_date, start_time, end_time, 
        location, category_id, image_url, is_published, max_attendees, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      eventId, title, description, event_date, start_time, end_time,
      location, category_id, image_url, is_published, max_attendees, req.user.id
    ]);
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'CREATE_EVENT',
      entityType: 'event',
      entityId: eventId,
      details: `Created event: ${title}`,
      ipAddress: req.ip
    });

    // Get created event
    const [createdEvent] = await db.execute(`
      SELECT e.id, e.title, e.description, e.event_date, e.start_time, e.end_time,
             e.location, e.image_url, e.is_published, e.max_attendees,
             c.name as category_name, c.id as category_id
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `, [eventId]);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event: createdEvent[0] }
    });
    
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authenticateToken, requireContentManager, validateId, validateEvent, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, event_date, start_time, end_time, 
      location, category_id, image_url, is_published, max_attendees
    } = req.body;
    
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (event_date !== undefined) { updates.push('event_date = ?'); values.push(event_date); }
    if (start_time !== undefined) { updates.push('start_time = ?'); values.push(start_time); }
    if (end_time !== undefined) { updates.push('end_time = ?'); values.push(end_time); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
    if (image_url !== undefined) { updates.push('image_url = ?'); values.push(image_url); }
    if (is_published !== undefined) { updates.push('is_published = ?'); values.push(is_published); }
    if (max_attendees !== undefined) { updates.push('max_attendees = ?'); values.push(max_attendees); }
    
    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    
    values.push(id);
    await db.execute(`UPDATE events SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'UPDATE_EVENT',
      entityType: 'event',
      entityId: id,
      details: `Updated event: ${title || id}`,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Log action before deletion
    await logAction({
      userId: req.user.id,
      action: 'DELETE_EVENT',
      entityType: 'event',
      entityId: id,
      details: `Deleted event ID: ${id}`,
      ipAddress: req.ip
    });

    await db.execute('DELETE FROM events WHERE id = ?', [id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

// Register for event (authenticated users)
router.post('/:id/register', authenticateToken, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Log registration
    await logAction({
      userId: req.user.id,
      action: 'EVENT_REGISTRATION',
      entityType: 'event',
      entityId: id,
      details: 'User registered for event',
      ipAddress: req.ip
    });

    await db.execute('UPDATE events SET current_attendees = current_attendees + 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Successfully registered' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to register' });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const [events] = await db.execute(`
      SELECT id, title, description, event_date, start_time, end_time, location, image_url
      FROM events WHERE is_published = true AND event_date >= CURRENT_DATE
      ORDER BY event_date ASC, start_time ASC LIMIT ?
    `, [limit]);
    res.json({ success: true, data: { events } });
  } catch (error) {
    console.error('Upcoming events error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch' });
  }
});

// Get stats
router.get('/stats/overview', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published_events,
        SUM(CASE WHEN event_date >= CURRENT_DATE AND is_published = true THEN 1 ELSE 0 END) as upcoming_events,
        SUM(CASE WHEN event_date < CURRENT_DATE THEN 1 ELSE 0 END) as past_events,
        COALESCE(SUM(current_attendees), 0) as total_attendees
      FROM events
    `);
    res.json({ success: true, data: { overview: stats[0] } });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch' });
  }
});

module.exports = router;
