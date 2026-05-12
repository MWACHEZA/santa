const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

async function testSMTP() {
  const smtpUser = process.env.SMTP_USER || 'comforter958@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'etgh nhao crkh xexo';
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');

  console.log('🧪 Starting SMTP Diagnostic Connection Test (IPv4 Forced)...');
  console.log(`👤 User: ${smtpUser}`);
  console.log(`🌐 Host: ${smtpHost}:${smtpPort}`);
  console.log(`🔑 Pass length: ${smtpPass ? smtpPass.length : 0} characters`);

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Verifying SMTP connection details...');
    await transporter.verify();
    console.log('✅ Success! SMTP connection is valid and verified.');
    
    console.log('🔄 Attempting to send a test email...');
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'St. Patrick\'s Test'}" <${smtpUser}>`,
      to: smtpUser,
      subject: 'St. Patrick\'s SMTP Diagnostic Test',
      text: 'If you receive this, your email configuration is 100% correct and working!',
      html: '<h3>If you receive this, your email configuration is 100% correct and working!</h3>'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully! Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Connection or Send Failed!');
    console.error('----------------------------------------------------');
    console.error(error);
    console.error('----------------------------------------------------');
  }
}

testSMTP();
