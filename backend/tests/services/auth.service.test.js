import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../src/config/env.js';
import { AuthService } from '../../src/services/auth.service.js';

describe('AuthService Unit Tests (Mocked Database Repositories)', () => {
  describe('registerUser', () => {
    test('Should throw 409 Conflict if email is already registered', async () => {
      const mockUserRepo = {
        findByEmail: async (email) => ({ id: 'existing-id', email }),
      };

      const authService = new AuthService(mockUserRepo);

      await assert.rejects(
        async () => {
          await authService.registerUser({
            name: 'Alice',
            email: 'existing@example.com',
            password: 'password123',
          });
        },
        (err) => {
          assert.strictEqual(err.statusCode, 409);
          assert.strictEqual(err.message, 'Email is already registered.');
          return true;
        }
      );
    });

    test('Should throw 500 ConfigurationError if default VOTER role is missing', async () => {
      const mockUserRepo = {
        findByEmail: async () => null,
      };
      const mockRoleRepo = {
        findByName: async () => null,
      };

      const authService = new AuthService(mockUserRepo, mockRoleRepo);

      await assert.rejects(
        async () => {
          await authService.registerUser({
            name: 'Alice',
            email: 'new@example.com',
            password: 'password123',
          });
        },
        (err) => {
          assert.strictEqual(err.statusCode, 500);
          assert.strictEqual(err.message, 'Default role (VOTER) not found in system.');
          return true;
        }
      );
    });

    test('Should hash password and create user with VOTER role', async () => {
      let createdUserData = null;
      let createdTokenData = null;

      const mockUserRepo = {
        findByEmail: async () => null,
        create: async (data) => {
          createdUserData = data;
          return {
            id: 'new-user-uuid',
            name: data.name,
            email: data.email,
            password: data.password,
            role: { name: 'VOTER' },
          };
        },
      };

      const mockRoleRepo = {
        findByName: async (name) => ({ id: 'voter-role-id', name }),
      };

      const mockTokenRepo = {
        create: async (data) => {
          createdTokenData = data;
          return data;
        },
      };

      const authService = new AuthService(mockUserRepo, mockRoleRepo, mockTokenRepo);

      const result = await authService.registerUser({
        name: 'Alice Student',
        email: 'alice@college.edu',
        password: 'securePassword123',
      });

      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);
      assert.strictEqual(result.user.name, 'Alice Student');
      assert.strictEqual(result.user.role, 'VOTER');
      assert.strictEqual(result.user.password, undefined);

      // Verify bcrypt password hashing
      const isHashValid = await bcrypt.compare('securePassword123', createdUserData.password);
      assert.strictEqual(isHashValid, true);
    });
  });

  describe('loginUser', () => {
    test('Should throw 401 Unauthorized if user does not exist', async () => {
      const mockUserRepo = {
        findByEmail: async () => null,
      };

      const authService = new AuthService(mockUserRepo);

      await assert.rejects(
        async () => {
          await authService.loginUser({
            email: 'nonexistent@college.edu',
            password: 'password123',
          });
        },
        (err) => {
          assert.strictEqual(err.statusCode, 401);
          assert.strictEqual(err.message, 'Invalid credentials.');
          return true;
        }
      );
    });

    test('Should throw 401 Unauthorized if password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('realPassword123', 10);
      const mockUserRepo = {
        findByEmail: async (email) => ({
          id: 'user-id',
          name: 'Bob',
          email,
          password: hashedPassword,
          role: { name: 'VOTER' },
        }),
      };

      const authService = new AuthService(mockUserRepo);

      await assert.rejects(
        async () => {
          await authService.loginUser({
            email: 'bob@college.edu',
            password: 'wrongPassword123',
          });
        },
        (err) => {
          assert.strictEqual(err.statusCode, 401);
          assert.strictEqual(err.message, 'Invalid credentials.');
          return true;
        }
      );
    });

    test('Should return token pair on valid login', async () => {
      const hashedPassword = await bcrypt.hash('realPassword123', 10);
      const mockUserRepo = {
        findByEmail: async (email) => ({
          id: 'user-id-123',
          name: 'Bob Candidate',
          email,
          password: hashedPassword,
          role: { name: 'CANDIDATE' },
        }),
      };

      const mockTokenRepo = {
        create: async (data) => data,
      };

      const authService = new AuthService(mockUserRepo, null, mockTokenRepo);

      const result = await authService.loginUser({
        email: 'bob@college.edu',
        password: 'realPassword123',
      });

      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);
      assert.strictEqual(result.user.name, 'Bob Candidate');
      assert.strictEqual(result.user.role, 'CANDIDATE');
    });
  });

  describe('refreshAccessToken', () => {
    test('Should throw 401 for forged or invalid refresh token signature', async () => {
      const authService = new AuthService();

      await assert.rejects(
        async () => {
          await authService.refreshAccessToken('forged.refresh.token');
        },
        (err) => {
          assert.strictEqual(err.statusCode, 401);
          assert.strictEqual(err.message, 'Invalid or expired refresh token.');
          return true;
        }
      );
    });

    test('Should throw 401 if refresh token is missing in database (revoked)', async () => {
      const validRefreshToken = jwt.sign(
        { id: 'user-id', email: 'test@college.edu', role: 'VOTER' },
        config.jwtRefreshSecret,
        { expiresIn: '7d' }
      );

      const mockTokenRepo = {
        findByToken: async () => null,
      };

      const authService = new AuthService(null, null, mockTokenRepo);

      await assert.rejects(
        async () => {
          await authService.refreshAccessToken(validRefreshToken);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 401);
          assert.strictEqual(err.message, 'Refresh token has been revoked or is invalid.');
          return true;
        }
      );
    });

    test('Should throw 401 if refresh token in database is expired', async () => {
      const validRefreshToken = jwt.sign(
        { id: 'user-id', email: 'test@college.edu', role: 'VOTER' },
        config.jwtRefreshSecret,
        { expiresIn: '7d' }
      );

      let deletedToken = null;
      const mockTokenRepo = {
        findByToken: async (token) => ({
          token,
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
          user: { id: 'user-id', email: 'test@college.edu', role: { name: 'VOTER' } },
        }),
        deleteByToken: async (token) => {
          deletedToken = token;
        },
      };

      const authService = new AuthService(null, null, mockTokenRepo);

      await assert.rejects(
        async () => {
          await authService.refreshAccessToken(validRefreshToken);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 401);
          assert.strictEqual(err.message, 'Refresh token has expired.');
          return true;
        }
      );

      assert.strictEqual(deletedToken, validRefreshToken);
    });
  });

  describe('logoutUser', () => {
    test('Should call token repository deleteByToken', async () => {
      let deletedToken = null;
      const mockTokenRepo = {
        deleteByToken: async (token) => {
          deletedToken = token;
        },
      };

      const authService = new AuthService(null, null, mockTokenRepo);
      await authService.logoutUser('target-token-to-revoke');

      assert.strictEqual(deletedToken, 'target-token-to-revoke');
    });
  });
});
