const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
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
    console.error('❌ Failed to send email via SMTP:', error);
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
