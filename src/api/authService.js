import apiClient from './apiClient'

/**
 * Authentication service for delivery staff.
 *
 * Migrated from web frontend's services/authService.js
 * Uses apiClient (Axios) instead of raw fetch + buildApiUrl().
 */

/**
 * Log in a staff member via email and password.
 * Calls: POST /api/auth/staff/login
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, passwordChanged?: boolean }>}
 */
export async function loginStaff({ email, password }) {
  const response = await apiClient.post('/api/auth/staff/login', {
    email,
    password,
  })
  return response.data
}

/**
 * Change the current staff member's password.
 * Calls: PUT /api/auth/staff/change-password
 *
 * Note: The JWT token is attached automatically by apiClient's request interceptor.
 *
 * @param {{ currentPassword: string, newPassword: string }} payload
 * @returns {Promise<string>} Success message from backend.
 */
export async function changeStaffPassword(payload) {
  const response = await apiClient.put('/api/auth/staff/change-password', payload)
  return response.data
}
