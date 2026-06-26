import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

/**
 * Dashboard Screen — placeholder until Phase 6 implementation.
 * Will display: ProfileHeader, AssignmentSummary, OrderActionCard list.
 */
export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Dashboard
        </Text>
        <Text className="text-sm text-gray-400 mt-2 text-center">
          Assigned orders will appear here.
        </Text>
      </View>
    </SafeAreaView>
  )
}
