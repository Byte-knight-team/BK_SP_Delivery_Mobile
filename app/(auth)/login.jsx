import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../src/context/AuthContext'
import { colors } from '../../src/theme/colors'

/**
 * Login Screen — staff login for delivery drivers.
 *
 * Migrated from the web frontend's StaffLoginPage.
 * Uses the same POST /api/auth/staff/login endpoint.
 *
 * Key mobile differences:
 * - KeyboardAvoidingView to handle on-screen keyboard
 * - Validates role === 'DELIVERY' — rejects non-delivery staff
 * - Uses expo-router for navigation instead of react-router-dom
 * - Shows error from URL params (e.g., when redirected from 403)
 */
export default function LoginScreen() {
  const { login } = useAuth()
  const params = useLocalSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(params.error || '')

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await login({ email: email.trim(), password })

      // Only delivery staff can use this app
      if (result.roleName !== 'DELIVERY') {
        Alert.alert(
          'Access Denied',
          'This app is exclusively for delivery staff. Please use the web portal for other roles.',
          [{ text: 'OK' }]
        )
        setLoading(false)
        return
      }

      // Navigate to dashboard — replace so user can't go back to login
      router.replace('/(app)/(dashboard)')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white">
          {/* Top gradient header */}
          <LinearGradient
            colors={[colors.brand[500], colors.brand[600]]}
            className="pt-20 pb-16 px-8 rounded-b-[40px]"
          >
            {/* Decorative background elements */}
            <View className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white opacity-10 rounded-full" />
            <View className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black opacity-5 rounded-full" />

            <View className="items-center relative z-10">
              <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-5">
                <Ionicons name="bicycle" size={40} color="white" />
              </View>
              <Text className="text-3xl font-black text-white tracking-tight">
                CRAVE<Text className="text-orange-100">HOUSE</Text>
              </Text>
              <Text className="text-sm text-white/70 font-medium mt-2 uppercase tracking-widest">
                Delivery Driver
              </Text>
            </View>
          </LinearGradient>

          {/* Login form */}
          <View className="flex-1 px-8 pt-10 -mt-6 bg-white rounded-t-[30px]">
            <Text className="text-2xl font-black text-gray-900 mb-1">
              Welcome back
            </Text>
            <Text className="text-sm text-gray-400 mb-8">
              Sign in to start your shift
            </Text>

            {/* Error message */}
            {error ? (
              <View className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
                <Text className="text-red-500 text-xs font-bold text-center">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Email input */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Email
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                <Ionicons name="mail-outline" size={20} color={colors.gray[400]} />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900 font-medium"
                  placeholder="driver@cravehouse.com"
                  placeholderTextColor={colors.gray[300]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password input */}
            <View className="mb-8">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Password
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                <Ionicons name="lock-closed-outline" size={20} color={colors.gray[400]} />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900 font-medium"
                  placeholder="Enter your password"
                  placeholderTextColor={colors.gray[300]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={colors.gray[400]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              className="h-16 rounded-2xl items-center justify-center shadow-lg"
              style={{
                backgroundColor: loading ? colors.gray[300] : colors.brand[500],
                shadowColor: colors.brand[500],
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-black text-base uppercase tracking-widest">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
