import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { DeliveryService } from '../../api/deliveryService'
import { colors } from '../../theme/colors'

/**
 * OrderActionCard — displays a single assigned order with Accept/Reject actions.
 * Migrated from web frontend's OrderActionCard.jsx.
 */
export default function OrderActionCard({ order, onActionComplete }) {
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    try {
      await DeliveryService.acceptOrder(order.id)
      onActionComplete()
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to accept order')
      setLoading(false)
    }
  }

  const handleReject = () => {
    Alert.prompt(
      'Reject Order',
      'Please enter a reason for rejecting this order:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason) {
              Alert.alert('Error', 'A reason is required to reject an order.')
              return
            }
            setLoading(true)
            try {
              await DeliveryService.rejectOrder(order.id, reason)
              onActionComplete()
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to reject order')
              setLoading(false)
            }
          },
        },
      ],
      'plain-text'
    )
  }

  return (
    <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100 mx-6">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-black text-gray-900 mb-1">
            Order #{order.id}
          </Text>
          <Text className="text-sm font-medium text-gray-500">
            {order.deliveryAddress}
          </Text>
        </View>
        <View className="bg-orange-50 px-3 py-1.5 rounded-full">
          <Text className="text-xs font-bold text-orange-600 uppercase tracking-widest">
            {order.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center bg-gray-50 p-3 rounded-2xl mb-5">
        <Ionicons name="person-outline" size={16} color={colors.gray[500]} />
        <Text className="text-sm font-medium text-gray-700 ml-2 flex-1">
          {order.customerName}
        </Text>
        <Text className="text-sm font-bold text-gray-900">
          {order.customerPhone}
        </Text>
      </View>

      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={handleReject}
          disabled={loading}
          className="flex-1 bg-red-50 py-4 rounded-2xl items-center justify-center border border-red-100"
        >
          <Text className="text-red-600 font-bold text-sm uppercase tracking-widest">
            Reject
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAccept}
          disabled={loading}
          className="flex-1 bg-gray-900 py-4 rounded-2xl items-center justify-center flex-row shadow-sm"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="white" style={{ marginRight: 6 }} />
              <Text className="text-white font-bold text-sm uppercase tracking-widest">
                Accept
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}
