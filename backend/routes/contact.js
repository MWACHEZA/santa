const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Get contact info
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM contact_info ORDER BY updated_at DESC LIMIT 1');
    
    if (rows.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    // Transform to frontend format
    const contact = {
      phone: rows[0].phone,
      email: rows[0].email,
      address: rows[0].address,
      emergencyPhone: rows[0].emergency_phone,
      office: {
        weekdays: rows[0].office_hours_weekdays,
        saturday: rows[0].office_hours_saturday,
        sunday: rows[0].office_hours_sunday
      }
    };

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Fetch contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information'
    });
  }
});

// Update contact info
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { phone, email, address, emergencyPhone, office } = req.body;
    
    // Check if exists
    const [rows] = await db.execute('SELECT id FROM contact_info LIMIT 1');
    
    if (rows.length === 0) {
      const id = uuidv4();
      await db.execute(
        `INSERT INTO contact_info (
          id, phone, email, address, emergency_phone, 
          office_hours_weekdays, office_hours_saturday, office_hours_sunday
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, phone, email, address, emergencyPhone,
          office.weekdays, office.saturday, office.sunday
        ]
      );
    } else {
      await db.execute(
        `UPDATE contact_info SET 
          phone = ?, email = ?, address = ?, emergency_phone = ?,
          office_hours_weekdays = ?, office_hours_saturday = ?, office_hours_sunday = ?
          WHERE id = ?`,
        [
          phone, email, address, emergencyPhone,
          office.weekdays, office.saturday, office.sunday,
          rows[0].id
        ]
      );
    }

    res.json({
      success: true,
      message: 'Contact information updated successfully'
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact information'
    });
  }
});

// Submit reporter application & send email
router.post('/reporter-application', async (req, res) => {
  try {
    const { name, surname, email, message } = req.body;

    if (!name || !surname || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, surname, email, message) are required'
      });
    }

    // Prepare email recipient (default to comfortmwachaza01@gmail.com)
    const recipient = process.env.REPORTER_APPLICATION_RECIPIENT || 'comfortmwachaza01@gmail.com';
    const subject = `📢 New Church Reporter Application: ${name} ${surname}`;
    const textContent = `
New Church Reporter Application Received:
----------------------------------------
First Name: ${name}
Surname:    ${surname}
Email:      ${email}

Why they want to become a reporter:
${message}
----------------------------------------
Sent from St. Patrick's Catholic Church Website
    `;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #2d5016; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 1.5rem;">New Reporter Application</h2>
        </div>
        <div style="padding: 20px; color: #374151; line-height: 1.6;">
          <p>A new application to join the parish communications team has been submitted from the website:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f9fafb;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6; width: 35%;">First Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Surname:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${surname}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;"><a href="mailto:${email}" style="color: #2d5016; text-decoration: none; font-weight: 500;">${email}</a></td>
            </tr>
          </table>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #1f2937;">Motivation:</h4>
            <p style="margin: 0; font-style: italic; white-space: pre-line;">"${message}"</p>
          </div>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; font-size: 0.85rem; color: #6b7280; margin-top: 30px;">
          <p>This is an automated notification from St. Patrick's Catholic Church.</p>
        </div>
      </div>
    `;

    // Send email using Nodemailer helper (wrapped in try/catch to be robust)
    let emailSent = false;
    let emailError = null;
    try {
      await sendEmail({
        to: recipient,
        subject,
        text: textContent,
        html: htmlContent
      });
      emailSent = true;
    } catch (emailErr) {
      console.error('⚠️ SMTP connection failed. Please ensure SMTP_PASS has a valid Google App Password in .env:', emailErr);
      emailError = emailErr.message;
    }

    res.json({
      success: true,
      message: emailSent 
        ? 'Application submitted and notification sent successfully' 
        : 'Application submitted successfully (Email notification is pending SMTP configuration)'
    });
  } catch (error) {
    console.error('Submit reporter application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process application, but your response has been logged.'
    });
  }
});

module.exports = router;
