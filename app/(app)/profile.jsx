import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../src/context/AuthContext'
import { DeliveryService } from '../../src/api/deliveryService'
import { changeStaffPassword } from '../../src/api/authService'
import { colors } from '../../src/theme/colors'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  
  // Status State
  const [isOnline, setIsOnline] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)

  // Password State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Fetch initial online status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await DeliveryService.getOnlineStatus()
        setIsOnline(response.isOnline)
      } catch (error) {
        console.error('Failed to fetch online status:', error)
      } finally {
        setStatusLoading(false)
      }
    }
    fetchStatus()
  }, [])

  // Handle Duty Toggle
  const handleToggleStatus = async (value) => {
    // Optimistic UI update
    setIsOnline(value)
    try {
      await DeliveryService.toggleOnlineStatus(value)
    } catch (error) {
      // Revert on failure
      setIsOnline(!value)
      Alert.alert('Error', 'Failed to update status. Please try again.')
    }
  }

  // Handle Password Change
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in both password fields.')
      return
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.')
      return
    }

    setPasswordLoading(true)
    try {
      await changeStaffPassword({ currentPassword, newPassword })
      Alert.alert('Success', 'Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to change password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Handle Logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            // Go offline before logging out to prevent assigning orders to offline driver
            if (isOnline) {
              try {
                await DeliveryService.toggleOnlineStatus(false)
              } catch (e) {
                console.error('Failed to set offline before logout', e)
              }
            }
            logout()
          }
        },
      ]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Header Section */}
          <View className="px-6 pt-6 pb-4">
            <Text className="text-3xl font-black text-gray-900 tracking-tight">Profile</Text>
          </View>

          {/* User Info Card */}
          <View className="mx-6 mb-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-6">
              <View className="w-16 h-16 bg-brand-100 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl font-black text-brand-600">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">{user?.fullName}</Text>
                <Text className="text-sm font-medium text-brand-600 uppercase tracking-wider mt-1">
                  {user?.roleName?.replace('_', ' ')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
              <Ionicons name="storefront-outline" size={20} color={colors.gray[500]} />
              <View className="ml-3">
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Branch</Text>
                <Text className="text-sm font-bold text-gray-900">{user?.branchName || 'Not Assigned'}</Text>
              </View>
            </View>
          </View>

          {/* Duty Status Toggle */}
          <View className="mx-6 mb-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-bold text-gray-900">Duty Status</Text>
              <Text className="text-sm text-gray-500 mt-1">
                {isOnline 
                  ? "You are online and ready to receive orders." 
                  : "You are offline. Go online to start your shift."}
              </Text>
            </View>
            {statusLoading ? (
              <ActivityIndicator color={colors.brand[500]} />
            ) : (
              <Switch
                value={isOnline}
                onValueChange={handleToggleStatus}
                trackColor={{ false: colors.gray[200], true: colors.brand[500] }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.gray[200]}
              />
            )}
          </View>

          {/* Change Password Section */}
          <View className="mx-6 mb-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">Change Password</Text>
            
            <View className="mb-4">
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-12">
                <Ionicons name="lock-closed-outline" size={18} color={colors.gray[400]} />
                <TextInput
                  className="flex-1 ml-3 text-sm text-gray-900 font-medium"
                  placeholder="Current Password"
                  placeholderTextColor={colors.gray[300]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Ionicons name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-12">
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.gray[400]} />
                <TextInput
                  className="flex-1 ml-3 text-sm text-gray-900 font-medium"
                  placeholder="New Password"
                  placeholderTextColor={colors.gray[300]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handlePasswordChange}
              disabled={passwordLoading}
              className={`h-12 rounded-xl items-center justify-center ${passwordLoading ? 'bg-gray-300' : 'bg-gray-900'}`}
            >
              {passwordLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-sm uppercase tracking-widest">Update Password</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <View className="mx-6">
            <TouchableOpacity
              onPress={handleLogout}
              className="h-14 rounded-2xl items-center justify-center flex-row bg-red-50 border border-red-100"
            >
              <Ionicons name="log-out-outline" size={20} color={colors.red[500]} />
              <Text className="text-red-500 font-bold text-sm uppercase tracking-widest ml-2">
                Log Out
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
