import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'

/**
 * Order Detail Screen — placeholder until Phase 6 implementation.
 * Will display: order info, address, contact, status transitions.
 */
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams()

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Order Detail
        </Text>
        <Text className="text-sm text-gray-400 mt-2 text-center">
          Order #{id} — details will appear here.
        </Text>
      </View>
    </SafeAreaView>
  )
}
