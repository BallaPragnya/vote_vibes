import catchAsync from '../utils/catchAsync.js';
import authService from '../services/auth.service.js';

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
export const register = catchAsync(async (req, res) => {
  const result = await authService.registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & return token
 * @access Public
 */
export const login = catchAsync(async (req, res) => {
  const result = await authService.loginUser(req.body);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using valid refresh token
 * @access Public
 */
export const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);

  return res.status(200).json({
    success: true,
    message: 'Access token refreshed successfully',
    data: result,
  });
});

/**
 * @route POST /api/auth/logout
 * @desc Revoke refresh token and logout user
 * @access Public
 */
export const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logoutUser(refreshToken);

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default {
  register,
  login,
  refresh,
  logout,
};
