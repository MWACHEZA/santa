const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Admin-only registration (for creating staff accounts)
router.post('/users', authenticateToken, requireAdmin, validateUserRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      role = 'parishioner',
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
      emergencyContact,
      emergencyPhone
    } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ? OR (phone IS NOT NULL AND phone = ?)',
      [username, email, phone]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, or phone number already exists'
      });
    }
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const userId = uuidv4();
    await db.execute(
      `INSERT INTO users (
        id, username, email, phone, password_hash, first_name, last_name, 
        date_of_birth, address, emergency_contact, emergency_phone, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, username, email, phone, hashedPassword, firstName, lastName,
        dateOfBirth, address, emergencyContact, emergencyPhone, role
      ]
    );
    
    // Get created user (without password)
    const [newUser] = await db.execute(
      `SELECT id, username, email, phone, first_name, last_name, 
       role, is_active, created_at FROM users WHERE id = ?`,
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
    console.error('Admin user creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, active } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }
    
    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (active !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(active === 'true');
    }
    
    // Get users
    const [users] = await db.execute(
      `SELECT id, username, email, phone, first_name, last_name, role, 
       is_active, created_at, last_login 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    
    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages
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

// Update user (admin only)
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      username, 
      email, 
      phone,
      firstName,
      lastName,
      role,
      isActive,
      dateOfBirth,
      address,
      emergencyContact,
      emergencyPhone
    } = req.body;
    
    // Check if user exists
    const [existingUser] = await db.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check for conflicts with other users
    const [conflicts] = await db.execute(
      'SELECT id FROM users WHERE (username = ? OR email = ? OR (phone IS NOT NULL AND phone = ?)) AND id != ?',
      [username, email, phone, id]
    );
    
    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, or phone number already exists'
      });
    }
    
    // Update user
    await db.execute(
      `UPDATE users SET 
       username = ?, email = ?, phone = ?, first_name = ?, last_name = ?, 
       role = ?, is_active = ?, date_of_birth = ?, address = ?, 
       emergency_contact = ?, emergency_phone = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        username, email, phone, firstName, lastName, role, isActive,
        dateOfBirth, address, emergencyContact, emergencyPhone, id
      ]
    );
    
    // Get updated user
    const [updatedUser] = await db.execute(
      `SELECT id, username, email, phone, first_name, last_name, 
       role, is_active, created_at, updated_at FROM users WHERE id = ?`,
      [id]
    );
    
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
router.patch('/users/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    const [result] = await db.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// Toggle user active status (admin only)
router.patch('/users/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Toggle active status
    const [result] = await db.execute(
      'UPDATE users SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get updated user
    const [updatedUser] = await db.execute(
      'SELECT id, username, email, is_active FROM users WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: `User ${updatedUser[0].is_active ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: updatedUser[0]
      }
    });
    
  } catch (error) {
    console.error('Toggle user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists and is not the current admin
    const [user] = await db.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deleting the last admin
    if (user[0].role === 'admin') {
      const [adminCount] = await db.execute(
        'SELECT COUNT(*) as count FROM users WHERE role = "admin" AND is_active = true'
      );
      
      if (adminCount[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last active admin user'
        });
      }
    }
    
    // Delete user
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get user statistics (admin only)
router.get('/users/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
        SUM(CASE WHEN role = 'parishioner' THEN 1 ELSE 0 END) as parishioner_users,
        SUM(CASE WHEN role IN ('priest', 'secretary', 'reporter', 'vice_secretary') THEN 1 ELSE 0 END) as staff_users,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_30_days,
        SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as active_users_7_days
      FROM users
    `);
    
    res.json({
      success: true,
      data: {
        stats: stats[0]
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
