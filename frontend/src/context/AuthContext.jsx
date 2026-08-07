import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to resolve landing path based on user role
  const getRoleRedirectPath = useCallback((userRole) => {
    switch (userRole) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'CANDIDATE':
        return '/candidate/portal';
      case 'VOTER':
      default:
        return '/voter/dashboard';
    }
  }, []);

  // Restore session from localStorage on initial render
  useEffect(() => {
    const session = authService.getStoredSession();
    if (session.accessToken && session.user) {
      setUser(session.user);
      setAccessToken(session.accessToken);
      setRefreshToken(session.refreshToken);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        const { user: userData, accessToken: token, refreshToken: refToken, token: fallbackToken } = response.data;
        const activeToken = token || fallbackToken;

        setUser(userData);
        setAccessToken(activeToken);
        setRefreshToken(refToken || null);

        authService.saveSession({
          accessToken: activeToken,
          refreshToken: refToken,
          user: userData,
        });

        const redirectPath = getRoleRedirectPath(userData.role);
        return { success: true, user: userData, redirectPath };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Invalid email or password.';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [getRoleRedirectPath]);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        const { user: newUser, accessToken: token, refreshToken: refToken, token: fallbackToken } = response.data;
        const activeToken = token || fallbackToken;

        setUser(newUser);
        setAccessToken(activeToken);
        setRefreshToken(refToken || null);

        authService.saveSession({
          accessToken: activeToken,
          refreshToken: refToken,
          user: newUser,
        });

        const redirectPath = getRoleRedirectPath(newUser.role);
        return { success: true, user: newUser, redirectPath };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed.';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [getRoleRedirectPath]);

  const forgotPassword = useCallback(async (emailPayload) => {
    try {
      const response = await authService.forgotPassword(emailPayload);
      return { success: true, message: response.message || 'Password recovery instructions sent.' };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process password recovery request.';
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout(refreshToken);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setIsLoading(false);
    }
  }, [refreshToken]);

  const hasRole = useCallback((allowedRoles) => {
    if (!user || !user.role) return false;
    if (typeof allowedRoles === 'string') return user.role === allowedRoles;
    if (Array.isArray(allowedRoles)) return allowedRoles.includes(user.role);
    return false;
  }, [user]);

  const value = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    role: user?.role || null,
    login,
    register,
    forgotPassword,
    logout,
    hasRole,
    getRoleRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
