import axios from 'axios'
import { router } from 'expo-router'
import { API_BASE_URL } from '../utils/constants'
import { clearAuthStorage, getAuthToken } from '../utils/authToken'

/**
 * Central Axios instance for all API calls.
 *
 * Replaces apiHelper.js from the web frontend.
 * Uses Axios interceptors instead of a custom fetch wrapper.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15s timeout — important on mobile networks
})

/**
 * REQUEST INTERCEPTOR
 *
 * Automatically attaches the JWT Bearer token to every outgoing request.
 * Reads token from SecureStore (async) before each request.
 *
 * Web equivalent: getAuthHeaders() in apiHelper.js
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * RESPONSE INTERCEPTOR
 *
 * Handles auth errors globally — mirrors the logic in apiHelper.js authFetch().
 *
 * 401 — Not authenticated / token expired / invalid token:
 *   - Clear token from SecureStore
 *   - Redirect to login screen
 *
 * 403 — Authenticated but access denied:
 *   - Only force logout for specific backend error codes (branch/user inactive)
 *   - Other 403s stay on screen so the UI can show "No Access"
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const errorData = error.response?.data

    if (status === 401) {
      await clearAuthStorage()
      // Use expo-router imperative navigation — replaces window.location.href
      router.replace('/(auth)/login')
      return Promise.reject(new Error('Session expired. Please log in again.'))
    }

    if (status === 403) {
      const forceLogoutCodes = [
        'BRANCH_INACTIVE',
        'STAFF_BRANCH_NOT_ASSIGNED',
        'USER_INACTIVE',
        'USER_NOT_FOUND',
      ]

      if (forceLogoutCodes.includes(errorData?.code)) {
        await clearAuthStorage()
        const message =
          errorData?.message ||
          'Your branch access is no longer available. Please contact the system administrator.'
        router.replace({
          pathname: '/(auth)/login',
          params: { error: message },
        })
        return Promise.reject(new Error(message))
      }
    }

    // All other errors — extract message from backend response body if available
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred'

    return Promise.reject(new Error(message))
  }
)

export default apiClient
