import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../src/theme/colors'

/**
 * History Screen — placeholder (matches web's ComingSoonPage).
 * Will be implemented in a future phase.
 */
export default function HistoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-20 h-20 bg-brand-50 rounded-3xl items-center justify-center mb-6">
          <Ionicons name="time-outline" size={40} color={colors.brand[500]} />
        </View>
        <Text className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Delivery History
        </Text>
        <Text className="text-sm text-gray-400 mt-2 text-center">
          Your completed deliveries will appear here.
        </Text>
        <View className="mt-6 bg-brand-50 px-5 py-2 rounded-full">
          <Text className="text-xs font-black text-brand-500 uppercase tracking-widest">
            Coming Soon
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
