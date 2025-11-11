const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
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
      whereConditions.push('e.event_date >= CURDATE()');
    } else if (past) {
      whereConditions.push('e.event_date < CURDATE()');
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
    const total = countResult[0].total;
    
    // Get events with pagination
    const eventsQuery = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.image_url,
        e.is_published,
        e.max_attendees,
        e.current_attendees,
        e.created_at,
        e.updated_at,
        c.name as category_name,
        c.id as category_id,
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

// Get upcoming events (public endpoint)
router.get('/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const [events] = await db.execute(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.image_url,
        e.max_attendees,
        e.current_attendees,
        c.name as category_name
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.is_published = true 
        AND e.event_date >= CURDATE()
      ORDER BY e.event_date ASC, e.start_time ASC
      LIMIT ?
    `, [limit]);
    
    res.json({
      success: true,
      data: {
        events
      }
    });
    
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events'
    });
  }
});

// Get single event
router.get('/:id', optionalAuth, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    let whereCondition = 'e.id = ?';
    const queryParams = [id];
    
    // For non-authenticated users or non-admin users, only show published events
    if (!req.user || req.user.role === 'parishioner') {
      whereCondition += ' AND e.is_published = true';
    }
    
    const [events] = await db.execute(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.image_url,
        e.is_published,
        e.max_attendees,
        e.current_attendees,
        e.created_at,
        e.updated_at,
        c.name as category_name,
        c.id as category_id,
        u.username as created_by_username
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE ${whereCondition}
    `, queryParams);
    
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        event: events[0]
      }
    });
    
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
});

// Create event
router.post('/', authenticateToken, requireContentManager, validateEvent, handleValidationErrors, async (req, res) => {
  try {
    const {
      title,
      description,
      event_date,
      start_time,
      end_time,
      location,
      category_id,
      image_url,
      is_published = false,
      max_attendees
    } = req.body;
    
    // Validate category if provided
    if (category_id) {
      const [categories] = await db.execute(
        'SELECT id FROM categories WHERE id = ? AND type = "event" AND is_active = true',
        [category_id]
      );
      
      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }
    
    // Validate time range
    if (start_time && end_time && start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }
    
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
    
    // Get created event
    const [createdEvent] = await db.execute(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.image_url,
        e.is_published,
        e.max_attendees,
        e.current_attendees,
        e.created_at,
        c.name as category_name,
        c.id as category_id
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `, [eventId]);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event: createdEvent[0]
      }
    });
    
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

// Update event
router.put('/:id', authenticateToken, requireContentManager, validateId, validateEvent, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      event_date,
      start_time,
      end_time,
      location,
      category_id,
      image_url,
      is_published,
      max_attendees
    } = req.body;
    
    // Check if event exists
    const [existingEvents] = await db.execute('SELECT id FROM events WHERE id = ?', [id]);
    
    if (existingEvents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Validate category if provided
    if (category_id) {
      const [categories] = await db.execute(
        'SELECT id FROM categories WHERE id = ? AND type = "event" AND is_active = true',
        [category_id]
      );
      
      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }
    
    // Validate time range
    if (start_time && end_time && start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }
    
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
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    values.push(id);
    
    await db.execute(
      `UPDATE events SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Get updated event
    const [updatedEvent] = await db.execute(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.image_url,
        e.is_published,
        e.max_attendees,
        e.current_attendees,
        e.created_at,
        e.updated_at,
        c.name as category_name,
        c.id as category_id
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event: updatedEvent[0]
      }
    });
    
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
});

// Delete event
router.delete('/:id', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if event exists
    const [existingEvents] = await db.execute('SELECT id FROM events WHERE id = ?', [id]);
    
    if (existingEvents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Delete the event
    await db.execute('DELETE FROM events WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
});

// Register for event (authenticated users)
router.post('/:id/register', authenticateToken, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get event details
    const [events] = await db.execute(`
      SELECT id, title, max_attendees, current_attendees, event_date, is_published
      FROM events 
      WHERE id = ? AND is_published = true
    `, [id]);
    
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or not published'
      });
    }
    
    const event = events[0];
    
    // Check if event is in the future
    if (new Date(event.event_date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      });
    }
    
    // Check if event has space
    if (event.max_attendees && event.current_attendees >= event.max_attendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }
    
    // Update attendee count
    await db.execute(
      'UPDATE events SET current_attendees = current_attendees + 1 WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        event_id: id,
        event_title: event.title
      }
    });
    
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event'
    });
  }
});

// Get events by date range
router.get('/date-range/:start/:end', optionalAuth, async (req, res) => {
  try {
    const { start, end } = req.params;
    
    // Validate dates
    if (!Date.parse(start) || !Date.parse(end)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    let whereCondition = 'e.event_date BETWEEN ? AND ?';
    const queryParams = [start, end];
    
    // For non-authenticated users, only show published events
    if (!req.user || req.user.role === 'parishioner') {
      whereCondition += ' AND e.is_published = true';
    }
    
    const [events] = await db.execute(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.image_url,
        e.max_attendees,
        e.current_attendees,
        c.name as category_name
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE ${whereCondition}
      ORDER BY e.event_date ASC, e.start_time ASC
    `, queryParams);
    
    res.json({
      success: true,
      data: {
        events,
        date_range: { start, end }
      }
    });
    
  } catch (error) {
    console.error('Get events by date range error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// Get event statistics (admin only)
router.get('/stats/overview', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published_events,
        SUM(CASE WHEN event_date >= CURDATE() AND is_published = true THEN 1 ELSE 0 END) as upcoming_events,
        SUM(CASE WHEN event_date < CURDATE() THEN 1 ELSE 0 END) as past_events,
        SUM(current_attendees) as total_attendees,
        AVG(current_attendees) as avg_attendees_per_event
      FROM events
    `);
    
    // Get events by category
    const [categoryStats] = await db.execute(`
      SELECT 
        c.name as category_name,
        COUNT(e.id) as event_count,
        SUM(e.current_attendees) as total_attendees
      FROM categories c
      LEFT JOIN events e ON c.id = e.category_id AND e.is_published = true
      WHERE c.type = 'event' AND c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY event_count DESC
    `);
    
    // Get monthly event distribution
    const [monthlyStats] = await db.execute(`
      SELECT 
        DATE_FORMAT(event_date, '%Y-%m') as month,
        COUNT(*) as event_count,
        SUM(current_attendees) as total_attendees
      FROM events
      WHERE event_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(event_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);
    
    // Get most popular events
    const [popularEvents] = await db.execute(`
      SELECT 
        id,
        title,
        event_date,
        current_attendees,
        max_attendees,
        CASE 
          WHEN max_attendees > 0 THEN (current_attendees / max_attendees * 100)
          ELSE NULL
        END as attendance_percentage
      FROM events
      WHERE is_published = true
      ORDER BY current_attendees DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats[0],
        categoryStats,
        monthlyStats,
        popularEvents
      }
    });
    
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event statistics'
    });
  }
});

module.exports = router;
