const teamRepository = require('../repositories/teamRepository');
const uploadService = require('./uploadService');

class TeamService {
  /**
   * Get all active team members (public).
   */
  async getTeamMembers() {
    return await teamRepository.findAll({ includeInactive: false });
  }

  /**
   * Get all team members including inactive ones (admin).
   */
  async getAllTeamMembers() {
    return await teamRepository.findAll({ includeInactive: true });
  }

  /**
   * Get distinct active department names (public).
   */
  async getDepartments() {
    return await teamRepository.getDistinctDepartments();
  }

  /**
   * Create a new team member (admin only).
   */
  async createMember(data, file = null) {
    let imageUrl = '';
    let imagePublicId = '';

    if (file) {
      const result = await uploadService.uploadFile(file, 'fabish/team');
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    } else if (data.image) {
      imageUrl = data.image;
    }

    const payload = {
      name: data.name?.trim(),
      role: data.role?.trim(),
      department: data.department?.trim(),
      bio: data.bio?.trim() || '',
      image: imageUrl,
      imagePublicId,
      socialLinks: data.socialLinks || {},
      order: parseInt(data.order) || 0,
      isFeatured: data.isFeatured === true || data.isFeatured === 'true',
      isActive: data.isActive !== false && data.isActive !== 'false',
    };

    return await teamRepository.create(payload);
  }

  /**
   * Update an existing team member (admin only).
   */
  async updateMember(id, data, file = null) {
    const member = await teamRepository.findById(id);
    if (!member) throw new Error('Team member not found');

    let imageUrl = member.image;
    let imagePublicId = member.imagePublicId;

    if (file) {
      // Delete old image from Cloudinary if it exists
      if (member.imagePublicId) {
        await uploadService.deleteImage(member.imagePublicId).catch(() => {});
      }
      const result = await uploadService.uploadFile(file, 'fabish/team');
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    } else if (data.image === '') {
      // Admin explicitly cleared the image
      if (member.imagePublicId) {
        await uploadService.deleteImage(member.imagePublicId).catch(() => {});
      }
      imageUrl = '';
      imagePublicId = '';
    }

    const payload = {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.role !== undefined && { role: data.role.trim() }),
      ...(data.department !== undefined && { department: data.department.trim() }),
      ...(data.bio !== undefined && { bio: data.bio.trim() }),
      image: imageUrl,
      imagePublicId,
      ...(data.socialLinks !== undefined && { socialLinks: data.socialLinks }),
      ...(data.order !== undefined && { order: parseInt(data.order) || 0 }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured === true || data.isFeatured === 'true' }),
      ...(data.isActive !== undefined && { isActive: data.isActive !== false && data.isActive !== 'false' }),
    };

    return await teamRepository.update(id, payload);
  }

  /**
   * Delete a team member (admin only).
   */
  async deleteMember(id) {
    const member = await teamRepository.findById(id);
    if (!member) throw new Error('Team member not found');

    // Clean up Cloudinary image
    if (member.imagePublicId) {
      await uploadService.deleteImage(member.imagePublicId).catch(() => {});
    }

    return await teamRepository.delete(id);
  }
}

module.exports = new TeamService();
