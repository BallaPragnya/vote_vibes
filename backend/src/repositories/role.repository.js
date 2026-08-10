import prisma from '../config/prisma.js';

export class RoleRepository {
  /**
   * Find a role by its unique name (e.g. 'ADMIN', 'VOTER', 'CANDIDATE')
   * @param {string} name 
   * @returns {Promise<Object|null>}
   */
  async findByName(name) {
    return prisma.role.findUnique({
      where: { name },
    });
  }

  /**
   * Find a role by its ID
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return prisma.role.findUnique({
      where: { id },
    });
  }
}

export const roleRepository = new RoleRepository();
export default roleRepository;
