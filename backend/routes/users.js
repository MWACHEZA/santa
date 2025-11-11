const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
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
      whereConditions.push('(username LIKE ? OR email LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get users with pagination
    const usersQuery = `
      SELECT 
        id,
        username,
        email,
        role,
        is_active,
        created_at,
        updated_at,
        last_login
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
        is_active,
        created_at,
        updated_at,
        last_login
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
    const { username, email, password, role = 'parishioner' } = req.body;
    
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
      'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, role]
    );
    
    // Get created user (without password)
    const [newUser] = await db.execute(
      'SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?',
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
    const { username, email, role, is_active } = req.body;
    
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
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    
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
    
    // Get updated user
    const [updatedUser] = await db.execute(`
      SELECT 
        id,
        username,
        email,
        role,
        is_active,
        created_at,
        updated_at,
        last_login
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
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user exists
    const [existingUsers] = await db.execute('SELECT id, username FROM users WHERE id = ?', [id]);
    
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await db.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        username: existingUsers[0].username
      }
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// Toggle user status (admin only)
router.patch('/:id/toggle', authenticateToken, requireAdmin, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deactivating themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }
    
    // Get current status
    const [users] = await db.execute(
      'SELECT id, username, is_active FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    const newStatus = !user.is_active;
    
    // Update status
    await db.execute(
      'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: {
        username: user.username,
        is_active: newStatus
      }
    });
    
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    // Check if user exists
    const [existingUsers] = await db.execute('SELECT id, username FROM users WHERE id = ?', [id]);
    
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has created content
    const [newsCount] = await db.execute('SELECT COUNT(*) as count FROM news WHERE created_by = ?', [id]);
    const [eventsCount] = await db.execute('SELECT COUNT(*) as count FROM events WHERE created_by = ?', [id]);
    const [announcementsCount] = await db.execute('SELECT COUNT(*) as count FROM announcements WHERE created_by = ?', [id]);
    
    const totalContent = newsCount[0].count + eventsCount[0].count + announcementsCount[0].count;
    
    if (totalContent > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user. They have created ${totalContent} content item(s). Please reassign or delete their content first.`,
        data: {
          content_count: {
            news: newsCount[0].count,
            events: eventsCount[0].count,
            announcements: announcementsCount[0].count
          }
        }
      });
    }
    
    // Delete the user
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        username: existingUsers[0].username
      }
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get users by role (admin only)
router.get('/role/:role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.params;
    
    const validRoles = ['admin', 'priest', 'secretary', 'reporter', 'vice_secretary', 'parishioner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const [users] = await db.execute(`
      SELECT 
        id,
        username,
        email,
        role,
        is_active,
        created_at,
        last_login
      FROM users
      WHERE role = ?
      ORDER BY username ASC
    `, [role]);
    
    res.json({
      success: true,
      data: {
        role,
        users
      }
    });
    
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users by role'
    });
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
        SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active_last_30_days
      FROM users
    `);
    
    // Get users by role
    const [roleStats] = await db.execute(`
      SELECT 
        role,
        COUNT(*) as total,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active
      FROM users
      GROUP BY role
      ORDER BY total DESC
    `);
    
    // Get recent registrations
    const [recentUsers] = await db.execute(`
      SELECT 
        id,
        username,
        email,
        role,
        is_active,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    // Get login activity
    const [loginActivity] = await db.execute(`
      SELECT 
        DATE(last_login) as login_date,
        COUNT(DISTINCT id) as unique_logins
      FROM users
      WHERE last_login >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(last_login)
      ORDER BY login_date DESC
      LIMIT 30
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats[0],
        roleStats,
        recentUsers,
        loginActivity
      }
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

module.exports = router;
