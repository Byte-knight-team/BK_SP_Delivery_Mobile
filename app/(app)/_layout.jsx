import { Tabs, Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../src/context/AuthContext'
import { colors } from '../../src/theme/colors'

/**
 * App Group Layout — bottom tab navigator for authenticated delivery staff.
 *
 * Migrated from web frontend's DeliveryLayout.jsx + deliveryNav.js
 *
 * Web nav items:
 *   - Dashboard (RiDashboardLine)  → (dashboard) tab
 *   - History   (RiHistoryLine)    → history tab
 *   - Profile   (RiUserLine)       → profile tab
 *
 * Guards: If the user is not authenticated, redirects to login.
 * This replaces the web's <ProtectedRoute allowedRoles={['DELIVERY']}> wrapper.
 */
export default function AppLayout() {
  const { isAuthenticated, hydrated } = useAuth()

  // Wait for SecureStore hydration
  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand[500],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[100],
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
          elevation: 0, // Android — remove shadow
          shadowOpacity: 0, // iOS — remove shadow
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
      }}
    >
      {/* Dashboard Tab */}
      <Tabs.Screen
        name="(dashboard)"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      {/* History Tab */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
