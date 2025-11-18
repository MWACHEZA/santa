const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database-simple');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserLogin, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

const USER_SELECT_FIELDS = `
  u.id,
  u.user_number AS userNumber,
  u.username,
  u.email,
  u.phone,
  u.first_name AS firstName,
  u.last_name AS lastName,
  u.middle_name AS middleName,
  u.date_of_birth AS dateOfBirth,
  u.gender,
  u.address,
  u.emergency_contact AS emergencyContact,
  u.emergency_phone AS emergencyPhone,
  u.role,
  u.is_active AS isActive,
  u.email_verified AS emailVerified,
  u.created_at AS createdAt,
  u.updated_at AS updatedAt,
  u.last_login AS lastLogin,
  COALESCE(up.association, a.name) AS association,
  COALESCE(up.section, s.name) AS section,
  up.is_baptized AS isBaptized,
  up.baptism_date AS baptismDate,
  up.baptism_venue AS baptismVenue,
  up.is_confirmed AS isConfirmed,
  up.confirmation_date AS confirmationDate,
  up.confirmation_venue AS confirmationVenue,
  up.receives_communion AS receivesCommunion,
  up.first_communion_date AS firstCommunionDate,
  up.is_married AS isMarried,
  up.marriage_date AS marriageDate,
  up.marriage_venue AS marriageVenue,
  up.spouse_name AS spouseName,
  up.ordination_date AS ordinationDate,
  up.ordination_venue AS ordinationVenue,
  up.ordained_by AS ordainedBy,
  mf.file_url AS profilePictureUrl,
  u.password_hash AS passwordHash
`;

const USER_JOINS = `
  LEFT JOIN sections s ON u.section_id = s.id
  LEFT JOIN associations a ON u.association_id = a.id
  LEFT JOIN user_profiles up ON up.user_id = u.id
  LEFT JOIN media_files mf ON u.profile_picture_id = mf.id
`;

const BASE_USER_QUERY = `
  SELECT
${USER_SELECT_FIELDS}
  FROM users u
${USER_JOINS}
`;

const normalizeNullableValue = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  return value === '' ? null : value;
};

const toNullableBoolean = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['true', '1'].includes(normalized)) return true;
    if (['false', '0'].includes(normalized)) return false;
  }
  return null;
};

// --- multer setup for public registration uploads ---
const ensureDir = async (p) => { try { await fs.access(p); } catch { await fs.mkdir(p, { recursive: true }); } };
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only images are allowed for profile pictures'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  
  return { accessToken, refreshToken };
};

