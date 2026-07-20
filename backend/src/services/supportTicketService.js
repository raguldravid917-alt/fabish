const supportTicketRepository = require('../repositories/supportTicketRepository');
const uploadService = require('./uploadService');
const emailService = require('./emailService');

class SupportTicketService {
  /**
   * Create a new support ticket.
   * Uploads attachments to Cloudinary if present.
   */
  async createTicket(ticketData, files = []) {
    const { name, email, category, priority, subject, description, userId } = ticketData;

    // Upload attachments
    const attachments = [];
    for (const file of files) {
      const result = await uploadService.uploadFile(file, 'fabish/support-attachments');
      attachments.push({
        url: result.secure_url,
        publicId: result.public_id,
        filename: file.originalname,
      });
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category,
      priority: priority || 'Medium',
      subject: subject.trim(),
      description: description.trim(),
      attachments,
      ...(userId ? { user: userId } : {}),
    };

    const ticket = await supportTicketRepository.create(payload);

    // Send confirmation email (non-blocking)
    emailService
      .sendTicketCreationEmail({
        to: ticket.email,
        name: ticket.name,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        category: ticket.category,
      })
      .catch(() => {}); // Gracefully ignore email failures

    return ticket;
  }

  /**
   * Get all tickets (admin).
   */
  async getAllTickets(filters = {}) {
    return await supportTicketRepository.findAll(filters);
  }

  /**
   * Get a single ticket by ID.
   */
  async getTicketById(id) {
    const ticket = await supportTicketRepository.findById(id);
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }

  /**
   * Get tickets for a logged-in user (by userId or email).
   */
  async getMyTickets(userId, email, options = {}) {
    if (userId) {
      return await supportTicketRepository.findByUser(userId, options);
    }
    if (email) {
      return await supportTicketRepository.findByEmail(email, options);
    }
    return { tickets: [], total: 0, page: 1, pages: 1 };
  }

  /**
   * Update ticket status + admin note (admin only).
   */
  async updateTicketStatus(id, { status, adminNotes, replyMessage, adminName }) {
    const ticket = await supportTicketRepository.findById(id);
    if (!ticket) throw new Error('Ticket not found');

    const update = {};
    if (status) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    if (status === 'Resolved') update.resolvedAt = new Date();

    if (replyMessage) {
      update.$push = {
        replies: {
          message: replyMessage,
          isAdmin: true,
          author: adminName || 'Support Team',
          createdAt: new Date(),
        },
      };
    }

    const updated = await supportTicketRepository.findByIdAndUpdate(id, update);

    // Send status update email if status changed (non-blocking)
    if (status && status !== ticket.status) {
      emailService
        .sendTicketStatusEmail({
          to: ticket.email,
          name: ticket.name,
          ticketNumber: ticket.ticketNumber,
          newStatus: status,
          adminNote: replyMessage || adminNotes,
        })
        .catch(() => {});
    }

    return updated;
  }

  /**
   * Delete a ticket and clean up Cloudinary attachments (admin only).
   */
  async deleteTicket(id) {
    const ticket = await supportTicketRepository.findById(id);
    if (!ticket) throw new Error('Ticket not found');

    // Clean up uploaded attachments from Cloudinary
    for (const att of ticket.attachments || []) {
      if (att.publicId) {
        await uploadService.deleteImage(att.publicId).catch(() => {});
      }
    }

    return await supportTicketRepository.delete(id);
  }

  /**
   * Get ticket stats grouped by status (admin dashboard).
   */
  async getStats() {
    return await supportTicketRepository.getStats();
  }
}

module.exports = new SupportTicketService();
