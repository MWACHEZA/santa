const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireContentManager } = require('../middleware/auth');
const { 
  validateContactInfo, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get contact information (public endpoint)
router.get('/', async (req, res) => {
  try {
    const [contactInfo] = await db.execute(`
      SELECT 
        phone,
        email,
        address,
        emergency_contact,
        office_hours_weekday,
        office_hours_saturday,
        office_hours_sunday,
        updated_at
      FROM contact_info
      ORDER BY updated_at DESC
      LIMIT 1
    `);
    
    if (contactInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact information not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        contact: contactInfo[0]
      }
    });
    
  } catch (error) {
    console.error('Get contact info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information'
    });
  }
});

// Update contact information (admin only)
router.put('/', authenticateToken, requireContentManager, validateContactInfo, handleValidationErrors, async (req, res) => {
  try {
    const {
      phone,
      email,
      address,
      emergency_contact,
      office_hours_weekday,
      office_hours_saturday,
      office_hours_sunday
    } = req.body;
    
    // Check if contact info exists
    const [existingContact] = await db.execute('SELECT id FROM contact_info LIMIT 1');
    
    if (existingContact.length === 0) {
      // Create new contact info
      const contactId = uuidv4();
      await db.execute(`
        INSERT INTO contact_info (
          id, phone, email, address, emergency_contact,
          office_hours_weekday, office_hours_saturday, office_hours_sunday,
          updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        contactId, phone, email, address, emergency_contact,
        office_hours_weekday, office_hours_saturday, office_hours_sunday,
        req.user.id
      ]);
    } else {
      // Update existing contact info
      const updates = [];
      const values = [];
      
      if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
      if (email !== undefined) { updates.push('email = ?'); values.push(email); }
      if (address !== undefined) { updates.push('address = ?'); values.push(address); }
      if (emergency_contact !== undefined) { updates.push('emergency_contact = ?'); values.push(emergency_contact); }
      if (office_hours_weekday !== undefined) { updates.push('office_hours_weekday = ?'); values.push(office_hours_weekday); }
      if (office_hours_saturday !== undefined) { updates.push('office_hours_saturday = ?'); values.push(office_hours_saturday); }
      if (office_hours_sunday !== undefined) { updates.push('office_hours_sunday = ?'); values.push(office_hours_sunday); }
      
      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }
      
      updates.push('updated_by = ?');
      values.push(req.user.id);
      values.push(existingContact[0].id);
      
      await db.execute(
        `UPDATE contact_info SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
    }
    
    // Get updated contact info
    const [updatedContact] = await db.execute(`
      SELECT 
        phone,
        email,
        address,
        emergency_contact,
        office_hours_weekday,
        office_hours_saturday,
        office_hours_sunday,
        updated_at,
        u.username as updated_by_username
      FROM contact_info c
      LEFT JOIN users u ON c.updated_by = u.id
      ORDER BY c.updated_at DESC
      LIMIT 1
    `);
    
    res.json({
      success: true,
      message: 'Contact information updated successfully',
      data: {
        contact: updatedContact[0]
      }
    });
    
  } catch (error) {
    console.error('Update contact info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact information'
    });
  }
});

// Get contact history (admin only)
router.get('/history', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const [history] = await db.execute(`
      SELECT 
        phone,
        email,
        address,
        emergency_contact,
        office_hours_weekday,
        office_hours_saturday,
        office_hours_sunday,
        updated_at,
        u.username as updated_by_username
      FROM contact_info c
      LEFT JOIN users u ON c.updated_by = u.id
      ORDER BY c.updated_at DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        history
      }
    });
    
  } catch (error) {
    console.error('Get contact history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact history'
    });
  }
});

module.exports = router;
