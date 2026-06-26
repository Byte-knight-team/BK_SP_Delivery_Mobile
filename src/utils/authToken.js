import * as SecureStore from 'expo-secure-store'
import { STORAGE_KEYS } from './constants'

/**
 * Safely decode a JWT payload.
 *
 * This does NOT verify the token signature.
 * Frontend decoding is only for UI/route decisions.
 * Real security is still enforced by the backend.
 *
 * Identical logic to the web frontend's authToken.js — pure JS, no DOM.
 */
export function decodeJwtPayload(token) {
  if (!token || !token.includes('.')) {
    return null
  }

  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT payload:', error)
    return null
  }
}

/**
 * Check JWT expiry using the exp claim.
 * Identical logic to the web frontend.
 */
export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token)

  if (!payload?.exp) {
    return true
  }

  return payload.exp * 1000 < Date.now()
}

/**
 * Store JWT token securely using expo-secure-store.
 * Replaces localStorage.setItem() from the web frontend.
 */
export async function saveAuthToken(token) {
  await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token)
}

/**
 * Retrieve JWT token from secure storage.
 * Replaces localStorage.getItem() from the web frontend.
 */
export async function getAuthToken() {
  return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Remove JWT token from secure storage.
 * Replaces localStorage.removeItem() from the web frontend.
 */
export async function clearAuthStorage() {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Convert JWT claims into the current-user object needed by the app.
 *
 * Maps the same JWT claim fields as the web frontend's AuthContext.
 * The backend JWT includes: roleName, branchId, branchName, fullName, etc.
 */
export function getCurrentUserFromToken(token) {
  const payload = decodeJwtPayload(token)

  if (!payload) {
    return null
  }

  const roleName =
    payload.roleName ||
    payload.role ||
    payload.authority ||
    payload.authorities?.[0]?.replace('ROLE_', '') ||
    ''

  return {
    id: payload.id || payload.userId || payload.staffId || null,
    email: payload.email || payload.sub || '',
    username: payload.username || payload.sub || '',
    fullName: payload.fullName || payload.name || '',
    roleName,
    branchId: payload.branchId || null,
    branchName: payload.branchName || '',
    passwordChanged: payload.passwordChanged,
    exp: payload.exp,
  }
}
