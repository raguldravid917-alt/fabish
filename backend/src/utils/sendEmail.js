const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer with SMTP configuration.
 * Throws an error if SMTP setup is incorrect or fails.
 * 
 * @param {object} options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Text body content
 * @param {string} [options.html] - Optional HTML body content
 * @returns {Promise<any>}
 */
const sendEmail = async (options) => {
  let host = process.env.SMTP_HOST || 'smtp.gmail.com';
  let port = parseInt(process.env.SMTP_PORT, 10) || 587;
  let user = process.env.EMAIL_USER;
  let pass = process.env.EMAIL_PASS;
  let from = process.env.MAIL_FROM;

  const isPlaceholder = 
    !user || 
    user.includes('your_gmail_username') || 
    !pass || 
    pass.includes('your_gmail_app_password');

  if (isPlaceholder) {
    try {
      // Dynamically generate a real Ethereal SMTP test account
      const testAccount = await nodemailer.createTestAccount();
      host = 'smtp.ethereal.email';
      port = 587;
      user = testAccount.user;
      pass = testAccount.pass;
      from = testAccount.user;
      
      const consoleMsg = `
================================================================================
[ETHEREAL SMTP BACKEND] Generated test account:
User: ${user}
Pass: ${pass}
================================================================================
`;
      process.stdout.write(consoleMsg);
    } catch (err) {
      throw new Error('SMTP credentials are missing and Ethereal Email test account generation failed: ' + err.message);
    }
  }

  // Configure transporter using SMTP details
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // Use SSL/TLS for port 465
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000, // 10s timeout
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  // Verify connection configuration
  await transporter.verify();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Fabish'}" <${from || user}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">${options.message.replace(/\n/g, '<br/>')}</div>`,
  };

  const info = await transporter.sendMail(mailOptions);

  if (isPlaceholder) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    const consoleMsg = `
================================================================================
[ETHEREAL SMTP BACKEND] Password reset email sent!
Preview URL: ${previewUrl}
================================================================================
`;
    process.stdout.write(consoleMsg);
  }

  return info;
};

module.exports = sendEmail;
