const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all schedules
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM mass_schedule ORDER BY updated_at DESC');
    
    // Transform to frontend format (array of days)
    // The frontend expects: { day: 'Sunday', times: [...], language: '...' }
    // We'll map them by day to ensure we return what the frontend expects
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const scheduleMap = {};
    
    rows.forEach(row => {
      scheduleMap[row.day] = {
        id: row.id,
        day: row.day,
        times: row.times,
        language: row.language
      };
    });

    const finalSchedule = days.map(day => {
      return scheduleMap[day] || { day, times: [], language: '' };
    });

    res.json({
      success: true,
      data: finalSchedule
    });
  } catch (error) {
    console.error('Fetch schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mass schedule'
    });
  }
});

// Update bulk schedule
router.put('/bulk', authenticateToken, async (req, res) => {
  try {
    const { schedules } = req.body; // Array of { day, times, language }
    
    if (!Array.isArray(schedules)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule data'
      });
    }

    for (const item of schedules) {
      const { day, times, language } = item;
      
      // Check if exists
      const [rows] = await db.execute('SELECT id FROM mass_schedule WHERE day = ?', [day]);
      
      if (rows.length === 0) {
        const id = uuidv4();
        await db.execute(
          'INSERT INTO mass_schedule (id, day, times, language) VALUES (?, ?, ?, ?)',
          [id, day, times, language]
        );
      } else {
        await db.execute(
          'UPDATE mass_schedule SET times = ?, language = ?, updated_at = CURRENT_TIMESTAMP WHERE day = ?',
          [times, language, day]
        );
      }
    }

    res.json({
      success: true,
      message: 'Mass schedule updated successfully'
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mass schedule'
    });
  }
});
// Create a new schedule
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { day, times, language } = req.body;
    
    // Check if day already exists
    const [existing] = await db.execute('SELECT id FROM mass_schedule WHERE day = ?', [day]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Schedule for this day already exists' });
    }

    const id = uuidv4();
    await db.execute(
      'INSERT INTO mass_schedule (id, day, times, language) VALUES (?, ?, ?, ?)',
      [id, day, JSON.stringify(times), language]
    );

    res.json({ success: true, message: 'Schedule created successfully', data: { id, day, times, language } });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to create schedule' });
  }
});

// Update a schedule
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { day, times, language } = req.body;

    // Check if another record has the same day
    const [existing] = await db.execute('SELECT id FROM mass_schedule WHERE day = ? AND id != ?', [day, id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Schedule for this day already exists' });
    }

    await db.execute(
      'UPDATE mass_schedule SET day = ?, times = ?, language = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [day, JSON.stringify(times), language, id]
    );

    res.json({ success: true, message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
});

// Delete a schedule
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM mass_schedule WHERE id = ?', [id]);
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete schedule' });
  }
});

module.exports = router;
