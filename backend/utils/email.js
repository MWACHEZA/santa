const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // 1. Check if Brevo HTTP API Key is configured (Bypasses Render firewall completely)
    if (process.env.BREVO_API_KEY) {
      console.log('☁️ Sending email via Brevo HTTP API...');
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { 
            name: process.env.FROM_NAME || 'St. Patrick\'s Catholic Church', 
            email: process.env.FROM_EMAIL || 'comforter958@gmail.com' 
          },
          to: [{ email: to }],
          subject: subject,
          textContent: text || '',
          htmlContent: html || ''
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Brevo HTTP API failed: ${response.status} ${errText}`);
      }

      const resData = await response.json();
      console.log('✅ Email sent successfully via Brevo HTTP API:', resData.messageId);
      return { success: true, messageId: resData.messageId };
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Check if SMTP is using default/placeholder settings
    if (!smtpUser || smtpUser === 'your_email@gmail.com' || !smtpPass || smtpPass === 'your_app_password') {
      console.warn('⚠️ SMTP credentials not fully configured in backend .env. Email body logged below:');
      console.log('================================================================');
      console.log(`✉️ TO:      ${to}`);
      console.log(`📌 SUBJECT: ${subject}`);
      console.log('----------------------------------------------------------------');
      console.log(text || html);
      console.log('================================================================');
      return { success: true, mocked: true };
    }

    // 2. Standard SMTP connection (Note: Render free tier blocks port 25/465/587 by default)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for others
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'St. Patrick\'s Catholic Church'}" <${process.env.FROM_EMAIL || smtpUser}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    console.log('====================== FALLBACK MAIL LOG ======================');
    console.log(`✉️ TO:      ${to}`);
    console.log(`📌 SUBJECT: ${subject}`);
    console.log('----------------------------------------------------------------');
    console.log(text || html);
    console.log('================================================================');
    throw error;
  }
};

module.exports = { sendEmail };
