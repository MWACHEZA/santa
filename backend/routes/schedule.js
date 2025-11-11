const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireContentManager, optionalAuth } = require('../middleware/auth');
const { 
  validateMassSchedule, 
  validateId, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get mass schedule (public endpoint)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const dayOfWeek = req.query.day;
    const type = req.query.type || 'mass';
    const isActive = req.query.active !== 'false'; // Default to active only
    
    let whereConditions = [];
    let queryParams = [];
    
    // For non-authenticated users, only show active schedules
    if (!req.user || req.user.role === 'parishioner') {
      whereConditions.push('is_active = true');
    } else if (isActive) {
      whereConditions.push('is_active = ?');
      queryParams.push(true);
    }
    
    if (dayOfWeek) {
      whereConditions.push('day_of_week = ?');
      queryParams.push(dayOfWeek);
    }
    
    if (type) {
      whereConditions.push('type = ?');
      queryParams.push(type);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const [schedule] = await db.execute(`
      SELECT 
        s.id,
        s.day_of_week,
        s.time,
        s.language,
        s.type,
        s.is_active,
        s.created_at,
        s.updated_at,
        u.username as updated_by_username
      FROM mass_schedule s
      LEFT JOIN users u ON s.updated_by = u.id
      ${whereClause}
      ORDER BY 
        FIELD(s.day_of_week, 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'),
        s.time ASC
    `, queryParams);
    
    // Group by day of week for easier frontend consumption
    const groupedSchedule = schedule.reduce((acc, item) => {
      if (!acc[item.day_of_week]) {
        acc[item.day_of_week] = [];
      }
      acc[item.day_of_week].push(item);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        schedule: groupedSchedule,
        raw_schedule: schedule
      }
    });
    
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule'
    });
  }
});

// Get schedule for specific day
router.get('/day/:day', optionalAuth, async (req, res) => {
  try {
    const { day } = req.params;
    
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day of week'
      });
    }
    
    let whereCondition = 'day_of_week = ?';
    const queryParams = [day];
    
    // For non-authenticated users, only show active schedules
    if (!req.user || req.user.role === 'parishioner') {
      whereCondition += ' AND is_active = true';
    }
    
    const [schedule] = await db.execute(`
      SELECT 
        id,
        day_of_week,
        time,
        language,
        type,
        is_active,
        created_at,
        updated_at
      FROM mass_schedule
      WHERE ${whereCondition}
      ORDER BY time ASC
    `, queryParams);
    
    res.json({
      success: true,
      data: {
        day,
        schedule
      }
    });
    
  } catch (error) {
    console.error('Get schedule by day error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule for day'
    });
  }
});

// Get single schedule entry
router.get('/:id', optionalAuth, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    let whereCondition = 'id = ?';
    const queryParams = [id];
    
    // For non-authenticated users, only show active schedules
    if (!req.user || req.user.role === 'parishioner') {
      whereCondition += ' AND is_active = true';
    }
    
    const [schedule] = await db.execute(`
      SELECT 
        s.id,
        s.day_of_week,
        s.time,
        s.language,
        s.type,
        s.is_active,
        s.created_at,
        s.updated_at,
        u.username as updated_by_username
      FROM mass_schedule s
      LEFT JOIN users u ON s.updated_by = u.id
      WHERE ${whereCondition}
    `, queryParams);
    
    if (schedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule entry not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        schedule: schedule[0]
      }
    });
    
  } catch (error) {
    console.error('Get schedule by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule entry'
    });
  }
});

