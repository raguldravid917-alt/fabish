const contactRepository = require('../repositories/contactRepository');

class ContactService {
  async createInquiry(contactData) {
    if (contactData.name === 'Get Active Subscriber') {
      const existing = await contactRepository.findByEmailAndName(contactData.email, contactData.name);
      if (existing) {
        throw new Error('You have already subscribed to our newsletter.');
      }
    }
    return await contactRepository.create(contactData);
  }

  async getInquiries() {
    return await contactRepository.findAll();
  }

  async updateInquiryStatus(id, status) {
    const inquiry = await contactRepository.updateStatus(id, status);
    if (!inquiry) {
      throw new Error('Inquiry not found');
    }
    return inquiry;
  }

  async deleteInquiry(id) {
    const inquiry = await contactRepository.delete(id);
    if (!inquiry) {
      throw new Error('Inquiry not found');
    }
    return inquiry;
  }
}

module.exports = new ContactService();
