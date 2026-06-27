import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'

/**
 * AssignmentSummary — displays stats about assigned/completed orders.
 * Migrated from web frontend's AssignmentSummary.jsx.
 */
export default function AssignmentSummary({ assignedCount, completedCount = 0 }) {
  return (
    <View className="flex-row mx-6 mb-6">
      <View className="flex-1 bg-white rounded-3xl p-5 mr-3 shadow-sm border border-gray-100">
        <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mb-3">
          <Ionicons name="list-outline" size={20} color={colors.blue[500]} />
        </View>
        <Text className="text-3xl font-black text-gray-900">{assignedCount}</Text>
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
          Assigned
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mb-3">
          <Ionicons name="checkmark-done-outline" size={20} color={colors.green[500]} />
        </View>
        <Text className="text-3xl font-black text-gray-900">{completedCount}</Text>
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
          Completed
        </Text>
      </View>
    </View>
  )
}
