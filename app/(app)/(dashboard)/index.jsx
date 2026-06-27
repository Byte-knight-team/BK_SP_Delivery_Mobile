import { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

// Hooks
import { useAuth } from '../../../src/context/AuthContext'
import { useDeliveryOrders } from '../../../src/hooks/useDeliveryOrders'
import { useActiveOrder } from '../../../src/hooks/useActiveOrder'

// Components
import ActiveOrderBanner from '../../../src/components/delivery/ActiveOrderBanner'
import AssignmentSummary from '../../../src/components/delivery/AssignmentSummary'
import OrderActionCard from '../../../src/components/delivery/OrderActionCard'
import ProfileHeader from '../../../src/components/delivery/ProfileHeader'
import { colors } from '../../../src/theme/colors'

/**
 * Dashboard Screen — The main hub for delivery staff.
 *
 * Migrated from web frontend's DeliveryDashboardPage.jsx.
 * Assembles the ActiveOrderBanner, AssignmentSummary, and OrderActionCard list.
 */
export default function DashboardScreen() {
  const { user } = useAuth()
  
  // Custom hooks for data fetching and polling
  const { 
    orders, 
    loading: ordersLoading, 
    refreshing: ordersRefreshing,
    refetch: refetchOrders 
  } = useDeliveryOrders()
  
  const { 
    activeOrder, 
    refetch: refetchActiveOrder 
  } = useActiveOrder()

  // Force a refetch whenever the dashboard comes into focus
  useFocusEffect(
    useCallback(() => {
      refetchOrders()
      refetchActiveOrder()
    }, [refetchOrders, refetchActiveOrder])
  )

  const handleRefresh = async () => {
    await Promise.all([refetchOrders(), refetchActiveOrder()])
  }

  // Filter orders to only show those that need driver action (ASSIGNED)
  const assignedOrders = orders.filter((o) => o.status === 'ASSIGNED')

  // In a full implementation, completedCount would come from the backend or history hook
  const completedCount = 0

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-6 pb-6 flex-row justify-between items-end">
        <View>
          <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">
            {user?.branchName || 'No Branch'}
          </Text>
          <Text className="text-3xl font-black text-gray-900 tracking-tight">
            Dashboard
          </Text>
        </View>
        <View className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100">
          <Ionicons name="bicycle" size={24} color={colors.brand[500]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={ordersRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        {/* Welcome banner with live clock */}
        <ProfileHeader name={user?.fullName} />

        {/* Active Order Banner — only shows if the driver has an active delivery */}
        <ActiveOrderBanner order={activeOrder} />

        {/* Stats Summary */}
        <AssignmentSummary
          assignedCount={assignedOrders.length}
          completedCount={completedCount}
        />

        {/* Pending Assignments List */}
        <View className="px-6 mb-4 mt-2">
          <Text className="text-xl font-black text-gray-900">
            Pending Assignments
          </Text>
        </View>

        {ordersLoading && !ordersRefreshing ? (
          <View className="py-10 items-center justify-center">
            <ActivityIndicator size="large" color={colors.brand[500]} />
          </View>
        ) : assignedOrders.length > 0 ? (
          assignedOrders.map((order) => (
            <OrderActionCard
              key={order.id}
              order={order}
              onActionComplete={handleRefresh}
            />
          ))
        ) : (
          <View className="mx-6 bg-white rounded-3xl p-10 items-center justify-center border border-dashed border-gray-200">
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.gray[300]} />
            <Text className="text-lg font-bold text-gray-400 mt-4 text-center">
              No pending assignments.
            </Text>
            <Text className="text-sm text-gray-400 text-center mt-1">
              Pull to refresh or wait for a new order.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
