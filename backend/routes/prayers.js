const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { sendEmail } = require('../utils/email');
const { authenticateToken, requireContentManager, optionalAuth } = require('../middleware/auth');
const { 
  validatePrayerIntention, 
  validateId, 
  validatePagination, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Get prayer intentions (public endpoint with optional auth)
router.get('/', optionalAuth, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const isApproved = req.query.approved !== 'false'; // Default to approved only
    const isUrgent = req.query.urgent === 'true';
    
    let whereConditions = [];
    let queryParams = [];
    
    // For non-authenticated users, only show approved intentions
    if (!req.user || req.user.role === 'parishioner') {
      whereConditions.push('is_approved = true');
    } else if (isApproved) {
      whereConditions.push('is_approved = ?');
      queryParams.push(true);
    }
    
    if (isUrgent) {
      whereConditions.push('is_urgent = ?');
      queryParams.push(true);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM prayer_intentions ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get prayer intentions with pagination
    const intentionsQuery = `
      SELECT 
        p.id,
        p.intention,
        CASE 
          WHEN p.is_anonymous = true THEN 'Anonymous'
          ELSE p.requester_name
        END as requester_name,
        p.is_anonymous,
        p.is_approved,
        p.is_urgent,
        p.submitted_at,
        p.approved_at,
        u.username as approved_by_username
      FROM prayer_intentions p
      LEFT JOIN users u ON p.approved_by = u.id
      ${whereClause}
      ORDER BY p.is_urgent DESC, p.submitted_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [intentions] = await db.execute(intentionsQuery, [...queryParams, limit, offset]);
    
    res.json({
      success: true,
      data: {
        intentions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get prayer intentions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prayer intentions'
    });
  }
});

// Submit prayer intention (public endpoint)
router.post('/', optionalAuth, validatePrayerIntention, handleValidationErrors, async (req, res) => {
  try {
    const {
      intention,
      requester_name,
      requester_email,
      is_anonymous = false,
      is_urgent = false
    } = req.body;
    
    const intentionId = uuidv4();
    const finalRequesterName = req.user ? `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.username : requester_name;
    const finalRequesterEmail = req.user ? req.user.email : requester_email;
    
    await db.execute(`
      INSERT INTO prayer_intentions (
        id, intention, requester_name, requester_email, 
        is_anonymous, is_urgent
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      intentionId, intention, 
      is_anonymous ? null : finalRequesterName,
      is_anonymous ? null : finalRequesterEmail,
      is_anonymous, is_urgent
    ]);

    // Send email notification to administrator
    try {
      const adminEmail = process.env.REPORTER_APPLICATION_RECIPIENT || 'comforter958@gmail.com';
      await sendEmail({
        to: adminEmail,
        subject: `New Prayer Intention${is_urgent ? ' (URGENT)' : ''}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2e7d32;">New Prayer Intention Submitted</h2>
            <p><strong>From:</strong> ${is_anonymous ? 'Anonymous' : (finalRequesterName || 'Not provided')}</p>
            <p><strong>Email:</strong> ${is_anonymous ? 'Anonymous' : (finalRequesterEmail || 'Not provided')}</p>
            <p><strong>Urgency:</strong> ${is_urgent ? '<span style="color: red; font-weight: bold;">URGENT</span>' : 'Normal'}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Intention:</strong></p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; font-style: italic;">
              "${intention}"
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
              This is an automated notification from St. Patrick's Catholic Church Management System.
            </p>
          </div>
        `,
        text: `
New Prayer Intention Submitted
------------------------------
From: ${is_anonymous ? 'Anonymous' : (finalRequesterName || 'Not provided')}
Email: ${is_anonymous ? 'Anonymous' : (finalRequesterEmail || 'Not provided')}
Urgency: ${is_urgent ? 'URGENT' : 'Normal'}

Intention:
"${intention}"

This is an automated notification from St. Patrick's Catholic Church Management System.
        `
      });
    } catch (emailErr) {
      console.error('Failed to send prayer intention notification email:', emailErr);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Prayer intention submitted successfully. It will be reviewed before being published.',
      data: {
        id: intentionId
      }
    });
    
  } catch (error) {
    console.error('Submit prayer intention error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit prayer intention'
    });
  }
});

// Approve prayer intention (admin only)
router.patch('/:id/approve', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if intention exists and is not already approved
    const [intentions] = await db.execute(
      'SELECT id, is_approved FROM prayer_intentions WHERE id = ?',
      [id]
    );
    
    if (intentions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prayer intention not found'
      });
    }
    
    if (intentions[0].is_approved) {
      return res.status(400).json({
        success: false,
        message: 'Prayer intention is already approved'
      });
    }
    
    // Approve the intention
    await db.execute(
      'UPDATE prayer_intentions SET is_approved = true, approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.user.id, id]
    );
    
    res.json({
      success: true,
      message: 'Prayer intention approved successfully'
    });
    
  } catch (error) {
    console.error('Approve prayer intention error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve prayer intention'
    });
  }
});

// Delete prayer intention (admin only)
router.delete('/:id', authenticateToken, requireContentManager, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if intention exists
    const [intentions] = await db.execute('SELECT id FROM prayer_intentions WHERE id = ?', [id]);
    
    if (intentions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prayer intention not found'
      });
    }
    
    // Delete the intention
    await db.execute('DELETE FROM prayer_intentions WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Prayer intention deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete prayer intention error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prayer intention'
    });
  }
});

// Get pending prayer intentions (admin only)
router.get('/pending', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const [intentions] = await db.execute(`
      SELECT 
        id,
        intention,
        requester_name,
        requester_email,
        is_anonymous,
        is_urgent,
        submitted_at
      FROM prayer_intentions
      WHERE is_approved = false
      ORDER BY is_urgent DESC, submitted_at ASC
    `);
    
    res.json({
      success: true,
      data: {
        intentions
      }
    });
    
  } catch (error) {
    console.error('Get pending prayer intentions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending prayer intentions'
    });
  }
});

// Get prayer intention statistics (admin only)
router.get('/stats/overview', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_intentions,
        SUM(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as approved_intentions,
        SUM(CASE WHEN is_approved = false THEN 1 ELSE 0 END) as pending_intentions,
        SUM(CASE WHEN is_urgent = true THEN 1 ELSE 0 END) as urgent_intentions,
        SUM(CASE WHEN is_anonymous = true THEN 1 ELSE 0 END) as anonymous_intentions
      FROM prayer_intentions
    `);
    
    // Get recent submissions
    const [recentIntentions] = await db.execute(`
      SELECT 
        id,
        intention,
        CASE 
          WHEN is_anonymous = true THEN 'Anonymous'
          ELSE requester_name
        END as requester_name,
        is_approved,
        is_urgent,
        submitted_at
      FROM prayer_intentions
      ORDER BY submitted_at DESC
      LIMIT 10
    `);
    
    // Get monthly statistics
    const [monthlyStats] = await db.execute(`
      SELECT 
        TO_CHAR(submitted_at, 'YYYY-MM') as month,
        COUNT(*) as total_submissions,
        SUM(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as approved_submissions
      FROM prayer_intentions
      WHERE submitted_at >= (CURRENT_DATE - INTERVAL '12 months')
      GROUP BY TO_CHAR(submitted_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats[0],
        recentIntentions,
        monthlyStats
      }
    });
    
  } catch (error) {
    console.error('Get prayer intention stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prayer intention statistics'
    });
  }
});

module.exports = router;
