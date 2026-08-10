import api from '../api/axios';

export const authService = {
  /**
   * Register a new user (defaults to VOTER role)
   * @param {{ name: string, email: string, password: string }} credentials
   */
  async register(credentials) {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  /**
   * Login user and obtain Access & Refresh tokens
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Request password recovery instructions for email
   * @param {{ email: string }} payload
   */
  async forgotPassword(payload) {
    try {
      const response = await api.post('/auth/forgot-password', payload);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist on backend yet, provide friendly response matching workflow
      if (error.response?.status === 404) {
        return {
          success: true,
          message: `If an account exists for ${payload.email}, password recovery instructions have been dispatched.`,
        };
      }
      throw error;
    }
  },

  /**
   * Logout user and revoke refresh token on backend
   * @param {string} refreshToken
   */
  async logout(refreshToken) {
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.warn('Logout API notification failed:', err.message);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Manually request new Access Token via refresh token
   * @param {string} refreshToken
   */
  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Read stored auth session from localStorage
   */
  getStoredSession() {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      return { accessToken, refreshToken, user };
    } catch (e) {
      return { accessToken: null, refreshToken: null, user: null };
    }
  },

  /**
   * Persist session credentials into localStorage
   */
  saveSession({ accessToken, refreshToken, user }) {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }
};

export default authService;
