import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../src/context/AuthContext'
import { colors } from '../src/theme/colors'

/**
 * Entry screen — the first screen rendered at "/".
 *
 * Waits for auth hydration (SecureStore token read) to complete,
 * then redirects to either:
 *   - /(app)  → if authenticated (has valid JWT)
 *   - /(auth)/login → if not authenticated
 *
 * This replaces the web frontend's ProtectedRoute + Navigate logic.
 */
export default function Index() {
  const { isAuthenticated, hydrated } = useAuth()

  // Show loading spinner while SecureStore is being read
  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.white,
        }}
      >
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    )
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(app)/(dashboard)" />
  }

  return <Redirect href="/(auth)/login" />
}
