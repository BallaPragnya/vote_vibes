import prisma from '../config/prisma.js';

export class RefreshTokenRepository {
  /**
   * Store a new refresh token record in the database
   * @param {Object} data - { userId, token, expiresAt }
   * @returns {Promise<Object>}
   */
  async create({ userId, token, expiresAt }) {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Find a refresh token record by token string, including user relation
   * @param {string} token 
   * @returns {Promise<Object|null>}
   */
  async findByToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * Delete a specific refresh token from database by token string
   * @param {string} token 
   * @returns {Promise<Object>}
   */
  async deleteByToken(token) {
    return prisma.refreshToken.delete({
      where: { token },
    }).catch(() => null);
  }

  /**
   * Delete all refresh tokens associated with a user ID (revocation)
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  async deleteByUserId(userId) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
export default refreshTokenRepository;
