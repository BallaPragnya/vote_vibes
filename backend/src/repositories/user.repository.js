import prisma from '../config/prisma.js';

export class UserRepository {
  /**
   * Find a user by email address, including role details
   * @param {string} email 
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        role: true,
      },
    });
  }

  /**
   * Find a user by ID
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  /**
   * Create a new user record
   * @param {Object} userData 
   * @returns {Promise<Object>}
   */
  async create(userData) {
    return prisma.user.create({
      data: {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        roleId: userData.roleId,
      },
      include: {
        role: true,
      },
    });
  }
}

export const userRepository = new UserRepository();
export default userRepository;
