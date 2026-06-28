import apiClient from './apiClient'

/**
 * DeliveryService provides methods to interact with the backend delivery system.
 *
 * Migrated from web frontend's apis/delivery/DeliveryService.js
 * Uses apiClient (Axios) instead of raw fetch + authFetch().
 *
 * All methods call the same backend endpoints — no backend changes required.
 * JWT token is attached automatically by apiClient's request interceptor.
 */

const BASE_PATH = '/api/delivery'

export const DeliveryService = {
  /**
   * Fetches all orders currently assigned to the logged-in delivery driver.
   * Used to populate the driver's Assigned Orders list on the Dashboard.
   *
   * Endpoint: GET /api/delivery/orders/assigned
   * @returns {Promise<{ data: Array }>} List of assigned orders.
   */
  getAssignedOrders: async () => {
    const response = await apiClient.get(`${BASE_PATH}/orders/assigned`)
    return response.data
  },

  /**
   * Retrieves the single order that the driver is currently actively delivering.
   * Used for the Active Order Banner and Order Detail screen.
   *
   * Endpoint: GET /api/delivery/orders/active
   * @returns {Promise<{ data: Object|null }>} The active order details or null.
   */
  getActiveOrder: async () => {
    const response = await apiClient.get(`${BASE_PATH}/orders/active`)
    return response.data
  },

  /**
   * Confirms that the driver has accepted a newly assigned order.
   * Transitions the order status from ASSIGNED → ACCEPTED.
   *
   * Endpoint: POST /api/delivery/orders/{orderId}/accept
   * @param {string|number} orderId - Unique identifier of the order.
   * @returns {Promise<Object>} Updated order status.
   */
  acceptOrder: async (orderId) => {
    const response = await apiClient.post(`${BASE_PATH}/orders/${orderId}/accept`)
    return response.data
  },

  /**
   * Rejects an assigned order with a specific reason.
   * May trigger a re-assignment to another available driver on the backend.
   *
   * Endpoint: POST /api/delivery/orders/{orderId}/reject
   * @param {string|number} orderId - Unique identifier of the order.
   * @param {string} reason - The justification for rejecting the delivery.
   * @returns {Promise<Object>} Confirmation of rejection.
   */
  rejectOrder: async (orderId, reason) => {
    const response = await apiClient.post(`${BASE_PATH}/orders/${orderId}/reject`, {
      reason,
    })
    return response.data
  },

  /**
   * Updates the delivery status (e.g., OUT_FOR_DELIVERY, DELIVERED).
   * Directly impacts the customer's real-time order tracking status.
   *
   * Endpoint: POST /api/delivery/orders/{orderId}/status
   * @param {string|number} orderId - Unique identifier of the order.
   * @param {string} status - The new DeliveryStatus enum value.
   * @returns {Promise<Object>} The updated delivery entity.
   */
  updateDeliveryStatus: async (orderId, status) => {
    const response = await apiClient.post(`${BASE_PATH}/orders/${orderId}/status`, {
      status,
    })
    return response.data
  },

  /**
   * Retrieves the current online/offline status of the logged-in driver.
   *
   * Endpoint: GET /api/delivery/status
   * @returns {Promise<{ isOnline: boolean }>}
   */
  getOnlineStatus: async () => {
    const response = await apiClient.get(`${BASE_PATH}/status`)
    return response.data
  },

  /**
   * Toggles the online/offline availability of the logged-in driver.
   *
   * Endpoint: POST /api/delivery/status/toggle
   * @param {boolean} isOnline - The new online status.
   * @returns {Promise<{ message: string, isOnline: boolean }>}
   */
  toggleOnlineStatus: async (isOnline) => {
    const response = await apiClient.post(`${BASE_PATH}/status/toggle`, {
      isOnline,
    })
    return response.data
  },

  /**
   * Retrieves the delivery history (DELIVERED & CANCELLED) for the logged-in driver.
   *
   * Endpoint: GET /api/delivery/orders/history
   * @returns {Promise<Array>} List of historical delivery records.
   */
  getHistory: async () => {
    const response = await apiClient.get(`${BASE_PATH}/orders/history`)
    return response.data
  },
}
