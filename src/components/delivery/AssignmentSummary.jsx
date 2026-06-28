import { View, Text } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'

/**
 * AssignmentSummary — displays stats about assigned/completed orders.
 * Updated to match the new UI design.
 */
export default function AssignmentSummary({ assignedCount }) {
  return (
    <View className="mx-6 mb-6 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex-row items-center justify-between">
      <View className="flex-row items-center">
        {/* Icon container */}
        <View className="w-14 h-14 bg-[#FFF5EB] rounded-2xl items-center justify-center mr-4">
          <MaterialCommunityIcons name="truck-delivery-outline" size={24} color={colors.brand[500]} />
        </View>
        
        {/* Text content */}
        <View>
          <Text className="text-[11px] font-bold text-[#8C9EAE] uppercase tracking-widest mb-1">
            Assigned Tasks
          </Text>
          <View className="flex-row items-baseline">
            <Text className="text-3xl font-black text-gray-900 mr-2">{assignedCount}</Text>
            <Text className="text-sm font-semibold text-[#8C9EAE]">Orders</Text>
          </View>
        </View>
      </View>
      
      {/* Pending badge */}
      <View className="bg-[#EBFFF4] px-3 py-1.5 rounded-full">
        <Text className="text-[10px] font-black text-[#10B981] uppercase tracking-wider">
          Pending
        </Text>
      </View>
    </View>
  )
}
