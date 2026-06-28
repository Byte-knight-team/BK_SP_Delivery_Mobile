import { View, Text, TouchableOpacity, LayoutAnimation } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'

/**
 * HistoryOrderCard — expandable card for a single past delivery.
 *
 * Collapsed: order number, customer name, time, status badge.
 * Expanded:  address, amount, phone, cancellation reason (if any).
 */
export default function HistoryOrderCard({ item }) {
  const [expanded, setExpanded] = useState(false)

  const isDelivered = item.status === 'DELIVERED'

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded((prev) => !prev)
  }

  const formatTime = (iso) => {
    if (!iso) return '—'
    const date = new Date(iso)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={toggle}
      className="bg-white rounded-3xl mb-3 mx-6 shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* ── Collapsed row ── */}
      <View className="flex-row items-center px-5 py-4">
        {/* Status dot */}
        <View
          className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: isDelivered ? '#DCFCE7' : '#FEE2E2' }}
        >
          <Ionicons
            name={isDelivered ? 'checkmark-circle' : 'close-circle'}
            size={22}
            color={isDelivered ? '#16A34A' : '#DC2626'}
          />
        </View>

        {/* Order info */}
        <View className="flex-1">
          <Text className="text-sm font-black text-gray-900">
            {item.orderNumber || `#${item.orderId}`}
          </Text>
          <Text className="text-xs font-medium text-gray-500 mt-0.5" numberOfLines={1}>
            {item.customerName || 'Unknown Customer'}
          </Text>
        </View>

        {/* Right side: time + badge + chevron */}
        <View className="items-end ml-2">
          <Text className="text-xs text-gray-400 mb-1.5">{formatTime(item.completedAt)}</Text>
          <View
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: isDelivered ? '#DCFCE7' : '#FEE2E2' }}
          >
            <Text
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: isDelivered ? '#16A34A' : '#DC2626' }}
            >
              {isDelivered ? 'Delivered' : 'Cancelled'}
            </Text>
          </View>
        </View>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.gray?.[400] || '#9CA3AF'}
          style={{ marginLeft: 10 }}
        />
      </View>

      {/* ── Expanded detail panel ── */}
      {expanded && (
        <View className="px-5 pb-4 border-t border-gray-100">
          <View className="mt-3 gap-2.5">
            {/* Address */}
            <View className="flex-row items-start gap-2">
              <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginTop: 1 }} />
              <Text className="text-sm text-gray-600 flex-1 leading-5">
                {item.deliveryAddress || '—'}
              </Text>
            </View>

            {/* Phone */}
            {item.customerPhone ? (
              <View className="flex-row items-center gap-2">
                <Ionicons name="call-outline" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600">{item.customerPhone}</Text>
              </View>
            ) : null}

            {/* Amount */}
            {item.amount != null ? (
              <View className="flex-row items-center gap-2">
                <Ionicons name="cash-outline" size={16} color="#6B7280" />
                <Text className="text-sm font-bold text-gray-800">
                  Rs. {Number(item.amount).toFixed(2)}
                </Text>
              </View>
            ) : null}

            {/* Cancellation reason */}
            {!isDelivered && item.cancelledReason ? (
              <View className="mt-1 bg-red-50 rounded-2xl px-4 py-3">
                <Text className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
                  Cancellation Reason
                </Text>
                <Text className="text-sm text-red-700 leading-5">{item.cancelledReason}</Text>
              </View>
            ) : null}
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}
