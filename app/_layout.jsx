import '../global.css'

import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../src/context/AuthContext'

/**
 * Root Layout — wraps every screen in the app.
 *
 * Responsibilities:
 * 1. Import global.css so NativeWind styles are available everywhere
 * 2. Provide SafeAreaProvider for safe area insets on notched devices
 * 3. Provide AuthProvider so every screen can access auth state via useAuth()
 * 4. Configure the StatusBar style
 *
 * Uses <Slot /> (not <Stack />) because the actual navigation structure
 * is defined by the (auth) and (app) route groups below this layout.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Slot />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
