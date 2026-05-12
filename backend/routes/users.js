const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const { 
  validateUserRegistration, 
  validateUserUpdate, 
  validateId, 
  validatePagination, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const role = req.query.role;
    const isActive = req.query.active;
    const search = req.query.search;
    
    let whereConditions = [];
    let queryParams = [];
    
    if (role) {
      whereConditions.push('role = ?');
      queryParams.push(role);
    }
    
    if (isActive !== undefined) {
      whereConditions.push('is_active = ?');
      queryParams.push(isActive === 'true');
    }
    
    if (search) {
      whereConditions.push('(username ILIKE ? OR email ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = parseInt(countResult[0].total);
    
    // Get users with pagination
    const usersQuery = `
      SELECT 
        id,
        username,
        email,
        role,
        is_active as "isActive",
        first_name as "firstName",
        last_name as "lastName",
        phone,
        association_id as "associationId",
        created_at as "createdAt",
        updated_at as "updatedAt",
        last_login as "lastLogin"
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [users] = await db.execute(usersQuery, [...queryParams, limit, offset]);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get single user (admin only)
router.get('/:id', authenticateToken, requireAdmin, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await db.execute(`
      SELECT 
        id,
        username,
        email,
        role,
        is_active as "isActive",
        must_change_password as "mustChangePassword",
        first_name as "firstName",
        last_name as "lastName",
        phone,
        association,
        committee_position as "committeePosition",
        created_at as "createdAt",
        updated_at as "updatedAt",
        last_login as "lastLogin"
      FROM users
      WHERE id = ?
    `, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });
    
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Create user (admin only)
router.post('/', authenticateToken, requireAdmin, validateUserRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { 
      username, email, password, role = 'parishioner',
      firstName, lastName, phone, association, committeePosition 
    } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const userId = uuidv4();
    await db.execute(
      `INSERT INTO users (
        id, username, email, password_hash, role, 
        first_name, last_name, phone, association, committee_position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, username, email, hashedPassword, role,
        firstName || null, lastName || null, phone || null, 
        association || null, committeePosition || null
      ]
    );
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: userId,
      details: `Created user: ${username} with role ${role}`,
      ipAddress: req.ip
    });

    // Get created user (without password)
    const [newUser] = await db.execute(
      'SELECT id, username, email, role, is_active as "isActive", created_at as "createdAt" FROM users WHERE id = ?',
      [userId]
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser[0]
      }
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateId, validateUserUpdate, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      username, email, role, isActive,
      firstName, lastName, phone, association, committeePosition 
    } = req.body;
    
    // Check if user exists
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if username or email is already taken by another user
    if (username || email) {
      const conditions = [];
      const params = [];
      
      if (username) {
        conditions.push('username = ?');
        params.push(username);
      }
      
      if (email) {
        conditions.push('email = ?');
        params.push(email);
      }
      
      params.push(id);
      
      const [duplicateUsers] = await db.execute(
        `SELECT id FROM users WHERE (${conditions.join(' OR ')}) AND id != ?`,
        params
      );
      
      if (duplicateUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
      }
    }
    
    const updates = [];
    const values = [];
    
    if (username !== undefined) { updates.push('username = ?'); values.push(username); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive); }
    if (firstName !== undefined) { updates.push('first_name = ?'); values.push(firstName); }
    if (lastName !== undefined) { updates.push('last_name = ?'); values.push(lastName); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (association !== undefined) { updates.push('association = ?'); values.push(association); }
    if (committeePosition !== undefined) { updates.push('committee_position = ?'); values.push(committeePosition); }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    values.push(id);
    
    await db.execute(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'UPDATE_USER',
      entityType: 'user',
      entityId: id,
      details: `Updated user info for: ${username || id}`,
      ipAddress: req.ip
    });

    // Get updated user
    const [updatedUser] = await db.execute(`
      SELECT 
        id, username, email, role, is_active as "isActive",
        first_name as "firstName", last_name as "lastName", phone,
        association, committee_position as "committeePosition",
        created_at as "createdAt", updated_at as "updatedAt", last_login as "lastLogin"
      FROM users
      WHERE id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser[0]
      }
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Reset user password (admin only)
router.patch('/:id/reset-password', authenticateToken, requireAdmin, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }
    
    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await db.execute(
      'UPDATE users SET password_hash = ?, must_change_password = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'RESET_PASSWORD',
      entityType: 'user',
      entityId: id,
      details: 'Admin reset user password',
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// Toggle user status (admin only)
router.patch('/:id/toggle', authenticateToken, requireAdmin, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot deactivate yourself' });
    
    const [users] = await db.execute('SELECT is_active, username FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    
    const newStatus = !users[0].is_active;
    await db.execute('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'TOGGLE_USER_STATUS',
      entityType: 'user',
      entityId: id,
      details: `User ${users[0].username} ${newStatus ? 'activated' : 'deactivated'}`,
      ipAddress: req.ip
    });

    res.json({ success: true, message: `User ${newStatus ? 'activated' : 'deactivated'}` });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle status' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    
    const [users] = await db.execute('SELECT username FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    // Check for created content
    const news = await db.execute('SELECT COUNT(*) as count FROM news WHERE created_by = ?', [id]);
    const events = await db.execute('SELECT COUNT(*) as count FROM events WHERE created_by = ?', [id]);
    if (parseInt(news[0][0].count) + parseInt(events[0][0].count) > 0) {
      return res.status(400).json({ success: false, message: 'User has created content. Deactivate them instead.' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    
    // Log action
    await logAction({
      userId: req.user.id,
      action: 'DELETE_USER',
      entityType: 'user',
      entityId: id,
      details: `Deleted user: ${users[0].username}`,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN last_login IS NOT NULL THEN 1 ELSE 0 END) as users_with_login,
        SUM(CASE WHEN last_login >= (NOW() - INTERVAL '30 days') THEN 1 ELSE 0 END) as active_last_30_days
      FROM users
    `);
    
    const [roleStats] = await db.execute(`
      SELECT role, COUNT(*) as total, SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active
      FROM users GROUP BY role ORDER BY total DESC
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats[0],
        roleStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
