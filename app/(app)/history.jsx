import { useEffect } from 'react'
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../src/theme/colors'
import { useDeliveryHistory } from '../../src/hooks/useDeliveryHistory'
import HistoryOrderCard from '../../src/components/delivery/HistoryOrderCard'

/**
 * History Screen — displays all past deliveries (DELIVERED & CANCELLED)
 * for the logged-in driver, sorted newest first.
 */
export default function HistoryScreen() {
  const { history, loading, error, refetch } = useDeliveryHistory()

  // Fetch on mount
  useEffect(() => {
    refetch()
  }, [])

  // ── Empty state ──────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="w-20 h-20 bg-gray-100 rounded-3xl items-center justify-center mb-5">
        <Ionicons name="time-outline" size={36} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-black text-gray-800 uppercase tracking-tight text-center">
        No History Yet
      </Text>
      <Text className="text-sm text-gray-400 mt-2 text-center leading-5">
        Your completed and cancelled deliveries will appear here.
      </Text>
    </View>
  )

  // ── Error state ──────────────────────────────────────────────────────────────
  const ErrorState = () => (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="w-20 h-20 bg-red-50 rounded-3xl items-center justify-center mb-5">
        <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
      </View>
      <Text className="text-lg font-black text-gray-800 uppercase tracking-tight text-center">
        Something went wrong
      </Text>
      <Text className="text-sm text-gray-400 mt-2 text-center leading-5">{error}</Text>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* ── Header ── */}
      <View className="px-6 pt-2 pb-5">
        <Text className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Delivery History
        </Text>
        <Text className="text-sm text-gray-400 mt-1">
          {history.length > 0
            ? `${history.length} past ${history.length === 1 ? 'delivery' : 'deliveries'}`
            : 'All your past deliveries'}
        </Text>
      </View>

      {/* ── Content ── */}
      {loading && history.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand?.[500] || '#F97316'} />
        </View>
      ) : error ? (
        <ErrorState />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <HistoryOrderCard item={item} />}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={history.length === 0 ? { flex: 1 } : { paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor={colors.brand?.[500] || '#F97316'}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}
