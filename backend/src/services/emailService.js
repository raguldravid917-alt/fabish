/**
 * Email Service — Consolidated Production Implementation.
 * Supports Resend API (HTTP) for production (Render) and falls back to Nodemailer SMTP for local development.
 */
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const dns = require("node:dns");

// Resolve IPv4 first to avoid connection delays on environments like Render/Fly.io
dns.setDefaultResultOrder("ipv4first");

let transporter = null;
let resendClient = null;

// Initialize Resend Client if API key is provided
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

/**
 * Configure and retrieve the Nodemailer transporter instance.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    // Ethereal fallback for local development if credentials are empty/placeholder
    if (process.env.NODE_ENV !== 'production' && (!user || user.includes('placeholder'))) {
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
          family: 4,
          tls: { rejectUnauthorized: false },
        });
        console.log(`[EmailService] Ethereal SMTP test account generated: ${testAccount.user}`);
        return transporter;
      } catch (err) {
        console.error('[EmailService] Ethereal fallback generation failed:', err.message);
      }
    }
    throw new Error('SMTP configurations (SMTP_HOST, SMTP_USER, SMTP_PASS) are missing');
  }

  // Determine TLS vs STARTTLS settings
  const isPort587 = port === 587;
  const isPort465 = port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: isPort465,
    requireTLS: isPort587,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    name: process.env.SMTP_HELO_NAME || "fabish.onrender.com",
    family: 4,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
        ? process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
        : false,
    },
  });

  return transporter;
};

/**
 * Verify SMTP connection or Resend API key configuration.
 */
const verifyConnection = async () => {
  if (resendClient) {
    console.log('✓ Email Service: Resend API mode active (verified API key configuration)');
    return true;
  }
  
  try {
    const t = await getTransporter();
    await t.verify();
    console.log('✓ SMTP Connection Verified successfully');
    return true;
  } catch (err) {
    console.error('⚠ SMTP Connection Verification Failed:', err.message);
    return false;
  }
};

/**
 * Core send mail wrapper with exponential backoff retry mechanism.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || 'onboarding@resend.dev';
  const from = fromEmail.includes('<') ? fromEmail : `"Fabish Support" <${fromEmail}>`;

  let attempt = 0;
  const maxRetries = 3;
  let delay = 1000; // start with 1s delay

  while (attempt < maxRetries) {
    try {
      attempt++;
      if (resendClient) {
        console.log(`[EmailService] Sending email via Resend to ${to}. Attempt ${attempt}/${maxRetries}...`);
        const { data, error } = await resendClient.emails.send({
          from,
          to: [to],
          subject,
          html,
          text,
        });

        if (error) {
          throw new Error(error.message || JSON.stringify(error));
        }

        console.log(`[EmailService] Email sent successfully via Resend to ${to}. MessageID: ${data.id}`);
        return { success: true, messageId: data.id };
      } else {
        console.log(`[EmailService] Sending email via SMTP to ${to}. Attempt ${attempt}/${maxRetries}...`);
        const t = await getTransporter();
        const info = await t.sendMail({
          from,
          to,
          subject,
          html,
          text,
        });
        console.log(`[EmailService] Email sent successfully via SMTP to ${to}. MessageID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      }
    } catch (err) {
      console.warn(`[EmailService] Attempt ${attempt} failed: ${err.message}`);
      if (attempt >= maxRetries) {
        console.error(`[EmailService] All ${maxRetries} attempts failed to send email to ${to}.`);
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // exponential backoff
    }
  }
};

const emailService = {
  sendEmail,
  verifyConnection,

  /**
   * Send ticket creation confirmation to customer.
   */
  sendTicketCreationEmail: async ({ to, name, ticketNumber, subject, category }) => {
    return sendEmail({
      to,
      subject: `Support Ticket Created — ${ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #8B5A2B;">Your Support Ticket Has Been Received</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>We've received your support request and will get back to you as soon as possible.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border: 1px solid #eee; background: #f9f9f9;"><strong>Ticket Number</strong></td><td style="padding: 8px; border: 1px solid #eee;">${ticketNumber}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee; background: #f9f9f9;"><strong>Subject</strong></td><td style="padding: 8px; border: 1px solid #eee;">${subject}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee; background: #f9f9f9;"><strong>Category</strong></td><td style="padding: 8px; border: 1px solid #eee;">${category}</td></tr>
          </table>
          <p>You can track your ticket status by visiting our <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/pages/support" style="color: #8B5A2B;">Support Center</a>.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #999;">— The Fabish Support Team</p>
        </div>
      `,
      text: `Hi ${name}, your support ticket ${ticketNumber} has been received. Subject: ${subject}, Category: ${category}. We'll get back to you soon.`,
    });
  },

  /**
   * Send ticket status update notification to customer.
   */
  sendTicketStatusEmail: async ({ to, name, ticketNumber, newStatus, adminNote }) => {
    return sendEmail({
      to,
      subject: `Ticket Update — ${ticketNumber} is now ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #8B5A2B;">Support Ticket Update</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your support ticket <strong>${ticketNumber}</strong> status has been updated to: <strong>${newStatus}</strong>.</p>
          ${adminNote ? `<p><strong>Message from our team:</strong><br>${adminNote}</p>` : ''}
          <p>Visit our <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/pages/support" style="color: #8B5A2B;">Support Center</a> to view your ticket.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #999;">— The Fabish Support Team</p>
        </div>
      `,
      text: `Hi ${name}, your ticket ${ticketNumber} is now ${newStatus}. ${adminNote ? 'Message: ' + adminNote : ''}`,
    });
  },

  /**
   * Send partnership application confirmation.
   */
  sendPartnershipConfirmationEmail: async ({ to, contactName, businessName, type }) => {
    return sendEmail({
      to,
      subject: `Partnership Application Received — Fabish`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #8B5A2B;">Thank You for Your Partnership Application</h2>
          <p>Hi <strong>${contactName}</strong>,</p>
          <p>We've received your <strong>${type}</strong> partnership application for <strong>${businessName}</strong>.</p>
          <p>Our team will review your application within 5–7 business days and reach out to you at this email address.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #999;">— The Fabish Team</p>
        </div>
      `,
      text: `Hi ${contactName}, we received your ${type} partnership application for ${businessName}. We'll reach out within 5-7 business days.`,
    });
  },
};

module.exports = emailService;