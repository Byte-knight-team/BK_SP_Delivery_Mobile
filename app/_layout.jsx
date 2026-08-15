import '../global.css'

import { useEffect } from 'react'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider } from '../src/context/AuthContext'
import {
  useFonts,
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter'

// Keep the splash screen visible until fonts have finished loading.
SplashScreen.preventAutoHideAsync()

/**
 * Root Layout — wraps every screen in the app.
 *
 * Responsibilities:
 * 1. Import global.css so NativeWind styles are available everywhere
 * 2. Load all Inter font weights and hold the splash screen until ready
 * 3. Provide SafeAreaProvider for safe area insets on notched devices
 * 4. Provide AuthProvider so every screen can access auth state via useAuth()
 * 5. Configure the StatusBar style
 *
 * Uses <Slot /> (not <Stack />) because the actual navigation structure
 * is defined by the (auth) and (app) route groups below this layout.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  })

  // Hide the splash screen once fonts are loaded (or if they fail to load).
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  // Render nothing until fonts are ready to avoid a flash of unstyled text.
  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Slot />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
