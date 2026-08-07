import api from '../api/axios';

export const authService = {
  /**
   * Register a new user
   * @param {{ name: string, email: string, password: string }} credentials
   */
  async register(credentials) {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  /**
   * Login user
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout user and revoke refresh token
   * @param {string} refreshToken
   */
  async logout(refreshToken) {
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Explicitly refresh access token
   * @param {string} refreshToken
   */
  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Retrieve saved session from localStorage
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
   * Save session to localStorage
   */
  saveSession({ accessToken, refreshToken, user }) {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }
};

export default authService;
