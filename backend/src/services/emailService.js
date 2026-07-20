/**
 * Email Service — nodemailer-based with graceful degradation.
 * If SMTP environment variables are not configured, emails are skipped
 * (logged in development, silently bypassed in production).
 */
const nodemailer = require('nodemailer');

let transporter = null;

const isConfigured = () =>
  !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (!transporter && isConfigured()) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!isConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EmailService] SMTP not configured. Skipping email to: ${to}`);
      console.log(`[EmailService] Subject: ${subject}`);
    }
    return { success: false, reason: 'SMTP not configured' };
  }

  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Fabish Support'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[EmailService] Failed to send email:', err.message);
    return { success: false, reason: err.message };
  }
};

const emailService = {
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
          <p>You can track your ticket status by visiting our <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/pages/support" style="color: #8B5A2B;">Support Center</a>.</p>
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
          <p>Visit our <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/pages/support" style="color: #8B5A2B;">Support Center</a> to view your ticket.</p>
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
