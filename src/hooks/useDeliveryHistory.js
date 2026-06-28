import { useState, useCallback } from 'react'
import { DeliveryService } from '../api/deliveryService'

/**
 * useDeliveryHistory — manages fetching and state for the driver's delivery history.
 * Supports manual refresh (e.g., pull-to-refresh).
 */
export function useDeliveryHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await DeliveryService.getHistory()
      // Backend wraps all responses in ApiResponse { success, message, data: [...] }
      const list = data?.data
      setHistory(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.message || 'Failed to load delivery history.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { history, loading, error, refetch: fetchHistory }
}
