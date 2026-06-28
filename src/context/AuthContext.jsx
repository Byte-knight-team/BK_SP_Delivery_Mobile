import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginStaff } from '../api/authService'
import {
  clearAuthStorage,
  getAuthToken,
  getCurrentUserFromToken,
  isTokenExpired,
  saveAuthToken,
} from '../utils/authToken'

const AuthContext = createContext(null)

/**
 * AuthProvider — wraps the entire app and manages authentication state.
 *
 * Migrated from web frontend's context/AuthContext.jsx
 *
 * Key differences from web:
 * - Token read on mount is async (SecureStore) instead of sync (localStorage)
 * - `hydrated` state is critical here — the app must wait for the async
 *   SecureStore read before rendering any protected screens
 * - Login saves to SecureStore instead of localStorage
 * - Logout clears SecureStore instead of localStorage
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  /**
   * Restore auth state on app launch.
   *
   * Reads the JWT from SecureStore (async), validates expiry,
   * and decodes user claims if valid.
   *
   * Web equivalent: the useEffect in AuthProvider that reads from localStorage.
   * Main difference: SecureStore is async, so we await before setting state.
   */
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const savedToken = await getAuthToken()

        if (!savedToken || isTokenExpired(savedToken)) {
          await clearAuthStorage()
          setToken(null)
          setUser(null)
          setHydrated(true)
          return
        }

        const decodedUser = getCurrentUserFromToken(savedToken)

        setToken(savedToken)
        setUser(decodedUser)
      } catch (error) {
        console.error('Failed to restore auth state:', error)
        await clearAuthStorage()
        setToken(null)
        setUser(null)
      } finally {
        setHydrated(true)
      }
    }

    restoreAuth()
  }, [])

  /**
   * Login — authenticates staff and stores JWT.
   *
   * Identical flow to the web frontend:
   * 1. Call loginStaff() → backend returns { token, passwordChanged }
   * 2. Save token to SecureStore
   * 3. Decode JWT claims → set user state
   *
   * Key difference: saveAuthToken() is async.
   */
  const login = async (credentials) => {
    const data = await loginStaff(credentials)
    const accessToken = data.token

    if (!accessToken) {
      throw new Error('Login succeeded but token was not returned.')
    }

    await saveAuthToken(accessToken)

    const decodedUser = getCurrentUserFromToken(accessToken)

    const mergedUser = {
      ...decodedUser,
      // Keep passwordChanged only in React memory — not persisted to storage
      passwordChanged:
        data.passwordChanged !== undefined
          ? data.passwordChanged
          : decodedUser?.passwordChanged,
    }

    setToken(accessToken)
    setUser(mergedUser)

    return {
      ...data,
      roleName: mergedUser.roleName,
    }
  }

  /**
   * Logout — clears all auth state and storage.
   *
   * Navigation to login screen is handled by the root layout
   * which watches `isAuthenticated`.
   */
  const logout = async () => {
    await clearAuthStorage()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      hydrated,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      setUser,
    }),
    [user, token, hydrated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth hook — access auth state from any component.
 *
 * Identical API to the web frontend's useAuth().
 * Returns: { user, token, hydrated, isAuthenticated, login, logout, setUser }
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
