import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { DeliveryService } from '../../api/deliveryService'
import { colors } from '../../theme/colors'
import { fonts } from '../../theme/fonts'

/**
 * OrderActionCard — displays a single assigned order with Accept/Reject actions.
 * Migrated from web frontend's OrderActionCard.jsx.
 *
 * Reject flow uses a custom Modal + TextInput instead of Alert.prompt()
 * because Alert.prompt() is iOS-only and silently does nothing on Android.
 */
export default function OrderActionCard({ order, onActionComplete }) {
  const [loading, setLoading] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

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

  const openRejectModal = () => {
    setRejectReason('')
    setRejectModalVisible(true)
  }

  const closeRejectModal = () => {
    setRejectModalVisible(false)
    setRejectReason('')
  }

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Required', 'A reason is required to reject an order.')
      return
    }
    closeRejectModal()
    setLoading(true)
    try {
      await DeliveryService.rejectOrder(order.id, rejectReason.trim())
      onActionComplete()
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to reject order')
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Reject reason modal ──────────────────────────────────────────────── */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeRejectModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Ionicons name="close-circle" size={22} color={colors.red[500]} />
              </View>
              <Text style={styles.modalTitle}>Reject Order</Text>
            </View>

            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejecting Order #{order.id}.
            </Text>

            {/* Text input */}
            <TextInput
              style={styles.input}
              placeholder="e.g. Too far from my location..."
              placeholderTextColor={colors.gray[300]}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              maxLength={200}
              autoFocus
              textAlignVertical="top"
            />

            <Text style={styles.charCount}>{rejectReason.length}/200</Text>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={closeRejectModal}
                style={styles.cancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmReject}
                style={[styles.confirmBtn, !rejectReason.trim() && styles.confirmBtnDisabled]}
                activeOpacity={0.8}
                disabled={!rejectReason.trim()}
              >
                <Text style={styles.confirmBtnText}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Order card ───────────────────────────────────────────────────────── */}
      <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100 mx-6">
        {/* RE-DISPATCH BADGE */}
        {order.isRedispatch && (
          <View className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3 flex-row items-center gap-2">
            <Ionicons name="alert-circle" size={16} color={colors.red[500]} />
            <Text className="text-red-700 font-bold text-xs flex-1">
              RE-DISPATCH — Pick up from restaurant first
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-4">
            <Text className="text-lg font-black text-gray-900 mb-1">Order #{order.id}</Text>
            <Text className="text-sm font-medium text-gray-500">{order.deliveryAddress}</Text>
          </View>
          <View className="bg-orange-50 px-3 py-1.5 rounded-full">
            <Text className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              {order.status}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center bg-gray-50 p-3 rounded-2xl mb-3">
          <Ionicons name="person-outline" size={16} color={colors.gray[500]} />
          <Text className="text-sm font-medium text-gray-700 ml-2 flex-1">
            {order.customerName}
          </Text>
          <Text className="text-sm font-bold text-gray-900">{order.customerPhone}</Text>
        </View>

        <View className={`flex-row items-center p-3 rounded-2xl mb-5 ${order.paymentType === 'PAID' ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}>
          <Ionicons name="cash-outline" size={16} color={order.paymentType === 'PAID' ? colors.green[500] : colors.brand[500]} />
          <Text className={`text-sm font-bold ml-2 uppercase ${order.paymentType === 'PAID' ? 'text-green-700' : 'text-orange-700'}`}>
            {order.paymentType || 'CASH ON DELIVERY'}
          </Text>
          <View className="flex-1 items-end">
            <Text className="text-sm font-black text-gray-900">Rs. {order.amount?.toLocaleString() || '0'}</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={openRejectModal}
            disabled={loading}
            className="flex-1 bg-red-50 py-4 rounded-2xl items-center justify-center border border-red-100"
          >
            <Text className="text-red-600 font-bold text-sm uppercase tracking-widest">Reject</Text>
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
    </>
  )
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.red[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.gray[900],
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[500],
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.gray[900],
    minHeight: 88,
    backgroundColor: colors.gray[50],
  },
  charCount: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.gray[100],
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.gray[700],
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.red[500],
  },
  confirmBtnDisabled: {
    backgroundColor: colors.red[100],
  },
  confirmBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
})
