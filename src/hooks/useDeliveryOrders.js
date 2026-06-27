import { useState, useEffect, useCallback } from 'react'
import { DeliveryService } from '../api/deliveryService'
import { POLLING_INTERVAL_MS } from '../utils/constants'
import { useAuth } from '../context/AuthContext'

/**
 * Hook to fetch and poll for assigned delivery orders.
 *
 * Migrated from web frontend's useDeliveryOrders.js
 * Identical logic, but polls using the mobile POLLING_INTERVAL_MS constant.
 */
export const useDeliveryOrders = () => {
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!isAuthenticated) return

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else if (data.length === 0) {
        setLoading(true)
      }
      
      const response = await DeliveryService.getAssignedOrders()
      setData(response.data || [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch assigned orders')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [isAuthenticated, data.length])

  useEffect(() => {
    fetchOrders()
    // Poll for new assignments periodically
    const interval = setInterval(fetchOrders, POLLING_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchOrders])

  return {
    orders: data,
    loading,
    refreshing,
    error,
    refetch: () => fetchOrders(true),
  }
}