// Register new user (public registration for parishioners)
router.post('/register', upload.single('profilePicture'), validateUserRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      role = 'parishioner',
      firstName,
      lastName,
      middleName,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      emergencyPhone,
      section,
      association,
      profilePicture
    } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ? OR phone = ?',
      [username, email, phone || null]
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
    
    // Generate user ID first
    const userId = uuidv4();
    let sectionId = null;
    let associationId = null;
    
    // Handle profile picture if supplied (but save after user is created)
    let profilePictureId = null;
    let fileName = null;
    let filePath = null;
    let relativePath = null;
    
    if (req.file) {
      const uploadBase = process.env.UPLOAD_PATH || './uploads';
      const profileDir = path.join(uploadBase, 'profiles');
      await ensureDir(profileDir);

      const ext = path.extname(req.file.originalname);
      fileName = `${userId}${ext}`;
      filePath = path.join(profileDir, fileName);

      // Resize & save image
      const processedBuffer = await sharp(req.file.buffer)
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();
      await fs.writeFile(filePath, processedBuffer);

      // Generate media file ID but don't insert yet
      profilePictureId = uuidv4();
      relativePath = path.relative(uploadBase, filePath);
    }
    
    if (section) {
      const [sectionResult] = await db.execute('SELECT id FROM sections WHERE name = ?', [section]);
      if (sectionResult.length > 0) {
        sectionId = sectionResult[0].id;
      }
    }
    
    if (association) {
      const [associationResult] = await db.execute('SELECT id FROM associations WHERE name = ?', [association]);
      if (associationResult.length > 0) {
        associationId = associationResult[0].id;
      }
    }

    await db.execute(
      `INSERT INTO users (
        id, username, email, phone, password_hash, first_name, last_name, middle_name,
        date_of_birth, gender, address, emergency_contact, emergency_phone, 
        section_id, association_id, role, is_active, email_verified, profile_picture_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, username, email, phone || null, hashedPassword, firstName || null, lastName || null, middleName || null,
        dateOfBirth || null, gender || null, address || null, emergencyContact || null, 
        emergencyPhone || null, sectionId, associationId, role, true, false, null // profile_picture_id will be updated later
      ]
    );
    
    await db.execute(
      `INSERT INTO user_profiles (user_id, association, section)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         association = VALUES(association),
         section = VALUES(section)`,
      [userId, association || null, section || null]
    );
    
    // Now insert the media file record (after user is created)
    if (profilePictureId && fileName && filePath && relativePath) {
      await db.execute(
        `INSERT INTO media_files (id, filename, original_filename, file_path, file_type, mime_type, file_size, uploaded_by, is_public)
         VALUES (?, ?, ?, ?, 'image', ?, ?, ?, true)`,
        [profilePictureId, fileName, req.file.originalname, relativePath, req.file.mimetype, req.file.size, userId]
      );
      
      // Update user with profile picture ID
      await db.execute(
        'UPDATE users SET profile_picture_id = ? WHERE id = ?',
        [profilePictureId, userId]
      );
    }
    
    // Get created user (with profile picture URL)
    const [newUser] = await db.execute(
      `${BASE_USER_QUERY}
       WHERE u.id = ?`,
      [userId]
    );
    
    if (newUser[0]) {
      delete newUser[0].passwordHash;
    }
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser[0]
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', validateUserLogin, handleValidationErrors, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Get user with password (support username, email, or phone)
    const [users] = await db.execute(
      `${BASE_USER_QUERY}
       WHERE u.username = ? OR u.email = ? OR u.phone = ?`,
      [username, username, username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const user = users[0];
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    await db.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Remove password from response
    delete user.passwordHash;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token: accessToken,
        refreshToken
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Get user
    const [users] = await db.execute(
      'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      `${BASE_USER_QUERY}
       WHERE u.id = ?`,
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    if (user) {
      delete user.passwordHash;
    }
    
    res.json({
      success: true,
      data: {
        user
      }
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      email,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      emergencyPhone,
      association,
      section,
      isBaptized,
      baptismDate,
      baptismVenue,
      isConfirmed,
      confirmationDate,
      confirmationVenue,
      receivesCommunion,
      firstCommunionDate,
      isMarried,
      marriageDate,
      marriageVenue,
      spouseName,
      ordinationDate,
      ordinationVenue,
      ordainedBy
    } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    const userUpdates = [];
    const userValues = [];
    const userFieldMap = [
      ['email', email],
      ['first_name', firstName],
      ['last_name', lastName],
      ['phone', phone],
      ['date_of_birth', dateOfBirth],
      ['gender', gender],
      ['address', address],
      ['emergency_contact', emergencyContact],
      ['emergency_phone', emergencyPhone]
    ];
    
    for (const [column, value] of userFieldMap) {
      if (value !== undefined) {
        if (column === 'gender' && value) {
          const normalizedGender = value.toLowerCase();
          if (!['male', 'female'].includes(normalizedGender)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid gender value'
            });
          }
          userUpdates.push(`${column} = ?`);
          userValues.push(normalizedGender);
        } else {
          userUpdates.push(`${column} = ?`);
          userValues.push(normalizeNullableValue(value));
        }
      }
    }
    
    if (userUpdates.length > 0) {
      userValues.push(userId);
      await db.execute(
        `UPDATE users SET ${userUpdates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        userValues
      );
    }
    
    const profileFields = {
      association: normalizeNullableValue(association),
      section: normalizeNullableValue(section),
      is_baptized: toNullableBoolean(isBaptized),
      baptism_date: normalizeNullableValue(baptismDate),
      baptism_venue: normalizeNullableValue(baptismVenue),
      is_confirmed: toNullableBoolean(isConfirmed),
      confirmation_date: normalizeNullableValue(confirmationDate),
      confirmation_venue: normalizeNullableValue(confirmationVenue),
      receives_communion: toNullableBoolean(receivesCommunion),
      first_communion_date: normalizeNullableValue(firstCommunionDate),
      is_married: toNullableBoolean(isMarried),
      marriage_date: normalizeNullableValue(marriageDate),
      marriage_venue: normalizeNullableValue(marriageVenue),
      spouse_name: normalizeNullableValue(spouseName),
      ordination_date: normalizeNullableValue(ordinationDate),
      ordination_venue: normalizeNullableValue(ordinationVenue),
      ordained_by: normalizeNullableValue(ordainedBy)
    };
    
    const profileColumns = Object.entries(profileFields)
      .filter(([, value]) => value !== undefined)
      .map(([column, value]) => ({ column, value }));
    
    if (profileColumns.length > 0) {
      const columns = profileColumns.map(({ column }) => column);
      const values = profileColumns.map(({ value }) => value);
      await db.execute(
        `INSERT INTO user_profiles (user_id, ${columns.join(', ')})
         VALUES (?, ${columns.map(() => '?').join(', ')})
         ON DUPLICATE KEY UPDATE 
           ${columns.map(col => `${col} = VALUES(${col})`).join(', ')},
           updated_at = CURRENT_TIMESTAMP`,
        [userId, ...values]
      );
    }
    
    if (userUpdates.length === 0 && profileColumns.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    const [updatedUser] = await db.execute(
      `${BASE_USER_QUERY}
       WHERE u.id = ?`,
      [userId]
    );
    
    if (updatedUser[0]) {
      delete updatedUser[0].passwordHash;
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser[0]
      }
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // Get current password hash
    const [users] = await db.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await db.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just acknowledge the logout
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Verify token (for frontend to check if token is still valid)
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

module.exports = router;
