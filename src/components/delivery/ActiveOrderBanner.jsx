import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'

/**
 * ActiveOrderBanner — displays the currently active delivery order at the top of the dashboard.
 * Migrated from web frontend's ActiveOrderBanner.jsx.
 */
export default function ActiveOrderBanner({ order }) {
  if (!order) return null

  const handlePress = () => {
    router.push(`/(app)/(dashboard)/order/${order.id}`)
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      className="mx-6 mb-6 bg-brand-500 rounded-3xl p-5 shadow-sm shadow-brand-500/30"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center bg-white/20 px-3 py-1 rounded-full">
          <Ionicons name="bicycle" size={16} color="white" />
          <Text className="text-white text-xs font-bold ml-1 uppercase tracking-widest">
            Active Delivery
          </Text>
        </View>
        <Text className="text-white/80 font-bold text-xs uppercase">#{order.id}</Text>
      </View>

      <Text className="text-white text-xl font-black mb-1">{order.deliveryAddress}</Text>
      <Text className="text-brand-100 text-sm font-medium mb-4">
        {order.customerName} • {order.customerPhone}
      </Text>

      <View className="flex-row items-center justify-between bg-white/10 rounded-2xl p-3">
        <Text className="text-white font-bold uppercase tracking-widest text-xs">
          Status: {order.status?.replace(/_/g, ' ')}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="white" />
      </View>
    </TouchableOpacity>
  )
}
