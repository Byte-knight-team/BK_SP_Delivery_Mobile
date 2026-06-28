import { useState, useEffect, useCallback } from 'react'
import { DeliveryService } from '../api/deliveryService'
import { POLLING_INTERVAL_MS } from '../utils/constants'
import { useAuth } from '../context/AuthContext'

/**
 * Hook to fetch and poll for the driver's active order.
 *
 * In the web version, this was bundled into the Dashboard page state.
 * Extracted into a hook here for cleaner mobile architecture.
 */
export const useActiveOrder = () => {
  const { isAuthenticated } = useAuth()
  const [activeOrder, setActiveOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchActiveOrder = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await DeliveryService.getActiveOrder()
      setActiveOrder(response.data || null)
    } catch (err) {
      console.error('Failed to fetch active order:', err)
      setActiveOrder(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchActiveOrder()
    const interval = setInterval(fetchActiveOrder, POLLING_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchActiveOrder])

  return {
    activeOrder,
    loading,
    refetch: fetchActiveOrder,
  }
}