// Create schedule entry
router.post('/', authenticateToken, requireContentManager, validateMassSchedule, handleValidationErrors, async (req, res) => {
  try {
    const {
      day_of_week,
      time,
      language = 'english',
      type = 'mass',
      is_active = true
    } = req.body;
    
    // Check for duplicate schedule entry
    const [existingSchedule] = await db.execute(
      'SELECT id FROM mass_schedule WHERE day_of_week = ? AND time = ? AND type = ?',
      [day_of_week, time, type]
    );
    
    if (existingSchedule.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Schedule entry already exists for this day, time, and type'
      });
    }
    
    const scheduleId = uuidv4();
    
    await db.execute(`
      INSERT INTO mass_schedule (
        id, day_of_week, time, language, type, is_active, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [scheduleId, day_of_week, time, language, type, is_active, req.user.id]);
    
    // Get created schedule entry
    const [createdSchedule] = await db.execute(`
      SELECT 
        s.id,
        s.day_of_week,
        s.time,
        s.language,
        s.type,
        s.is_active,
        s.created_at,
        u.username as updated_by_username
      FROM mass_schedule s
      LEFT JOIN users u ON s.updated_by = u.id
      WHERE s.id = ?
    `, [scheduleId]);
    
    res.status(201).json({
      success: true,
      message: 'Schedule entry created successfully',
      data: {
        schedule: createdSchedule[0]
      }
    });
    
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create schedule entry'
    });
  }
});

// Update schedule entry
router.put('/:id', authenticateToken, requireContentManager, validateId, validateMassSchedule, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      day_of_week,
      time,
      language,
      type,
      is_active
    } = req.body;
    
    // Check if schedule entry exists
    const [existingSchedule] = await db.execute('SELECT id FROM mass_schedule WHERE id = ?', [id]);
    
    if (existingSchedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule entry not found'
      });
    }
    
    // Check for duplicate if updating key fields
    if (day_of_week && time && type) {
      const [duplicateSchedule] = await db.execute(
        'SELECT id FROM mass_schedule WHERE day_of_week = ? AND time = ? AND type = ? AND id != ?',
        [day_of_week, time, type, id]
      );
      
      if (duplicateSchedule.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Schedule entry already exists for this day, time, and type'
        });
      }
    }
    
    const updates = [];
    const values = [];
    
    if (day_of_week !== undefined) { updates.push('day_of_week = ?'); values.push(day_of_week); }
    if (time !== undefined) { updates.push('time = ?'); values.push(time); }
    if (language !== undefined) { updates.push('language = ?'); values.push(language); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    updates.push('updated_by = ?');
    values.push(req.user.id);
    values.push(id);
    
    await db.execute(
      `UPDATE mass_schedule SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Get updated schedule entry
    const [updatedSchedule] = await db.execute(`
      SELECT 
        s.id,
        s.day_of_week,
        s.time,
        s.language,
        s.type,
        s.is_active,
        s.created_at,
        s.updated_at,
        u.username as updated_by_username
      FROM mass_schedule s
      LEFT JOIN users u ON s.updated_by = u.id
      WHERE s.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Schedule entry updated successfully',
      data: {
        schedule: updatedSchedule[0]
      }
    });
    
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule entry'
    });
  }
});

// Delete schedule entry
router.delete('/:id', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if schedule entry exists
    const [existingSchedule] = await db.execute('SELECT id FROM mass_schedule WHERE id = ?', [id]);
    
    if (existingSchedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule entry not found'
      });
    }
    
    // Delete the schedule entry
    await db.execute('DELETE FROM mass_schedule WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Schedule entry deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule entry'
    });
  }
});

// Toggle schedule entry status
router.patch('/:id/toggle', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current status
    const [schedule] = await db.execute(
      'SELECT id, is_active FROM mass_schedule WHERE id = ?',
      [id]
    );
    
    if (schedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule entry not found'
      });
    }
    
    const newStatus = !schedule[0].is_active;
    
    // Update status
    await db.execute(
      'UPDATE mass_schedule SET is_active = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, req.user.id, id]
    );
    
    res.json({
      success: true,
      message: `Schedule entry ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: {
        is_active: newStatus
      }
    });
    
  } catch (error) {
    console.error('Toggle schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle schedule entry status'
    });
  }
});

// Bulk update schedule for a day
router.put('/day/:day/bulk', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const { day } = req.params;
    const { schedule } = req.body;
    
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day of week'
      });
    }
    
    if (!Array.isArray(schedule)) {
      return res.status(400).json({
        success: false,
        message: 'Schedule must be an array'
      });
    }
    
    // Start transaction
    const connection = await db.pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete existing schedule for the day
      await connection.execute('DELETE FROM mass_schedule WHERE day_of_week = ?', [day]);
      
      // Insert new schedule entries
      for (const entry of schedule) {
        const { time, language = 'english', type = 'mass', is_active = true } = entry;
        
        if (!time) {
          throw new Error('Time is required for each schedule entry');
        }
        
        const scheduleId = uuidv4();
        await connection.execute(`
          INSERT INTO mass_schedule (
            id, day_of_week, time, language, type, is_active, updated_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [scheduleId, day, time, language, type, is_active, req.user.id]);
      }
      
      await connection.commit();
      
      // Get updated schedule for the day
      const [updatedSchedule] = await db.execute(`
        SELECT 
          s.id,
          s.day_of_week,
          s.time,
          s.language,
          s.type,
          s.is_active,
          s.created_at,
          s.updated_at,
          u.username as updated_by_username
        FROM mass_schedule s
        LEFT JOIN users u ON s.updated_by = u.id
        WHERE s.day_of_week = ?
        ORDER BY s.time ASC
      `, [day]);
      
      res.json({
        success: true,
        message: `Schedule for ${day} updated successfully`,
        data: {
          day,
          schedule: updatedSchedule
        }
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Bulk update schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update schedule'
    });
  }
});

// Get schedule statistics (admin only)
router.get('/stats/overview', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_entries,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_entries,
        COUNT(DISTINCT day_of_week) as days_with_schedule,
        COUNT(DISTINCT type) as service_types
      FROM mass_schedule
    `);
    
    // Get schedule by day
    const [dayStats] = await db.execute(`
      SELECT 
        day_of_week,
        COUNT(*) as total_entries,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_entries
      FROM mass_schedule
      GROUP BY day_of_week
      ORDER BY FIELD(day_of_week, 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')
    `);
    
    // Get schedule by type
    const [typeStats] = await db.execute(`
      SELECT 
        type,
        COUNT(*) as total_entries,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_entries
      FROM mass_schedule
      GROUP BY type
      ORDER BY total_entries DESC
    `);
    
    // Get schedule by language
    const [languageStats] = await db.execute(`
      SELECT 
        language,
        COUNT(*) as total_entries,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_entries
      FROM mass_schedule
      GROUP BY language
      ORDER BY total_entries DESC
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats[0],
        dayStats,
        typeStats,
        languageStats
      }
    });
    
  } catch (error) {
    console.error('Get schedule stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule statistics'
    });
  }
});

module.exports = router;
