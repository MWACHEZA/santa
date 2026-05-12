const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { logAction } = require('../utils/logger');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all themes
router.get('/', async (req, res) => {
  try {
    const [themes] = await db.execute('SELECT * FROM themes_of_year ORDER BY year DESC, created_at DESC');
    res.json({
      success: true,
      data: themes
    });
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch themes' });
  }
});

// Get active theme
router.get('/active', async (req, res) => {
  try {
    const [themes] = await db.execute('SELECT * FROM themes_of_year WHERE is_active = true LIMIT 1');
    res.json({
      success: true,
      data: themes[0] || null
    });
  } catch (error) {
    console.error('Get active theme error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active theme' });
  }
});

// Create theme (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { year, title, subtitle, verse, description, imageUrl, isActive } = req.body;
    
    // If setting as active, deactivate all other themes
    if (isActive) {
      await db.execute('UPDATE themes_of_year SET is_active = false');
    }
    
    const themeId = uuidv4();
    await db.execute(`
      INSERT INTO themes_of_year (
        id, year, title, subtitle, verse, description, image_url, is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      themeId, 
      year || new Date().getFullYear(), 
      title, 
      subtitle || null, 
      verse || null, 
      description || null, 
      imageUrl || null, 
      isActive === true, 
      req.user.id
    ]);
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'CREATE_THEME',
      entityType: 'theme',
      entityId: themeId,
      details: `Created theme of the year: ${title}`,
      ipAddress: req.ip
    });
    
    const [newTheme] = await db.execute('SELECT * FROM themes_of_year WHERE id = ?', [themeId]);
    
    res.status(201).json({
      success: true,
      data: newTheme[0]
    });
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ success: false, message: 'Failed to create theme' });
  }
});

// Update theme (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { year, title, subtitle, verse, description, imageUrl, isActive } = req.body;
    
    const updates = [];
    const params = [];
    
    if (year !== undefined) { updates.push('year = ?'); params.push(year); }
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (subtitle !== undefined) { updates.push('subtitle = ?'); params.push(subtitle); }
    if (verse !== undefined) { updates.push('verse = ?'); params.push(verse); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (imageUrl !== undefined) { updates.push('image_url = ?'); params.push(imageUrl); }
    
    if (isActive !== undefined) {
      if (isActive) {
        // If activating this theme, deactivate all others
        await db.execute('UPDATE themes_of_year SET is_active = false');
      }
      updates.push('is_active = ?');
      params.push(isActive);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    
    params.push(id);
    await db.execute(`UPDATE themes_of_year SET ${updates.join(', ')} WHERE id = ?`, params);
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'UPDATE_THEME',
      entityType: 'theme',
      entityId: id,
      details: `Updated theme ID: ${id}`,
      ipAddress: req.ip
    });
    
    const [updatedTheme] = await db.execute('SELECT * FROM themes_of_year WHERE id = ?', [id]);
    
    res.json({
      success: true,
      data: updatedTheme[0]
    });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ success: false, message: 'Failed to update theme' });
  }
});

// Delete theme (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM themes_of_year WHERE id = ?', [id]);
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'DELETE_THEME',
      entityType: 'theme',
      entityId: id,
      details: `Deleted theme ID: ${id}`,
      ipAddress: req.ip
    });
    res.json({ success: true, message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete theme' });
  }
});

module.exports = router;
