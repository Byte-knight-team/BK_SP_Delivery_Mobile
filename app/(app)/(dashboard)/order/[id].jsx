import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
  Modal,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { DeliveryService } from '../../../../src/api/deliveryService'
import { colors } from '../../../../src/theme/colors'
import DeliveryMapView from '../../../../src/components/delivery/DeliveryMapView'

/**
 * Order Detail Screen — handles active delivery status transitions.
 * Migrated from web frontend's DeliveryOrderDetailPage.jsx.
 */
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await DeliveryService.getActiveOrder()

      // If the active order matches this screen's ID, display it
      if (response.data && response.data.id.toString() === id) {
        setOrder(response.data)
      } else {
        // If not the active one, it was likely just completed or rejected
        router.replace('/(app)/(dashboard)')
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      Alert.alert('Error', 'Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status) => {
    setUpdating(true)
    try {
      await DeliveryService.updateDeliveryStatus(id, status)

      if (status === 'DELIVERED') {
        // Delivery complete! Go back to dashboard to get next order
        Alert.alert('Success', 'Order marked as delivered!', [
          { text: 'OK', onPress: () => router.replace('/(app)/(dashboard)') },
        ])
      } else {
        // Just updated to OUT_FOR_DELIVERY, stay on screen and refresh
        fetchOrderDetails()
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = () => {
    setCancelReason('')
    setCancelModalVisible(true)
  }

  const submitCancel = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Error', 'A reason is required to cancel an active delivery.')
      return
    }
    setCancelModalVisible(false)
    setUpdating(true)
    try {
      // For OUT_FOR_DELIVERY orders, we must call updateStatus(CANCELLED) — not rejectOrder().
      // rejectOrder() is only for ASSIGNED orders.
      // updateStatus('CANCELLED') handles the mid-route abort: reverts the order to COMPLETED
      // and fires the DELIVERY_ALERT to the manager.
      await DeliveryService.updateDeliveryStatus(id, 'CANCELLED', cancelReason.trim())
      Alert.alert('Cancelled', 'Delivery has been cancelled. The manager has been notified.', [
        { text: 'OK', onPress: () => router.replace('/(app)/(dashboard)') },
      ])
    } catch (error) {
      console.error('[submitCancel] error:', error?.response?.data || error?.message || error)
      Alert.alert(
        'Error',
        error?.response?.data?.message || error.message || 'Failed to cancel delivery'
      )
    } finally {
      setUpdating(false)
    }
  }

  const handleCallCustomer = () => {
    // In a real app, use order.customerPhone. Using dummy data to match web.
    const phoneNumber = '+94771234567'
    Linking.openURL(`tel:${phoneNumber}`).catch(() =>
      Alert.alert('Error', 'Unable to open phone dialer')
    )
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text className="text-gray-500 mt-4 font-medium">Loading details...</Text>
      </SafeAreaView>
    )
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-red-500 font-bold text-lg">Order not found</Text>
        <TouchableOpacity
          className="mt-4 bg-gray-900 px-6 py-3 rounded-xl"
          onPress={() => router.replace('/(app)/(dashboard)')}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 items-center justify-center shadow-sm"
        >
          <Ionicons name="chevron-back" size={24} color={colors.gray[900]} />
        </TouchableOpacity>
        <Text className="text-xl font-black text-gray-900 uppercase tracking-tight ml-4">
          Delivery Task
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Map View */}
        <DeliveryMapView
          customerLat={order.latitude}
          customerLng={order.longitude}
          deliveryAddress={order.deliveryAddress || order.location}
          branchLat={order.branchLatitude}
          branchLng={order.branchLongitude}
          branchName={order.branchName}
          isRedispatch={order.isRedispatch}
        />

        {/* Main Info Card */}
        <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
          <View className="flex-row justify-between items-center border-b border-gray-50 pb-4 mb-4">
            <View>
              <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                Order ID
              </Text>
              <Text className="text-lg font-black text-gray-900">
                {order.id || order.orderNumber}
              </Text>
            </View>
            <View
              className={`px-4 py-1.5 rounded-full ${
                order.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-50' : 'bg-orange-50'
              }`}
            >
              <Text
                className={`text-[10px] font-black uppercase tracking-widest ${
                  order.status === 'OUT_FOR_DELIVERY' ? 'text-blue-500' : 'text-orange-500'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>

          {/* Address */}
          <View className="flex-row mb-5">
            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-4">
              <Ionicons name="location" size={20} color={colors.blue[500]} />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                Deliver to
              </Text>
              <Text className="text-sm font-bold text-gray-700 leading-5">
                {order.deliveryAddress || order.location}
              </Text>
            </View>
          </View>

          {/* Contact */}
          <TouchableOpacity
            className="flex-row mb-5"
            activeOpacity={0.7}
            onPress={handleCallCustomer}
          >
            <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-4">
              <Ionicons name="call" size={20} color={colors.green[500]} />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                Contact Customer
              </Text>
              <Text className="text-sm font-bold text-gray-700 underline">
                {order.customerPhone || '+94 77 123 4567'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Summary */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={20} color={colors.gray[400]} />
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-3">
                Total Amount
              </Text>
            </View>
            <Text className="text-lg font-black text-gray-900">
              Rs. {order.totalAmount || order.amount?.toLocaleString() || '0'}
            </Text>
          </View>
          
          <View className={`rounded-2xl p-4 flex-row items-center justify-between ${order.paymentType === 'PAID' ? 'bg-green-50' : 'bg-orange-50'}`}>
            <View className="flex-row items-center">
              <Ionicons name="cash-outline" size={20} color={order.paymentType === 'PAID' ? colors.green[500] : colors.brand[500]} />
              <Text className={`text-xs font-bold uppercase tracking-widest ml-3 ${order.paymentType === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                Payment Status
              </Text>
            </View>
            <Text className={`text-sm font-black uppercase ${order.paymentType === 'PAID' ? 'text-green-700' : 'text-orange-700'}`}>
              {order.paymentType || 'CASH ON DELIVERY'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {order.status === 'ACCEPTED' ? (
          <TouchableOpacity
            onPress={() => updateStatus('OUT_FOR_DELIVERY')}
            disabled={updating}
            className={`flex-row items-center justify-center h-16 rounded-2xl shadow-lg ${
              updating ? 'bg-gray-400' : 'bg-gray-900'
            }`}
            style={{
              shadowColor: colors.black,
              shadowOpacity: 0.2,
              shadowOffset: { height: 4 },
              shadowRadius: 10,
            }}
          >
            {updating ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="bicycle" size={24} color="white" className="mr-3" />
                <Text className="text-white font-black uppercase tracking-widest ml-3">
                  Start Delivery
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : order.status === 'OUT_FOR_DELIVERY' ? (
          <>
            <TouchableOpacity
              onPress={() => updateStatus('DELIVERED')}
              disabled={updating}
              className={`flex-row items-center justify-center h-16 rounded-2xl shadow-lg mb-4 ${
                updating ? 'bg-green-300' : 'bg-green-500'
              }`}
              style={{
                shadowColor: colors.green[500],
                shadowOpacity: 0.3,
                shadowOffset: { height: 4 },
                shadowRadius: 10,
              }}
            >
              {updating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={24} color="white" className="mr-3" />
                  <Text className="text-white font-black uppercase tracking-widest ml-3">
                    Mark as Delivered
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              disabled={updating}
              className={`flex-row items-center justify-center h-16 rounded-2xl border ${
                updating ? 'border-red-200 bg-red-50' : 'border-red-100 bg-red-50'
              }`}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={colors.red[500]}
                style={{ marginRight: 12 }}
              />
              <Text className="text-red-500 font-black uppercase tracking-widest">
                Report Issue / Cancel
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>

      {/* Custom Prompt Modal for Android Support */}
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 24,
              padding: 24,
              elevation: 5,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 20,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: '900', color: colors.gray[900], marginBottom: 8 }}
            >
              Cancel Delivery
            </Text>
            <Text style={{ fontSize: 14, color: colors.gray[500], marginBottom: 16 }}>
              Please provide a reason for cancelling this active delivery:
            </Text>

            <TextInput
              style={{
                backgroundColor: colors.gray[50],
                borderWidth: 1,
                borderColor: colors.gray[200],
                borderRadius: 12,
                padding: 12,
                fontSize: 15,
                color: colors.gray[900],
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              placeholder="e.g. Flat tire, vehicle breakdown..."
              placeholderTextColor={colors.gray[400]}
              multiline
              value={cancelReason}
              onChangeText={setCancelReason}
              autoFocus
            />

            <View
              style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 }}
            >
              <TouchableOpacity
                onPress={() => setCancelModalVisible(false)}
                style={{ paddingHorizontal: 16, paddingVertical: 10 }}
              >
                <Text style={{ color: colors.gray[500], fontWeight: '700' }}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitCancel}
                style={{
                  backgroundColor: colors.red[500],
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
