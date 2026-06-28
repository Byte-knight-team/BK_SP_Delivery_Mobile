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
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../src/context/AuthContext'
import { colors } from '../../src/theme/colors'

/**
 * Login Screen — staff login for delivery drivers.
 *
 * Layout:
 *  SafeAreaView (brand bg, respects status bar)
 *    KeyboardAvoidingView (flex-1)
 *      LinearGradient (flex-1, full screen gradient)
 *        Brand header (fixed, not scrollable)
 *        White form card (flex-1, rounded top, scrollable inside)
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
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await login({ email: email.trim(), password })
      if (result.roleName !== 'DELIVERY') {
        Alert.alert(
          'Access Denied',
          'This app is exclusively for delivery staff. Please use the web portal for other roles.',
          [{ text: 'OK' }]
        )
        setLoading(false)
        return
      }
      router.replace('/(app)/(dashboard)')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.brand[500] }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={[colors.brand[500], colors.brand[600]]} style={{ flex: 1 }}>
          {/* Decorative circles */}
          <View
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 200,
              height: 200,
              backgroundColor: 'white',
              opacity: 0.1,
              borderRadius: 100,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 80,
              left: -40,
              width: 140,
              height: 140,
              backgroundColor: 'black',
              opacity: 0.05,
              borderRadius: 70,
            }}
          />

          {/* ── Brand header (non-scrollable) ── */}
          <View
            style={{
              alignItems: 'center',
              paddingTop: 40,
              paddingBottom: 36,
              paddingHorizontal: 32,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Ionicons name="bicycle" size={40} color="white" />
            </View>
            <Text style={{ fontSize: 28, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>
              CRAVE<Text style={{ color: '#FED7AA' }}>HOUSE</Text>
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.7)',
                fontWeight: '600',
                marginTop: 6,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Delivery Driver
            </Text>
          </View>

          {/* ── White form card (fills remaining space) ── */}
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderTopLeftRadius: 36,
              borderTopRightRadius: 36,
            }}
            contentContainerStyle={{ padding: 32, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 4 }}>
              Welcome back
            </Text>
            <Text style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 28 }}>
              Sign in to start your shift
            </Text>

            {/* Error */}
            {error ? (
              <View
                style={{
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1,
                  borderColor: '#FEE2E2',
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{ color: '#EF4444', fontSize: 12, fontWeight: '700', textAlign: 'center' }}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={{ marginBottom: 14 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F9FAFB',
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  height: 56,
                }}
              >
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 15,
                    color: '#111827',
                    fontWeight: '500',
                  }}
                  placeholder="driver@cravehouse.com"
                  placeholderTextColor="#D1D5DB"
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

            {/* Password */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F9FAFB',
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  height: 56,
                }}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 15,
                    color: '#111827',
                    fontWeight: '500',
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#D1D5DB"
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
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                height: 60,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: loading ? '#D1D5DB' : colors.brand[500],
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
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '900',
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                  }}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
