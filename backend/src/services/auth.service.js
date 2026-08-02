import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import AppError from '../utils/AppError.js';
import defaultUserRepository from '../repositories/user.repository.js';
import defaultRoleRepository from '../repositories/role.repository.js';
import defaultRefreshTokenRepository from '../repositories/refreshToken.repository.js';

export class AuthService {
  /**
   * @param {Object} [userRepo] 
   * @param {Object} [roleRepo] 
   * @param {Object} [tokenRepo] 
   */
  constructor(
    userRepo = defaultUserRepository,
    roleRepo = defaultRoleRepository,
    tokenRepo = defaultRefreshTokenRepository
  ) {
    this.userRepository = userRepo;
    this.roleRepository = roleRepo;
    this.refreshTokenRepository = tokenRepo;
  }

  /**
   * Helper to generate Access Token (15m) & Refresh Token (7d), and store Refresh Token in DB
   * @param {Object} user - { id, email, role }
   * @returns {Promise<Object>} - { accessToken, refreshToken }
   */
  async generateTokenPair(user) {
    const roleName = typeof user.role === 'object' ? user.role.name : user.role || 'VOTER';

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: roleName,
    };

    // 1. Generate short-lived Access Token (15 min)
    const accessToken = jwt.sign(tokenPayload, config.jwtAccessSecret, {
      expiresIn: config.accessTokenExpiresIn,
    });

    // Refresh token payload includes unique jti to prevent duplicate token collisions
    const refreshTokenPayload = {
      ...tokenPayload,
      jti: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };

    // 2. Generate long-lived Refresh Token (7 days)
    const refreshToken = jwt.sign(refreshTokenPayload, config.jwtRefreshSecret, {
      expiresIn: config.refreshTokenExpiresIn,
    });

    // Calculate refresh token expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 3. Persist Refresh Token in DB
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Register a new user with default VOTER role
   * @param {Object} payload - { name, email, password }
   * @returns {Promise<Object>} - { user, accessToken, refreshToken, token }
   */
  async registerUser({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if email already exists
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError('Email is already registered.', 409, 'ConflictError');
    }

    // 2. Fetch default VOTER role
    const voterRole = await this.roleRepository.findByName('VOTER');
    if (!voterRole) {
      throw new AppError('Default role (VOTER) not found in system.', 500, 'ConfigurationError');
    }

    // 3. Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create user in database
    const newUser = await this.userRepository.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      roleId: voterRole.id,
    });

    const roleName = newUser.role ? newUser.role.name : voterRole.name;

    // 5. Generate Access Token & Refresh Token pair
    const tokens = await this.generateTokenPair({
      id: newUser.id,
      email: newUser.email,
      role: roleName,
    });

    const userPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: roleName,
    };

    return {
      user: userPayload,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      token: tokens.accessToken,
    };
  }

  /**
   * Authenticate user credentials and return token pair
   * @param {Object} payload - { email, password }
   * @returns {Promise<Object>} - { accessToken, refreshToken, token, user }
   */
  async loginUser({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user exists
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AppError('Invalid credentials.', 401, 'UnauthorizedError');
    }

    // 2. Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials.', 401, 'UnauthorizedError');
    }

    const roleName = user.role ? user.role.name : 'VOTER';

    // 3. Generate Access Token & Refresh Token pair
    const tokens = await this.generateTokenPair({
      id: user.id,
      email: user.email,
      role: roleName,
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleName,
    };

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      token: tokens.accessToken,
      user: userPayload,
    };
  }

  /**
   * Verify refresh token and issue a new Access Token
   * @param {string} refreshToken 
   * @returns {Promise<Object>} - { accessToken, refreshToken }
   */
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required.', 400, 'ValidationError');
    }

    let decodedPayload;
    try {
      // 1. Verify JWT signature using JWT_REFRESH_SECRET
      decodedPayload = jwt.verify(refreshToken, config.jwtRefreshSecret);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token.', 401, 'UnauthorizedError');
    }

    // 2. Query Refresh Token from database
    const storedTokenRecord = await this.refreshTokenRepository.findByToken(refreshToken);
    if (!storedTokenRecord) {
      throw new AppError('Refresh token has been revoked or is invalid.', 401, 'UnauthorizedError');
    }

    // 3. Check database expiration
    if (new Date() > new Date(storedTokenRecord.expiresAt)) {
      await this.refreshTokenRepository.deleteByToken(refreshToken);
      throw new AppError('Refresh token has expired.', 401, 'UnauthorizedError');
    }

    const user = storedTokenRecord.user;
    if (!user) {
      throw new AppError('User associated with refresh token not found.', 401, 'UnauthorizedError');
    }

    const roleName = user.role ? user.role.name : 'VOTER';

    // 4. Generate new Access Token (15 minutes)
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: roleName,
      },
      config.jwtAccessSecret,
      {
        expiresIn: config.accessTokenExpiresIn,
      }
    );

    return {
      accessToken: newAccessToken,
      refreshToken,
    };
  }

  /**
   * Revoke refresh token (Logout)
   * @param {string} refreshToken 
   * @returns {Promise<void>}
   */
  async logoutUser(refreshToken) {
    if (!refreshToken) {
      return;
    }
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }
}

export const authService = new AuthService();
export default authService;
