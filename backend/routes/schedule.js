const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all schedules
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM mass_schedules ORDER BY updated_at DESC');
    
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
      const [rows] = await db.execute('SELECT id FROM mass_schedules WHERE day = ?', [day]);
      
      if (rows.length === 0) {
        const id = uuidv4();
        await db.execute(
          'INSERT INTO mass_schedules (id, day, times, language) VALUES (?, ?, ?, ?)',
          [id, day, times, language]
        );
      } else {
        await db.execute(
          'UPDATE mass_schedules SET times = ?, language = ?, updated_at = CURRENT_TIMESTAMP WHERE day = ?',
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

module.exports = router;
